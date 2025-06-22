import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar o cliente do Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Prompt do sistema para especialista em tracking
const SYSTEM_PROMPT = `Você é um especialista em Google Tag Manager (GTM), Google Analytics 4 (GA4) e tracking digital com mais de 10 anos de experiência.

Sua missão é ajudar usuários a configurar tracking completo para seus sites através de uma conversa natural.

REGRAS IMPORTANTES:
1. Sempre responda em português brasileiro
2. Seja amigável e didático, mas profissional
3. Faça perguntas específicas para entender o negócio
4. Quando tiver informações suficientes, forneça um plano de tracking estruturado
5. Foque em conversões e objetivos de negócio, não apenas em tecnologia

INFORMAÇÕES QUE VOCÊ PRECISA COLETAR:
- Tipo de site (e-commerce, institucional, blog, SaaS, etc.)
- Principais conversões/objetivos
- Plataformas de anúncios utilizadas (Google Ads, Meta, TikTok, etc.)
- URL do site (para análise)
- Formulários e CTAs importantes
- Funnel de conversão

QUANDO TIVER INFORMAÇÕES SUFICIENTES, FORNEÇA:
1. Resumo do projeto
2. Lista de eventos a serem rastreados
3. Configurações recomendadas para GTM
4. Códigos de implementação
5. Próximos passos

Mantenha a conversa fluida e natural.`;

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export class GeminiChatService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  private chat: any = null;

  constructor() {
    this.initializeChat();
  }

  private initializeChat() {
    this.chat = this.model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido! Sou seu especialista em tracking. Vou ajudá-lo a configurar um setup completo de rastreamento para seu site. Para começarmos, sobre o que é o site deste projeto?' }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      if (!this.chat) {
        this.initializeChat();
      }

      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erro detalhado ao enviar mensagem para Gemini:', error);
      if (error instanceof Error) {
        throw new Error(`Erro da API do Gemini: ${error.message}`);
      }
      throw new Error('Ocorreu um erro desconhecido ao se comunicar com a API do Gemini.');
    }
  }

  async analyzeWebsite(url: string): Promise<string> {
    try {
      const prompt = `Analise o site ${url} e me forneça:
1. Tipo de negócio identificado
2. Principais elementos de conversão encontrados
3. Formulários e CTAs detectados
4. Recomendações de tracking específicas para este site

Seja específico e prático.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erro ao analisar website:', error);
      throw new Error('Erro ao analisar website');
    }
  }

  async generateTrackingPlan(conversationHistory: string): Promise<string> {
    try {
      const prompt = `Com base na conversa abaixo, gere um plano completo de tracking:

${conversationHistory}

Forneça:
1. RESUMO DO PROJETO
2. EVENTOS A SEREM RASTREADOS (com descrição)
3. CONFIGURAÇÕES GTM RECOMENDADAS
4. CÓDIGOS DE IMPLEMENTAÇÃO
5. PRÓXIMOS PASSOS

Seja detalhado e prático.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erro ao gerar plano de tracking:', error);
      throw new Error('Erro ao gerar plano de tracking');
    }
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content:', error);
      if (error instanceof Error) {
        throw new Error(`Erro da API do Gemini: ${error.message}`);
      }
      throw new Error('Ocorreu um erro desconhecido ao se comunicar com a API do Gemini.');
    }
  }
}

export const geminiService = new GeminiChatService(); 