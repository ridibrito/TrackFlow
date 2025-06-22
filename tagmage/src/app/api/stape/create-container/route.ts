import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createStapeAPI } from '@/lib/stape';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticação
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { projectId, customDomain } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'ID do projeto é obrigatório' }, { status: 400 });
    }

    // Verificar se o projeto pertence ao usuário
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    // Verificar se já existe um container server-side
    if (project.stape_container_id) {
      return NextResponse.json({ error: 'Container server-side já existe para este projeto' }, { status: 400 });
    }

    // Criar container no Stape.io
    const stapeAPI = createStapeAPI();
    
    const containerName = `${project.name} - Server-Side`;
    const defaultDomain = `${project.name.toLowerCase().replace(/\s+/g, '-')}.stape.io`;
    
    const containerData = {
      name: containerName,
      domain: defaultDomain,
      description: `Container server-side para ${project.name}`,
      ...(customDomain && { customDomain })
    };

    const container = await stapeAPI.createContainer(containerData);

    // Se foi fornecido um domínio próprio, configurá-lo
    let finalDomain = container.domain;
    if (customDomain) {
      try {
        const customDomainResult = await stapeAPI.configureCustomDomain(container.id, customDomain);
        finalDomain = customDomainResult.domain;
      } catch (error) {
        console.error('Erro ao configurar domínio próprio:', error);
        // Continuar com o domínio padrão se falhar
      }
    }

    // Atualizar projeto no banco
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        stape_container_id: container.id,
        stape_domain: finalDomain,
        stape_configured: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao atualizar projeto' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      container: {
        id: container.id,
        name: container.name,
        domain: finalDomain,
        customDomain: customDomain || null
      }
    });

  } catch (error: any) {
    console.error('Erro ao criar container server-side:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 