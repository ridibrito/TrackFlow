# Configuração do Supabase

## 1. Criar projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha as informações do projeto:
   - Nome: Tag Mage
   - Database Password: (escolha uma senha forte)
   - Region: (escolha a região mais próxima)

## 2. Obter credenciais

1. No dashboard do projeto, vá para **Settings > API**
2. Copie as seguintes informações:
   - **Project URL** (ex: `https://your-project.supabase.co`)
   - **anon public** key (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. Configurar variáveis de ambiente

1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Testar configuração

1. Inicie o servidor de desenvolvimento: `npm run dev`
2. Acesse: `http://localhost:3000/api/test-supabase`
3. Você deve ver uma resposta indicando que o Supabase está configurado

## 5. Configurar autenticação

1. No Supabase, vá para **Authentication > Settings**
2. Em **Site URL**, adicione: `http://localhost:3000`
3. Em **Redirect URLs**, adicione:
   - `http://localhost:3000/login`
   - `http://localhost:3000/signup`
   - `http://localhost:3000/projects`

## 6. Criar tabelas (opcional)

Se quiser criar tabelas para projetos, execute o seguinte SQL no SQL Editor do Supabase:

```sql
-- Tabela de projetos
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Política de segurança
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);
```

## Solução de problemas

### Erro: "Variáveis de ambiente não configuradas"
- Verifique se o arquivo `.env.local` existe
- Verifique se as variáveis estão escritas corretamente
- Reinicie o servidor após criar o arquivo

### Erro: "Invalid API key"
- Verifique se a chave anônima está correta
- Certifique-se de que está usando a chave "anon public", não a "service_role"

### Erro: "Network error"
- Verifique se o projeto do Supabase está ativo
- Verifique se a URL do projeto está correta 