import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getProjectById, updateProject } from '@/lib/supabase/projects';

export async function POST(request: Request) {
  const { projectId, providerToken } = await request.json();

  if (!projectId || !providerToken) {
    return NextResponse.json({ error: 'Project ID and provider token are required.' }, { status: 400 });
  }
  
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    // 1. Configurar o cliente da API do Google
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: providerToken });
    const tagmanager = google.tagmanager({ version: 'v2', auth: oauth2Client });

    // 2. Obter detalhes do projeto
    const project = await getProjectById(projectId, session.user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // 3. Listar contas GTM do usuário
    const { data: { account: accounts } } = await tagmanager.accounts.list();

    if (!accounts) {
        throw new Error('Could not retrieve GTM accounts.');
    }

    // 4. Encontrar a primeira conta GTM disponível do usuário
    const firstAccount = accounts[0];

    if (!firstAccount?.accountId) {
        throw new Error('Nenhuma conta GTM encontrada. Por favor, crie uma conta no Google Tag Manager primeiro.');
    }
    
    // 5. Criar o contêiner na primeira conta encontrada
    const { data: newContainer } = await tagmanager.accounts.containers.create({
        parent: `accounts/${firstAccount.accountId}`,
        requestBody: {
            name: project.name,
            usageContext: ['web']
        }
    });

    if (!newContainer?.publicId) {
        throw new Error('Failed to create GTM container.');
    }

    // 6. Criar um workspace padrão
    await tagmanager.accounts.containers.workspaces.create({
      parent: `accounts/${firstAccount.accountId}/containers/${newContainer.containerId}`,
      requestBody: {
        name: `Default Workspace for ${project.url}`
      }
    });

    // 7. Salvar o ID do contêiner no projeto do Supabase
    const { data: updatedProject, error: updateError } = await updateProject(
        project.id,
        { gtm_id: newContainer.publicId },
        session.user.id
    );

    if (updateError) {
        // Tentar reverter a criação do contêiner se a atualização do DB falhar? (complexo)
        // Por agora, apenas logamos o erro.
        console.error('Failed to update project with GTM ID:', updateError);
        throw new Error('Failed to save GTM ID to project.');
    }

    return NextResponse.json(updatedProject);

  } catch (error: any) {
    console.error('GTM API Error:', error);
    return NextResponse.json({ error: error.message || 'An unknown error occurred with the GTM API.' }, { status: 500 });
  }
} 