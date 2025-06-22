# Estrutura do Projeto Tag Mage

## Visão Geral

O Tag Mage é um SaaS para automação de tracking no GTM (Google Tag Manager) construído com Next.js 14 (App Router), Tailwind CSS e Supabase.

## Estrutura de Pastas

```
tagmage/
├── src/
│   └── app/
│       ├── (auth)/                    # Grupo de rotas de autenticação
│       │   ├── login/
│       │   │   └── page.tsx           # Página de login
│       │   └── signup/
│       │       └── page.tsx           # Página de cadastro
│       │
│       ├── (dashboard)/               # Grupo de rotas protegidas
│       │   ├── projects/
│       │   │   ├── [id]/
│       │   │   │   └── page.tsx       # Detalhes de projeto específico
│       │   │   └── page.tsx           # Lista de projetos
│       │   ├── team/
│       │   │   └── page.tsx           # Gerenciamento de equipe
│       │   ├── settings/
│       │   │   └── page.tsx           # Configurações de conta
│       │   └── layout.tsx             # Layout do dashboard
│       │
│       ├── page.tsx                   # Landing page (rota /)
│       ├── layout.tsx                 # Layout raiz
│       ├── globals.css                # Estilos globais
│       └── favicon.ico
│
├── components/
│   ├── ui/                           # Componentes de UI genéricos
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   └── shared/                       # Componentes compartilhados
│       └── Sidebar.tsx
│
├── lib/
│   └── supabase/                     # Configuração e helpers do Supabase
│       ├── client.ts                 # Cliente do Supabase
│       └── auth.ts                   # Helpers de autenticação
│
├── env.local.example                 # Exemplo de variáveis de ambiente
└── STRUCTURE.md                      # Este arquivo
```

## Rotas da Aplicação

### Rotas Públicas
- `/` - Landing page
- `/login` - Página de login
- `/signup` - Página de cadastro

### Rotas Protegidas (Dashboard)
- `/projects` - Lista de projetos
- `/projects/[id]` - Detalhes de um projeto específico
- `/team` - Gerenciamento de equipe
- `/settings` - Configurações de conta e plano

## Componentes

### UI Components (`components/ui/`)
- **Button**: Botão reutilizável com variantes (primary, secondary, outline)
- **Input**: Campo de entrada com suporte a labels e validação de erro

### Shared Components (`components/shared/`)
- **Sidebar**: Barra lateral do dashboard com navegação
- **SidebarItem**: Item de navegação da sidebar

## Configuração do Supabase

### Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### Como obter as credenciais:
1. Acesse [https://supabase.com](https://supabase.com)
2. Crie um novo projeto ou acesse um existente
3. Vá para **Settings > API**
4. Copie a **URL do projeto** e a **anon/public key**

## Funcionalidades Implementadas

### Autenticação
- ✅ Páginas de login e cadastro
- ✅ Helpers de autenticação do Supabase
- ✅ Cliente do Supabase configurado

### Dashboard
- ✅ Layout responsivo com sidebar
- ✅ Navegação entre páginas
- ✅ Páginas placeholder para todas as funcionalidades

### UI/UX
- ✅ Design system com Tailwind CSS
- ✅ Componentes reutilizáveis
- ✅ Interface moderna e intuitiva

## Próximos Passos

1. **Configurar Supabase**: Criar projeto e adicionar credenciais
2. **Implementar Autenticação**: Conectar formulários com Supabase Auth
3. **Criar Banco de Dados**: Definir tabelas para projetos, usuários, etc.
4. **Implementar Funcionalidades**: Adicionar lógica de negócio
5. **Testes**: Implementar testes unitários e de integração

## Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de CSS utilitário
- **Supabase** - Backend-as-a-Service (Auth + Database)
- **React** - Biblioteca de UI 