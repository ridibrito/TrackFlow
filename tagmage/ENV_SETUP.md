# Configuração das Variáveis de Ambiente

## Arquivo .env.local

Seu arquivo `.env.local` deve conter as seguintes variáveis:

```env
# Google Gemini API Key
GOOGLE_GEMINI_API_KEY=AIzaSyDHwmuuk97pa79GdV36EdUwvDrmg4XpN9g

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase_aqui
```

## Como Obter as Chaves do Supabase

### 1. Acesse o Supabase
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione seu projeto

### 2. Obter a URL
- Vá em **Settings** → **API**
- Copie a **Project URL** (formato: `https://xxxxxxxxxxxxx.supabase.co`)

### 3. Obter a Chave Anônima
- Na mesma página **Settings** → **API**
- Copie a **anon public** key (formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Exemplo Completo

```env
# Google Gemini API Key
GOOGLE_GEMINI_API_KEY=AIzaSyDHwmuuk97pa79GdV36EdUwvDrmg4XpN9g

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldS1wcm9qZXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MzQ1NjI0MDAsImV4cCI6MTk1MDEzODQwMH0.exemplo
```

## Verificação

Após configurar, reinicie o servidor:

```bash
npm run dev
```

E teste acessando: `http://localhost:3000/projects`

## Solução de Problemas

### Erro: "supabaseUrl is required"
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` está no arquivo `.env.local`
- Confirme que não há espaços extras
- Reinicie o servidor após adicionar as variáveis

### Erro: "supabaseAnonKey is required"
- Verifique se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está no arquivo `.env.local`
- Confirme que a chave está completa
- Reinicie o servidor após adicionar as variáveis 