import { NextResponse } from 'next/server';
import { geminiService } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { 
      projectName, 
      url, 
      businessType, 
      conversionElements, 
      platforms,
      recommendedEvents 
    } = await request.json();

    if (!projectName || !url) {
      return NextResponse.json({ 
        error: 'Nome do projeto e URL são obrigatórios' 
      }, { status: 400 });
    }

    // Gerar configuração GTM completa
    const gtmConfig = await generateGTMConfiguration({
      projectName,
      url,
      businessType,
      conversionElements,
      platforms,
      recommendedEvents
    });

    return NextResponse.json({
      status: 'success',
      projectName,
      gtmConfig
    });

  } catch (error) {
    console.error('Erro ao gerar GTM:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao gerar configuração GTM',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

async function generateGTMConfiguration(data: any) {
  const prompt = `Gere uma configuração completa do Google Tag Manager para o projeto:

PROJETO: ${data.projectName}
URL: ${data.url}
TIPO DE NEGÓCIO: ${data.businessType}
ELEMENTOS DE CONVERSÃO: ${JSON.stringify(data.conversionElements)}
PLATAFORMAS: ${JSON.stringify(data.platforms)}
EVENTOS RECOMENDADOS: ${JSON.stringify(data.recommendedEvents)}

Retorne um JSON estruturado com:

1. CONTAINER CONFIG:
{
  "containerName": "nome do container",
  "containerId": "GTM-XXXXXXX (placeholder)",
  "description": "descrição do container"
}

2. TRIGGERS:
[
  {
    "name": "nome do trigger",
    "type": "tipo (Click, Page View, Custom Event, etc.)",
    "conditions": ["condições do trigger"],
    "description": "descrição"
  }
]

3. TAGS:
[
  {
    "name": "nome da tag",
    "type": "tipo (GA4, Google Ads, Meta Pixel, etc.)",
    "trigger": "trigger associado",
    "config": {
      "measurementId": "G-XXXXXXXXX",
      "eventName": "nome do evento",
      "parameters": {}
    }
  }
]

4. VARIABLES:
[
  {
    "name": "nome da variável",
    "type": "tipo (Data Layer, Built-in, Custom)",
    "value": "valor ou configuração"
  }
]

5. IMPLEMENTATION CODE:
{
  "gtmSnippet": "código do snippet GTM",
  "dataLayer": "código do dataLayer",
  "customEvents": ["códigos dos eventos customizados"]
}

Seja específico e prático.`;

  try {
    const jsonText = await geminiService.generateContent(prompt);
    
    // Tentar extrair JSON da resposta
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { error: 'Não foi possível gerar configuração GTM' };
    
  } catch (error) {
    console.error('Erro ao gerar configuração GTM:', error);
    return { error: 'Erro ao processar configuração GTM' };
  }
} 