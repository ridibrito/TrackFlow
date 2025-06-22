import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODELS = [
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.0-pro',
  'gemini-pro'
];

export async function GET() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      status: 'error',
      message: 'Chave da API do Gemini não encontrada',
      error: 'GOOGLE_GEMINI_API_KEY não está definida'
    }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const results: any[] = [];

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Olá, teste de conexão');
      const response = await result.response;
      const text = await response.text();
      results.push({ model: modelName, status: 'success', preview: text.substring(0, 100) });
    } catch (error) {
      results.push({ model: modelName, status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  }

  return NextResponse.json({
    status: 'tested',
    results
  });
} 