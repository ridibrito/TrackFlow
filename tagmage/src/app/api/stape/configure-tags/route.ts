import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getProjectById } from '@/lib/supabase/projects';
import { createStapeAPI } from '@/lib/stape';

export async function POST(request: Request) {
  const { projectId } = await request.json();

  if (!projectId) {
    return NextResponse.json({ 
      error: 'Project ID é obrigatório.' 
    }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    // 1. Obter detalhes do projeto
    const project = await getProjectById(projectId, session.user.id);
    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
    }

    if (!project.stape_container_id) {
      return NextResponse.json({ 
        error: 'Container Stape não configurado. Crie um container primeiro.' 
      }, { status: 400 });
    }

    // 2. Criar instância da API do Stape (usando API Key da empresa)
    const stapeAPI = createStapeAPI();

    const configuredTags = [];
    const configuredEvents = [];

    // 3. Configurar tags baseado nas plataformas disponíveis
    if (project.ga4_measurement_id) {
      try {
        const ga4Tag = await stapeAPI.configureGA4(
          project.stape_container_id, 
          project.ga4_measurement_id
        );
        configuredTags.push({
          platform: 'Google Analytics 4',
          tag: ga4Tag
        });
      } catch (error) {
        console.error('Erro ao configurar GA4:', error);
      }
    }

    if (project.meta_pixel_id) {
      try {
        const metaTag = await stapeAPI.configureMetaPixel(
          project.stape_container_id, 
          project.meta_pixel_id
        );
        configuredTags.push({
          platform: 'Meta Pixel',
          tag: metaTag
        });
      } catch (error) {
        console.error('Erro ao configurar Meta Pixel:', error);
      }
    }

    if (project.google_ads_id) {
      try {
        // Para Google Ads, precisamos do conversion label também
        const conversionLabel = project.google_ads_label || 'default';
        const googleAdsTag = await stapeAPI.configureGoogleAds(
          project.stape_container_id, 
          project.google_ads_id,
          conversionLabel
        );
        configuredTags.push({
          platform: 'Google Ads',
          tag: googleAdsTag
        });
      } catch (error) {
        console.error('Erro ao configurar Google Ads:', error);
      }
    }

    if (project.tiktok_pixel_id) {
      try {
        const tiktokTag = await stapeAPI.configureTikTokPixel(
          project.stape_container_id, 
          project.tiktok_pixel_id
        );
        configuredTags.push({
          platform: 'TikTok Pixel',
          tag: tiktokTag
        });
      } catch (error) {
        console.error('Erro ao configurar TikTok Pixel:', error);
      }
    }

    if (project.linkedin_insight_tag_id) {
      try {
        const linkedinTag = await stapeAPI.configureLinkedInInsight(
          project.stape_container_id, 
          project.linkedin_insight_tag_id
        );
        configuredTags.push({
          platform: 'LinkedIn Insight Tag',
          tag: linkedinTag
        });
      } catch (error) {
        console.error('Erro ao configurar LinkedIn Insight Tag:', error);
      }
    }

    // 4. Configurar eventos de conversão se existirem
    if (project.conversion_events && Array.isArray(project.conversion_events)) {
      for (const event of project.conversion_events) {
        try {
          const { trigger, tag } = await stapeAPI.configureConversionEvent(
            project.stape_container_id,
            event.name || event.id,
            {
              parameters: event.parameters || {},
              conditions: event.conditions || []
            },
            event.trigger_type || 'custom_event'
          );
          
          configuredEvents.push({
            event: event,
            trigger: trigger,
            tag: tag
          });
        } catch (error) {
          console.error(`Erro ao configurar evento ${event.name}:`, error);
        }
      }
    }

    // 5. Publicar as mudanças
    let publishResult = null;
    try {
      publishResult = await stapeAPI.publishContainer(project.stape_container_id);
    } catch (error) {
      console.error('Erro ao publicar container:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Tags configuradas com sucesso no Stape.io',
      configuredTags: configuredTags,
      configuredEvents: configuredEvents,
      publishResult: publishResult,
      containerId: project.stape_container_id
    });

  } catch (error: any) {
    console.error('Erro na configuração de tags Stape:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro desconhecido ocorreu na configuração de tags.' 
    }, { status: 500 });
  }
} 