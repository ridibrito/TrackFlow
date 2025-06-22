const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || '';

if (!apiKey) {
  console.error('GOOGLE_GEMINI_API_KEY não definida. Adicione no .env.local ou exporte no terminal.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Olá, teste de conexão');
    const response = await result.response;
    console.log('Gemini respondeu:', response.text());
  } catch (e) {
    console.error('Erro ao conectar com Gemini:', e);
  }
}

test(); 