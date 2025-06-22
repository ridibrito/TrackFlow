import { NextResponse } from 'next/server';
import { google, tagmanager_v2 } from 'googleapis';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getProjectById } from '@/lib/supabase/projects';

// Função auxiliar para evitar duplicação
const createVariable = async (
  tagmanager: tagmanager_v2.Tagmanager,
  path: string,
  name: string,
  type: string,
  value: string
) => {
  return await tagmanager.accounts.containers.workspaces.variables.create({
    parent: path,
    requestBody: {
      name,
      type,
      parameter: [{ key: 'value', type: 'template', value }],
    },
  });
};

export async function POST(request: Request) {
  const { projectId } = await request.json();

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required.' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session || !session.provider_token) {
    return NextResponse.json({ error: 'Unauthorized or missing Google token.' }, { status: 401 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.provider_token });
    const tagmanager = google.tagmanager({ version: 'v2', auth: oauth2Client });

    const project = await getProjectById(projectId, session.user.id);
    if (!project || !project.gtm_id) {
      return NextResponse.json({ error: 'Project or GTM ID not found.' }, { status: 404 });
    }

    const { data: containers } = await tagmanager.accounts.containers.list({
      parent: `accounts/-`,
    });
    
    const container = containers?.container?.find(c => c.publicId === project.gtm_id);
    if (!container?.path) {
      return NextResponse.json({ error: 'GTM container not found in user account.' }, { status: 404 });
    }

    const { data: { workspace: workspaces } } = await tagmanager.accounts.containers.workspaces.list({
      parent: container.path,
    });
    const workspace = workspaces?.[0];
    if (!workspace?.path) {
      return NextResponse.json({ error: 'Default GTM workspace not found.' }, { status: 404 });
    }
    
    // --- Gatilhos reutilizáveis ---
    // Trigger para Todas as Páginas
    const { data: allPagesTrigger } = await tagmanager.accounts.containers.workspaces.triggers.create({
        parent: workspace.path,
        requestBody: {
            name: 'All Pages',
            type: 'pageview'
        }
    });

    if (!allPagesTrigger) {
      throw new Error("Could not create the 'All Pages' trigger.");
    }
    
    // --- Configuração das Tags ---
    let tagsCreated = false;

    // 1. Configurar Meta Pixel
    if (project.meta_pixel_id) {
      tagsCreated = true;
      const { data: pixelIdVar } = await createVariable(
        tagmanager,
        workspace.path,
        'Meta Pixel ID',
        'constant',
        project.meta_pixel_id
      );

      // Tag Base do Meta Pixel
      if (pixelIdVar) {
        await tagmanager.accounts.containers.workspaces.tags.create({
            parent: workspace.path,
            requestBody: {
                name: 'Meta Pixel - Base Code',
                type: 'fbp', // Tipo da tag do Facebook Pixel no GTM
                parameter: [
                    { key: 'pixelId', type: 'template', value: `{{${pixelIdVar.name}}}` },
                    { key: 'standardEvent', type: 'template', value: 'PAGE_VIEW' }
                ],
                firingTriggerId: [allPagesTrigger.triggerId || '']
            }
        });
      }
    }

    // 2. Configurar Google Analytics 4 (GA4)
    if (project.ga4_measurement_id) {
      tagsCreated = true;
      const { data: ga4IdVar } = await createVariable(
        tagmanager,
        workspace.path,
        'GA4 Measurement ID',
        'constant',
        project.ga4_measurement_id
      );

      // Tag Base do GA4 (Google Tag)
      if (ga4IdVar) {
          await tagmanager.accounts.containers.workspaces.tags.create({
              parent: workspace.path,
              requestBody: {
                  name: 'Google Tag - GA4 Configuration',
                  type: 'googletag',
                  parameter: [
                      { key: 'tagId', type: 'template', value: `{{${ga4IdVar.name}}}` }
                  ],
                  firingTriggerId: [allPagesTrigger.triggerId || '']
              }
          });
      }
    }

    // 3. Configurar Google Ads
    if (project.google_ads_id) {
      tagsCreated = true;
      // A tag Conversion Linker não precisa de ID, apenas do gatilho.
      await tagmanager.accounts.containers.workspaces.tags.create({
        parent: workspace.path,
        requestBody: {
            name: 'Google Ads - Conversion Linker',
            type: 'linker', // Tipo da tag Conversion Linker
            firingTriggerId: [allPagesTrigger.triggerId || '']
        }
      });
    }

    // (Lógica para outras plataformas viria aqui)

    if (!tagsCreated) {
      return NextResponse.json({ success: true, message: 'No platform IDs were provided. Nothing to configure.' });
    }

    // Final: Criar e Publicar Versão
    const { data: versionResponse } = await tagmanager.accounts.containers.workspaces.create_version({
      path: workspace.path,
      requestBody: { name: 'Tag Mage - Platform Tags Setup' }
    });

    if (versionResponse?.containerVersion?.path) {
        await tagmanager.accounts.containers.versions.publish({
            path: versionResponse.containerVersion.path
        });
    }

    return NextResponse.json({ success: true, message: 'Tags configured and published successfully.' });

  } catch (error: any) {
    console.error('GTM Tag Configuration Error:', error);
    const errorMessage = error.response?.data?.error?.message || error.message || 'An unknown error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 