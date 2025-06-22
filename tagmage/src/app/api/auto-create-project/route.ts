import { NextResponse } from 'next/server';
import { geminiService } from '@/lib/gemini';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { scanForTags } from '@/lib/siteScanner';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: No auth header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Criar um cliente Supabase autenticado para esta requisição específica
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // Obter o usuário a partir do cliente já autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Authentication error:', userError?.message);
      return NextResponse.json({ error: userError?.message || 'Unauthorized: Invalid token' }, { status: 401 });
    }
    
    const { 
      projectName, 
      url, 
      forceCreateGTM = false,
      selected_platforms = []
    } = await request.json();

    if (!projectName || !url) {
      return NextResponse.json({ 
        error: 'Nome do projeto e URL são obrigatórios' 
      }, { status: 400 });
    }

    if (!Array.isArray(selected_platforms)) {
      return NextResponse.json({ 
        error: 'O campo selected_platforms deve ser um array.' 
      }, { status: 400 });
    }

    console.log('🚀 Iniciando criação automática do projeto:', { projectName, url, forceCreateGTM, selected_platforms });

    // NOVO PASSO: Escaneamento de tags existentes
    console.log('🌐 Passo 0: Verificando tags existentes...');
    const existing_tags = await scanForTags(url);
    console.log('🔎 Tags encontradas:', existing_tags);

    // Verificar especificamente se há GTM
    const hasGTM = existing_tags.some(tag => 
      tag.toLowerCase().includes('gtm') || 
      tag.toLowerCase().includes('google tag manager')
    );

    // PASSO 1: Análise do site
    console.log('📊 Passo 1: Analisando o site...');
    const siteAnalysis = await geminiService.analyzeWebsite(url);
    const structuredAnalysis = await extractStructuredData(siteAnalysis, url);

    // PASSO 2: Geração da configuração GTM (só se não houver GTM existente OU se forceCreateGTM for true)
    console.log('🔧 Passo 2: Gerando configuração GTM...');
    const shouldCreateGTM = !hasGTM || forceCreateGTM;
    const gtmConfig = shouldCreateGTM ? await generateGTMConfiguration({
      projectName,
      url,
      ...structuredAnalysis
    }) : null;

    // PASSO 3: Criação do projeto no banco
    console.log('💾 Passo 3: Salvando projeto no banco...');
    const projectData = {
      name: projectName,
      url: url,
      user_id: user.id,
      gtm_id: shouldCreateGTM ? (gtmConfig?.containerConfig?.containerId || null) : null,
      meta_pixel_id: shouldCreateGTM ? extractPixelId(gtmConfig) : null,
      ga4_measurement_id: shouldCreateGTM ? extractGA4Id(gtmConfig) : null,
      google_ads_id: shouldCreateGTM ? extractGoogleAdsId(gtmConfig) : null,
      conversion_events: structuredAnalysis.recommendedEvents || [],
      business_type: structuredAnalysis.businessType,
      detected_platforms: structuredAnalysis.platforms,
      site_analysis_data: structuredAnalysis,
      existing_tags: existing_tags,
      selected_platforms: selected_platforms,
    };

    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    
    if (projectError) {
      console.error("Erro ao salvar projeto no DB:", projectError);
      throw new Error(`Erro ao salvar projeto: ${projectError.message}`);
    }

    // PASSO 4: Geração dos códigos de implementação (só se não houver GTM existente OU se forceCreateGTM for true)
    console.log('📝 Passo 4: Gerando códigos de implementação...');
    const implementationCodes = shouldCreateGTM ? await generateImplementationCodes(gtmConfig, projectName) : null;

    console.log('✅ Projeto criado com sucesso!');

    return NextResponse.json({
      status: 'success',
      message: 'Projeto criado automaticamente!',
      project: {
        id: newProject?.id,
        name: projectName,
        url: url
      },
      analysis: structuredAnalysis,
      gtmConfig: gtmConfig,
      implementationCodes: implementationCodes,
      hasExistingGTM: hasGTM,
      existingTags: existing_tags
    });

  } catch (error) {
    console.error('❌ Erro na criação automática:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erro na criação automática do projeto',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

async function extractStructuredData(analysis: string, url: string) {
  const prompt = `Extraia informações estruturadas da análise:

ANÁLISE: ${analysis}
URL: ${url}

Retorne JSON com:
{
  "businessType": "tipo de negócio",
  "conversionElements": [{"type": "form|button", "description": "desc"}],
  "platforms": ["Google Ads", "Meta Ads"],
  "recommendedEvents": [{"name": "event_name", "description": "desc"}]
}`;

  try {
    const jsonText = await geminiService.generateContent(prompt);
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch (error) {
    console.error('Erro ao extrair dados:', error);
    return {};
  }
}

async function generateGTMConfiguration(data: any) {
  const prompt = `Gere configuração GTM para:
PROJETO: ${data.projectName}
URL: ${data.url}
TIPO: ${data.businessType}
ELEMENTOS: ${JSON.stringify(data.conversionElements)}
PLATAFORMAS: ${JSON.stringify(data.platforms)}

Retorne JSON com:
{
  "containerConfig": {"containerName": "nome", "containerId": "GTM-XXXXX"},
  "triggers": [{"name": "nome", "type": "Click"}],
  "tags": [{"name": "GA4", "type": "GA4"}],
  "variables": [{"name": "var", "type": "Data Layer"}]
}`;

  try {
    const jsonText = await geminiService.generateContent(prompt);
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch (error) {
    console.error('Erro ao gerar GTM:', error);
    return {};
  }
}

async function generateImplementationCodes(gtmConfig: any, projectName: string) {
  const prompt = `Gere códigos de implementação para o projeto ${projectName}:

CONFIG GTM: ${JSON.stringify(gtmConfig)}

Retorne JSON com:
{
  "gtmSnippet": "<!-- Google Tag Manager -->...",
  "dataLayer": "window.dataLayer = window.dataLayer || [];...",
  "customEvents": ["gtag('event', 'purchase', {...});"],
  "instructions": "Instruções de implementação"
}`;

  try {
    const jsonText = await geminiService.generateContent(prompt);
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch (error) {
    console.error('Erro ao gerar códigos:', error);
    return {};
  }
}

function extractPixelId(gtmConfig: any): string | null {
  const metaTag = gtmConfig.tags?.find((tag: any) => tag.type === 'Meta Pixel');
  return metaTag?.config?.pixelId || null;
}

function extractGA4Id(gtmConfig: any): string | null {
  const ga4Tag = gtmConfig.tags?.find((tag: any) => tag.type === 'GA4');
  return ga4Tag?.config?.measurementId || null;
}

function extractGoogleAdsId(gtmConfig: any): string | null {
  const adsTag = gtmConfig.tags?.find((tag: any) => tag.type === 'Google Ads');
  return adsTag?.config?.conversionId || null;
} 