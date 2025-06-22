import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';

// Esta função agora cria e retorna uma nova instância do cliente Supabase a cada chamada.
export const getSupabase = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Se as variáveis de ambiente estiverem presentes, crie e retorne o cliente real.
  if (supabaseUrl && supabaseAnonKey) {
    return createClientComponentClient();
  }

  // Se não, exiba o aviso e retorne um cliente "mock" para evitar que a aplicação quebre.
  console.warn('⚠️ Supabase não configurado. As variáveis de ambiente não foram encontradas.');
  
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithPassword: () => Promise.resolve({ data: { session: null }, error: new Error('Mock Supabase: signInWithPassword') }),
      // Adicione outros métodos mockados conforme necessário
    },
    from: (table: string) => ({
      select: () => Promise.resolve({ data: [], error: new Error(`Mock Supabase: Tentativa de SELECT em ${table}`) }),
      insert: (data: any) => Promise.resolve({ data: null, error: new Error(`Mock Supabase: Tentativa de INSERT em ${table}`) }),
      update: (data: any) => Promise.resolve({ data: null, error: new Error(`Mock Supabase: Tentativa de UPDATE em ${table}`) }),
      delete: () => Promise.resolve({ data: null, error: new Error(`Mock Supabase: Tentativa de DELETE em ${table}`) }),
    }),
    // Adicione outros métodos que você usa aqui para evitar erros
  } as unknown as SupabaseClient;
}; 