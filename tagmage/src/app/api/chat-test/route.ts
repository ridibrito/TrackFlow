import { NextResponse } from 'next/server';
import { geminiService } from '@/lib/gemini';

export async function GET() {
  try {
    // Teste simples do chat
    const testMessage = "Olá! Sou um desenvolvedor e quero configurar tracking para um site de e-commerce. Pode me ajudar?";
    
    const reply = await geminiService.sendMessage(testMessage);
    
    return NextResponse.json({
      status: 'success',
      message: 'Chat do Gemini funcionando!',
      testMessage,
      reply: reply.substring(0, 200) + '...'
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Erro no chat do Gemini',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 