import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { createTagManagerClient } from '@/lib/google-auth';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: No auth header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { providerToken } = await request.json();
    
    if (!providerToken) {
      return NextResponse.json({ 
        error: 'Google Provider Token é obrigatório. Por favor, faça login novamente com o Google.',
        code: 'MISSING_PROVIDER_TOKEN'
      }, { status: 400 });
    }

    console.log('🔍 Buscando containers GTM...');

    // Criar cliente Tag Manager
    const tagmanager = createTagManagerClient(providerToken);

    const { data: { account: accounts } } = await tagmanager.accounts.list();

    if (!accounts || accounts.length === 0) {
      console.log('ℹ️ Nenhuma conta GTM encontrada');
      return NextResponse.json({ containers: [] });
    }

    console.log(`📊 Processando ${accounts.length} contas GTM...`);
    const allContainers = [];

    for (const account of accounts) {
      if (account.path) {
        try {
          const { data: { container: containers } } = await tagmanager.accounts.containers.list({
            parent: account.path,
          });
          
          if (containers) {
            allContainers.push(...containers.map(c => ({
              accountId: account.accountId,
              accountName: account.name,
              containerId: c.containerId,
              name: c.name,
            })));
          }
        } catch (containerError: any) {
          console.error(`❌ Erro ao listar containers da conta ${account.name}:`, containerError);
          // Continuar com outras contas mesmo se uma falhar
        }
      }
    }

    console.log(`✅ ${allContainers.length} containers encontrados`);
    return NextResponse.json({ containers: allContainers });

  } catch (error: any) {
    console.error('❌ Erro geral ao listar containers GTM:', error);
    
    // Detecta erros específicos da API do Google
    if (error.response && error.response.data && error.response.data.error) {
       const googleError = error.response.data.error;
       console.error('🔍 Detalhes do erro Google:', googleError);
       
       return NextResponse.json({ 
           error: 'Erro na API do Google', 
           code: 'GOOGLE_API_ERROR',
           details: googleError.message,
           originalError: googleError
       }, { status: googleError.code || 500 });
    }
    
    return NextResponse.json({ 
      error: 'Falha ao listar containers GTM', 
      code: 'UNKNOWN_ERROR',
      details: error.message 
    }, { status: 500 });
  }
} 