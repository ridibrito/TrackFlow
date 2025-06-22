# Configuração do Google Gemini

## 🚀 Integração Completa com IA

O Tag Mage agora está integrado com o Google Gemini para fornecer uma experiência de chat conversacional inteligente e especializada em tracking digital.

## Passo 1: Obter a Chave da API

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada (formato: `AIzaSyC...`)

## Passo 2: Configurar as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# Google Gemini API Key
GOOGLE_GEMINI_API_KEY=sua_chave_aqui

# Supabase Configuration (já existente)
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_supabase
```

## Passo 3: Testar a Integração

### Opção 1: Teste via Interface
1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse a interface de chat em `/projects`
3. Verifique se o status mostra "Gemini Conectado" (ponto verde)
4. Teste enviando uma mensagem

### Opção 2: Teste via API
1. Acesse: `http://localhost:3000/api/gemini-test`
2. Deve retornar uma resposta de sucesso

## 🧠 Funcionalidades da IA

### Chat Conversacional Inteligente
- **Prompt Especializado**: Treinado especificamente para tracking digital
- **Contexto Persistente**: Mantém o histórico da conversa
- **Respostas Contextualizadas**: Adapta-se ao tipo de negócio
- **Português Brasileiro**: Comunicação natural em português

### Análise Automática de Websites
- Detecção de tipo de negócio
- Identificação de elementos de conversão
- Análise de formulários e CTAs
- Recomendações personalizadas

### Geração de Planos de Tracking
- Eventos específicos para cada tipo de site
- Configurações GTM recomendadas
- Códigos de implementação prontos
- Próximos passos detalhados

## 📁 Estrutura do Código

```
src/
├── lib/
│   └── gemini.ts              # Configuração e serviço do Gemini
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts       # Endpoint principal do chat
│   │   └── gemini-test/
│   │       └── route.ts       # Endpoint de teste
│   └── (dashboard)/
│       └── projects/
│           └── page.tsx       # Interface de chat
```

## 🔧 Configurações Avançadas

### Personalização do Prompt
Edite o `SYSTEM_PROMPT` em `src/lib/gemini.ts` para:
- Ajustar o tom da conversa
- Adicionar conhecimentos específicos
- Modificar o comportamento da IA

### Configurações do Modelo
```typescript
generationConfig: {
  maxOutputTokens: 2048,    // Tamanho máximo da resposta
  temperature: 0.7,         // Criatividade (0.0 - 1.0)
}
```

## 🚨 Solução de Problemas

### Erro: "Gemini Desconectado"
1. Verifique se a chave da API está correta
2. Confirme se o arquivo `.env.local` está na raiz
3. Reinicie o servidor após adicionar a chave
4. Teste a conexão em `/api/gemini-test`

### Erro: "API Key Invalid"
1. Gere uma nova chave no Google AI Studio
2. Verifique se a chave não tem espaços extras
3. Confirme se a conta tem acesso ao Gemini Pro

### Respostas Lentas
1. Verifique sua conexão com a internet
2. O Gemini pode demorar alguns segundos para responder
3. Respostas complexas levam mais tempo

## 🔮 Próximos Passos

1. **Análise Automática de URLs**: Implementar análise de sites em tempo real
2. **Salvamento de Conversas**: Armazenar histórico no banco de dados
3. **Geração de Projetos**: Criar projetos automaticamente baseado na conversa
4. **Validação de Tracking**: Implementar verificação automática de implementação
5. **Templates Avançados**: Criar templates específicos por indústria

## 📊 Monitoramento

- Status de conexão em tempo real
- Logs de erro detalhados
- Métricas de uso da API
- Performance da IA

---

**Nota**: Esta integração requer uma chave válida do Google Gemini. O serviço é gratuito para uso moderado, mas pode ter limites de taxa dependendo do volume de uso. 