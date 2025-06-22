import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createStapeAPI } from '@/lib/stape';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    // Criar instância da API do Stape (usando API Key da empresa)
    const stapeAPI = createStapeAPI();

    // Listar containers
    const containers = await stapeAPI.listContainers();

    return NextResponse.json({
      success: true,
      containers: containers
    });

  } catch (error: any) {
    console.error('Erro na API do Stape:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro desconhecido ocorreu com a API do Stape.' 
    }, { status: 500 });
  }
} 