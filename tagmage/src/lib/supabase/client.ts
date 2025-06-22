import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variável para armazenar a instância do Supabase (singleton)
let supabaseInstance: SupabaseClient | null = null;

// Função para obter o cliente Supabase. Ela cria o cliente apenas uma vez.
export const getSupabase = () => {
  // Se a instância já existe, retorne-a
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Se as variáveis de ambiente estiverem presentes, crie o cliente real
  if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    // Se não, exiba o aviso e crie um cliente "mock" para evitar que a aplicação quebre
    console.warn('⚠️ Supabase não configurado. As variáveis de ambiente não foram encontradas.');
    
    supabaseInstance = {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithPassword: (credentials: any) => Promise.resolve({ data: { user: null, session: null }, error: new Error('Mock Supabase: Autenticação não configurada') }),
        signUp: (credentials: any) => Promise.resolve({ data: { user: null, session: null }, error: new Error('Mock Supabase: Autenticação não configurada') }),
        updateUser: (data: any) => Promise.resolve({ data: { user: null }, error: new Error('Mock Supabase: Autenticação não configurada') }),
        resetPasswordForEmail: (email: string) => Promise.resolve({ data: {}, error: new Error('Mock Supabase: Autenticação não configurada') }),
        signInWithOAuth: (provider: any) => Promise.resolve({ data: {}, error: new Error('Mock Supabase: Autenticação não configurada') }),
      },
      storage: {
        from: (bucket: string) => ({
          upload: (path: string, file: File) => Promise.resolve({ data: null, error: new Error(`Mock Supabase: Tentativa de upload para ${bucket}/${path}`) }),
          getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
        }),
      },
      from: (table: string) => ({
        select: () => Promise.resolve({ data: [], error: new Error(`Mock Supabase: Tentativa de SELECT em ${table}`) }),
        insert: (data: any) => Promise.resolve({ data: null, error: new Error(`Mock Supabase: Tentativa de INSERT em ${table}`) }),
        update: (data: any) => Promise.resolve({ data: null, error: new Error(`Mock Supabase: Tentativa de UPDATE em ${table}`) }),
        delete: () => Promise.resolve({ data: null, error: new Error(`Mock Supabase: Tentativa de DELETE em ${table}`) }),
      }),
      // Adicione outros métodos que você usa aqui para evitar erros
    } as unknown as SupabaseClient;
  }
  
  return supabaseInstance;
}; 