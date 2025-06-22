'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Trocar o código pela sessão
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro na autenticação:', error);
          router.push('/painel');
          return;
        }

        if (session) {
          // Verificar se há uma URL de redirecionamento salva
          const redirectUrl = localStorage.getItem('post_auth_redirect');
          
          if (redirectUrl) {
            localStorage.removeItem('post_auth_redirect');
            router.push(redirectUrl);
          } else {
            router.push('/painel');
          }
        } else {
          router.push('/painel');
        }
      } catch (error) {
        console.error('Erro no callback:', error);
        router.push('/painel');
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Conectando com Google...</p>
      </div>
    </div>
  );
} 