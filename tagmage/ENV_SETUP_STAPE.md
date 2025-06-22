# Configuração do Stape.io - Variáveis de Ambiente

## Configuração Necessária

Para que a integração com Stape.io funcione corretamente, você precisa configurar a API Key da empresa no ambiente.

### 1. Obter API Key do Stape.io

1. Acesse [app.stape.io](https://app.stape.io)
2. Faça login na conta da empresa TagMage
3. Vá para **Settings → API**
4. Copie a API Key

### 2. Configurar Variável de Ambiente

Adicione a seguinte variável ao seu arquivo `.env.local`:

```env
# Stape.io API Key (gerenciada pela empresa)
STAPE_API_KEY=sua_api_key_aqui
```

### 3. Configuração no Vercel/Produção

Se estiver usando Vercel ou outro provedor de hospedagem:

1. Acesse o dashboard do seu projeto
2. Vá para **Settings → Environment Variables**
3. Adicione:
   - **Name**: `STAPE_API_KEY`
   - **Value**: `sua_api_key_aqui`
   - **Environment**: Production, Preview, Development

### 4. Verificar Configuração

Para verificar se a configuração está correta, você pode:

1. Reiniciar o servidor de desenvolvimento
2. Tentar criar um container server-side
3. Verificar os logs do servidor

## Segurança

### ✅ Boas Práticas

- **Nunca commite a API Key**: Mantenha sempre em variáveis de ambiente
- **Use diferentes keys**: Desenvolvimento, staging e produção
- **Rotacione periodicamente**: Mude a API Key regularmente
- **Monitore uso**: Acompanhe o consumo da API

### ❌ O que NÃO fazer

- Não coloque a API Key diretamente no código
- Não compartilhe a API Key com usuários
- Não use a mesma key em múltiplos ambientes
- Não deixe a key exposta em logs

## Troubleshooting

### Erro: "STAPE_API_KEY não configurada no ambiente"

**Solução:**
1. Verifique se a variável está no arquivo `.env.local`
2. Reinicie o servidor de desenvolvimento
3. Verifique se o nome da variável está correto (sem espaços)

### Erro: "Stape API error: 401"

**Solução:**
1. Verifique se a API Key está correta
2. Confirme se a conta tem permissões adequadas
3. Teste a API Key no painel do Stape.io

### Erro: "Stape API error: 403"

**Solução:**
1. Verifique se a conta tem permissões para criar containers
2. Confirme se não há limites de uso atingidos
3. Entre em contato com o suporte do Stape.io

## Monitoramento

### Logs Recomendados

```javascript
// No arquivo de configuração do Stape
console.log('Stape API configurada:', !!process.env.STAPE_API_KEY);

// Nos endpoints da API
console.log('Criando container Stape para projeto:', projectId);
console.log('Container criado com sucesso:', containerId);
```

### Métricas Importantes

- Número de containers criados
- Taxa de sucesso das operações
- Tempo de resposta da API
- Erros por tipo

## Backup e Recuperação

### Backup da Configuração

1. Mantenha a API Key em local seguro
2. Documente o processo de configuração
3. Tenha um plano de recuperação

### Recuperação de Desastres

1. Nova API Key do Stape.io
2. Atualizar variável de ambiente
3. Testar funcionalidade
4. Notificar equipe

---

**Importante**: A API Key do Stape.io é um recurso crítico da empresa. Mantenha-a segura e monitore seu uso regularmente. 