# ✅ Checklist - Primeira Vez no Cloud Shell

## 🎯 Checklist Rápido

### 📋 Pré-requisitos
- [ ] Conta Google criada
- [ ] Projeto Google Cloud criado
- [ ] Faturamento ativado (gratuito)

### ⚡ Cloud Shell
- [ ] Cloud Shell aberto
- [ ] Terminal funcionando
- [ ] Editor web disponível

### 📁 Projeto
- [ ] Arquivos do TagMage enviados
- [ ] Estrutura verificada (package.json, Dockerfile, etc.)
- [ ] Scripts de deploy presentes

### 🔧 Configuração
- [ ] Script setup-cloudshell.sh executado
- [ ] Projeto configurado no gcloud
- [ ] APIs habilitadas
- [ ] Docker funcionando

### 🌐 Variáveis
- [ ] Arquivo .env.local criado
- [ ] URL do Supabase configurada
- [ ] Chaves do Supabase configuradas
- [ ] Project ID configurado

### 🚀 Deploy
- [ ] Script deploy-cloudshell.sh executado
- [ ] Build da imagem concluído
- [ ] Push para Container Registry
- [ ] Deploy no Cloud Run
- [ ] URL da aplicação obtida

### 🎉 Teste
- [ ] Aplicação acessível via URL
- [ ] Página inicial carregando
- [ ] Funcionalidades básicas testadas
- [ ] Logs verificados (se necessário)

### 🔧 Configuração Final
- [ ] Variáveis aplicadas no Cloud Run
- [ ] Configuração verificada
- [ ] Monitoramento configurado

---

## 🚀 Comandos Rápidos (Copie e Cole)

### 1. Configuração Inicial
```bash
chmod +x setup-cloudshell.sh
./setup-cloudshell.sh
```

### 2. Deploy
```bash
chmod +x deploy-cloudshell.sh
./deploy-cloudshell.sh
```

### 3. Verificar Status
```bash
gcloud run services describe tagmage --region=us-central1 --format="value(status.url)"
```

### 4. Ver Logs
```bash
gcloud logs tail --service=tagmage --region=us-central1
```

---

## 🚨 Problemas Comuns - Soluções Rápidas

### ❌ "Projeto não configurado"
```bash
gcloud config set project SEU_PROJECT_ID
```

### ❌ "Não logado"
```bash
gcloud auth login
```

### ❌ "Docker não disponível"
- Reinicie o Cloud Shell (botão ⚡)

### ❌ "Aplicação não carrega"
```bash
gcloud logs read --service=tagmage --region=us-central1 --filter="severity>=ERROR"
```

---

## 📞 Suporte Rápido

### 🔗 Links Úteis
- [Google Cloud Console](https://console.cloud.google.com)
- [Cloud Shell](https://shell.cloud.google.com)
- [Documentação Completa](PRIMEIRA_VEZ_CLOUD_SHELL.md)

### 📱 Contatos
- **Documentação:** PRIMEIRA_VEZ_CLOUD_SHELL.md
- **Comandos:** COMANDOS_CLOUD_SHELL.md
- **Guia:** CLOUD_SHELL_GUIDE.md

---

## 🎉 Sucesso!

Quando todos os itens estiverem marcados ✅, sua aplicação TagMage estará rodando na nuvem! 🚀

**URL da sua aplicação:** `https://tagmage-abc123-uc.a.run.app` (exemplo)

**Próximo passo:** Testar todas as funcionalidades e configurar domínio personalizado (opcional). 