import { NextResponse } from 'next/server';
import { geminiService } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // TODO:
    // 1. Pegar a última mensagem do usuário.
    // 2. Montar o histórico da conversa.
    // 3. Enviar para a API de um LLM (como Google Gemini) junto com um prompt de sistema que o instrui a atuar como um especialista em GTM.
    // 4. Receber a resposta da IA.
    // 5. Se a IA identificar que tem informações suficientes, ela pode retornar um JSON com o plano de tracking.
    // 6. Se não, ela retorna a próxima pergunta para o usuário.

    // Pegar a última mensagem do usuário
    const lastUserMessage = messages[messages.length - 1]?.text || '';
    
    if (!lastUserMessage.trim()) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 });
    }

    // Usar o Gemini para gerar a resposta
    const reply = await geminiService.sendMessage(lastUserMessage);

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('Erro no endpoint /api/chat:', error);
    
    // Fallback para resposta de erro amigável
    const fallbackReply = "Desculpe, estou enfrentando algumas dificuldades técnicas no momento. Pode tentar novamente em alguns segundos?";
    
    return NextResponse.json({ reply: fallbackReply });
  }
} 