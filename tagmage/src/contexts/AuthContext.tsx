'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError, Provider, Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateUser: (newUserData: { data: { [key: string]: any; } }) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  signInWithSocial: (provider: Provider) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: (scopes: string[], redirectUrl?: string) => Promise<{ error: AuthError | null; }>;
  signInWithGooglePopup: (scopes: string[]) => Promise<{ error: AuthError | null; }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabase] = useState(() => getSupabase());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Verifica se a sessão atual do usuário já existe
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUser = async (newUserData: { data: { [key: string]: any; } }) => {
    const { data: { user }, error } = await supabase.auth.updateUser(newUserData);
    if (!error) {
      setUser(user);
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const signInWithSocial = async (provider: Provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signInWithGoogle = async (scopes: string[], redirectUrl?: string) => {
    const redirectTo = redirectUrl || `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: scopes.join(' '),
        redirectTo,
        queryParams: {
          prompt: 'consent',
          access_type: 'offline'
        }
      },
    });
    return { error };
  };

  const signInWithGooglePopup = async (scopes: string[]) => {
    const redirectTo = `${window.location.origin}/auth/popup-callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: scopes.join(' '),
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      return { error };
    }

    if (data.url) {
      return new Promise<{ error: AuthError | null }>((resolve) => {
        const popup = window.open(data.url, 'google-auth', 'width=600,height=700,scrollbars=yes,resizable=yes');
        
        if (!popup) {
          resolve({ error: { message: 'Popup bloqueado. Permita popups para este site.' } as AuthError });
          return;
        }

        // Verificar se o popup foi fechado
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            clearInterval(checkAuth);
            resolve({ error: { message: 'Autenticação cancelada.' } as AuthError });
          }
        }, 1000);

        // Verificar se a autenticação foi concluída
        const checkAuth = setInterval(async () => {
          try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (currentSession?.provider_token) {
              clearInterval(checkClosed);
              clearInterval(checkAuth);
              popup.close();
              resolve({ error: null });
            }
          } catch (err) {
            // Continuar verificando
          }
        }, 500);

        // Timeout após 5 minutos
        setTimeout(() => {
          clearInterval(checkClosed);
          clearInterval(checkAuth);
          popup.close();
          resolve({ error: { message: 'Tempo limite excedido.' } as AuthError });
        }, 300000);
      });
    }
    
    return { error: null };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
    resetPassword,
    updatePassword,
    signInWithSocial,
    signInWithGoogle,
    signInWithGooglePopup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
