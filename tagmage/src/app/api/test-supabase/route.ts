import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = getSupabase();
    
    // Teste simples de conexão
    const { data, error } = await supabase.from('test').select('*').limit(1);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase conectado com sucesso',
      hasError: !!error,
      error: error?.message
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro ao conectar com Supabase',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 