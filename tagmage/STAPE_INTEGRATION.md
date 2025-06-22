# Integração com Container Server-Side

## Visão Geral

A TagMage oferece integração com containers server-side para melhorar a performance e precisão do rastreamento de marketing. Esta funcionalidade permite que os usuários criem e gerenciem containers server-side sem necessidade de contas adicionais ou configurações complexas.

## Modelo de Negócio

### API Key da Empresa
- A API Key é gerenciada pela TagMage, não pelo usuário
- O usuário não precisa ter conta no provedor de server-side
- Pagamento centralizado pela TagMage
- Controle total da infraestrutura pela empresa

### Benefícios para o Usuário
- Configuração simplificada
- Sem necessidade de contas adicionais
- Suporte técnico incluído
- Integração perfeita com container web (GTM)

### Benefícios para a Empresa
- Controle centralizado da infraestrutura
- Receita adicional através de planos premium
- Dados agregados para insights
- Relacionamento direto com o provedor

## Funcionalidades

### 1. Criação de Containers
- Criação automática de containers server-side
- Configuração de domínios e subdomínios
- **Suporte a domínios próprios**
- Integração com projetos existentes

### 2. Configuração de Tags
- Configuração automática de tags para plataformas conectadas
- Templates para GA4, Meta Pixel, Google Ads, TikTok, LinkedIn
- Eventos de conversão personalizados

### 3. Geração de Código
- Snippets de implementação prontos para uso
- Exemplos de eventos customizados
- Configuração de data layer
- **Suporte a domínios próprios no código gerado**

### 4. Monitoramento
- Painel de monitoramento integrado
- Visualização de eventos em tempo real
- Debugging e troubleshooting

## Domínios Próprios

### Vantagens
- **Branding:** Use seu próprio domínio (ex: gtm.seudominio.com)
- **Performance:** Melhor cache e velocidade de carregamento
- **Segurança:** Controle total sobre o domínio
- **Profissionalismo:** Aparência mais profissional

### Configuração
1. **Durante a criação do container:**
   - Opção para inserir domínio próprio
   - Configuração automática via API
   - Validação de disponibilidade

2. **DNS Automático:**
   - Configuração automática de registros DNS
   - SSL/HTTPS automático
   - Sem necessidade de configuração manual

3. **Fallback:**
   - Se o domínio próprio falhar, usa domínio padrão
   - Notificação de status de configuração
   - Possibilidade de reconfiguração

### Exemplo de Uso
```typescript
// Criação com domínio próprio
const container = await stapeAPI.createContainer({
  name: "Meu Projeto - Server-Side",
  domain: "meu-projeto.stape.io", // Domínio padrão
  customDomain: "gtm.meudominio.com" // Domínio próprio
});

// Código gerado automaticamente
<script src="https://gtm.meudominio.com/gtm.js"></script>
```

## Arquitetura Técnica

### Backend (API Routes)
- `/api/stape/create-container` - Criação de containers
- `/api/stape/configure-tags` - Configuração de tags
- `/api/stape/list-containers` - Listagem de containers

### Frontend (Componentes)
- `ServerSideConfig` - Configuração principal
- `ServerSideCodeGenerator` - Geração de código
- `ServerSideContainerSelector` - Seleção de containers

### Biblioteca
- `src/lib/stape.ts` - Cliente da API e templates

## Configuração

### Variáveis de Ambiente
```env
STAPE_API_KEY=sua_api_key_aqui
```

### Estrutura do Banco
```sql
-- Colunas adicionadas à tabela projects
ALTER TABLE projects ADD COLUMN stape_container_id TEXT;
ALTER TABLE projects ADD COLUMN stape_domain TEXT;
ALTER TABLE projects ADD COLUMN stape_configured BOOLEAN DEFAULT FALSE;
```

## Fluxo do Usuário

1. **Configuração do Container Web (GTM)**
   - Usuário configura primeiro o container web
   - Conecta plataformas de marketing

2. **Ativação do Server-Side**
   - Opção disponível após configuração do web
   - Criação automática do container server-side

3. **Configuração de Tags**
   - Tags configuradas automaticamente
   - Baseadas nas plataformas conectadas

4. **Implementação**
   - Snippet gerado automaticamente
   - Instalação no site do usuário

5. **Monitoramento**
   - Acompanhamento via painel integrado
   - Debugging e otimização

## Próximos Passos

1. **Configurar API Key**
   - Obter API Key do provedor
   - Configurar variável de ambiente

2. **Testar Integração**
   - Criar projeto de teste
   - Verificar criação de containers
   - Testar configuração de tags

3. **Implementar no Frontend**
   - Integrar componentes nas páginas
   - Testar fluxo completo

4. **Documentação**
   - Guias de implementação
   - Troubleshooting
   - FAQ

## Arquivos Modificados

### Novos Arquivos
- `src/lib/stape.ts` - Biblioteca da API
- `src/app/api/stape/*` - Rotas da API
- `src/components/projects/ServerSideConfig.tsx` - Configuração
- `src/components/projects/ServerSideCodeGenerator.tsx` - Geração de código
- `src/components/projects/ServerSideContainerSelector.tsx` - Seleção

### Arquivos Modificados
- `src/app/(dashboard)/projects/[id]/page.tsx` - Integração na página do projeto
- `STAPE_INTEGRATION.md` - Esta documentação
- `ENV_SETUP_STAPE.md` - Configuração de ambiente

## Considerações de Segurança

- API Key nunca exposta ao frontend
- Autenticação via Supabase em todas as rotas
- Validação de permissões por projeto
- Rate limiting nas APIs externas

## Monitoramento e Analytics

- Logs de criação de containers
- Métricas de uso por projeto
- Alertas para falhas de configuração
- Dashboard de performance 