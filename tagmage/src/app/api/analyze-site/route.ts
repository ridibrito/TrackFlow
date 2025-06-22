import { NextResponse } from 'next/server';
import { geminiService } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ 
        error: 'URL é obrigatória' 
      }, { status: 400 });
    }

    // Análise do site usando o Gemini
    const analysis = await geminiService.analyzeWebsite(url);

    // Extrair informações estruturadas da análise
    const structuredAnalysis = await extractStructuredData(analysis, url);

    return NextResponse.json({
      status: 'success',
      url,
      analysis: structuredAnalysis,
      rawAnalysis: analysis
    });

  } catch (error) {
    console.error('Erro ao analisar site:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao analisar o site',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

async function extractStructuredData(analysis: string, url: string) {
  try {
    const prompt = `Com base na análise abaixo, extraia as informações em formato JSON estruturado:

ANÁLISE:
${analysis}

URL: ${url}

Retorne apenas um JSON válido com a seguinte estrutura:
{
  "businessType": "tipo de negócio (e-commerce, SaaS, blog, etc.)",
  "conversionElements": [
    {
      "type": "form|button|link|purchase",
      "description": "descrição do elemento",
      "selector": "seletor CSS se possível"
    }
  ],
  "platforms": ["Google Ads", "Meta Ads", "TikTok", etc.],
  "recommendedEvents": [
    {
      "name": "nome do evento",
      "description": "descrição",
      "trigger": "quando disparar"
    }
  ],
  "gtmRecommendations": {
    "triggers": ["lista de triggers recomendados"],
    "tags": ["lista de tags recomendadas"],
    "variables": ["lista de variáveis recomendadas"]
  }
}`;

    const jsonText = await geminiService.generateContent(prompt);
    
    // Tentar extrair JSON da resposta
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { error: 'Não foi possível extrair dados estruturados' };
    
  } catch (error) {
    console.error('Erro ao extrair dados estruturados:', error);
    return { error: 'Erro ao processar análise' };
  }
} 