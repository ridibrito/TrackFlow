# ⚡ Comandos Rápidos - Deploy TagMage

## 🚀 Deploy em 1 minuto

### 1. Instalar Google Cloud CLI
```powershell
Invoke-WebRequest -Uri "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe" -OutFile "GoogleCloudSDKInstaller.exe"
.\GoogleCloudSDKInstaller.exe
```

### 2. Configurar projeto
```powershell
gcloud auth login
gcloud projects create tagmage-project --name="TagMage"
gcloud config set project tagmage-project
gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com
```

### 3. Deploy (escolha uma opção)

#### Opção A: Com Docker
```powershell
.\deploy.ps1 tagmage-project tagmage
```

#### Opção B: Sem Docker
```powershell
.\deploy-cloudbuild.ps1 tagmage-project
```

### 4. Configurar variáveis
```powershell
gcloud run services update tagmage --region us-central1 --set-env-vars NEXT_PUBLIC_SUPABASE_URL=sua-url,NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave,GOOGLE_GEMINI_API_KEY=sua-chave-gemini
```

## 🔍 Comandos de Monitoramento

### Ver URL da aplicação
```powershell
gcloud run services describe tagmage --region us-central1 --format="value(status.url)"
```

### Ver logs em tempo real
```powershell
gcloud logs tail --service=tagmage --region=us-central1
```

### Ver status do serviço
```powershell
gcloud run services list --region=us-central1
```

### Ver métricas
```powershell
gcloud run services describe tagmage --region=us-central1
```

## 🛠️ Comandos de Troubleshooting

### Verificar instalação
```powershell
gcloud --version
docker --version
```

### Verificar autenticação
```powershell
gcloud auth list
```

### Verificar projeto
```powershell
gcloud config get-value project
```

### Verificar APIs
```powershell
gcloud services list --enabled --filter="name:run.googleapis.com"
```

### Reautenticar
```powershell
gcloud auth login
gcloud auth application-default login
```

## 📊 Comandos de Gerenciamento

### Atualizar serviço
```powershell
gcloud run services update tagmage --region us-central1 --image gcr.io/tagmage-project/tagmage:latest
```

### Escalar serviço
```powershell
gcloud run services update tagmage --region us-central1 --max-instances 20
```

### Ver custos
```powershell
gcloud billing accounts list
```

### Deletar serviço
```powershell
gcloud run services delete tagmage --region us-central1
```

## 🔧 Comandos de Desenvolvimento

### Build local
```powershell
docker build -t tagmage .
```

### Testar localmente
```powershell
docker run -p 3000:3000 tagmage
```

### Push manual
```powershell
docker tag tagmage gcr.io/tagmage-project/tagmage
docker push gcr.io/tagmage-project/tagmage
```

## 📝 Variáveis de Ambiente Comuns

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Google Gemini
```bash
GOOGLE_GEMINI_API_KEY=sua-chave-gemini
```

### Stape.io
```bash
STAPE_API_KEY=sua-chave-stape
```

### Next.js
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🎯 Comandos de Configuração Avançada

### Configurar domínio personalizado
```powershell
gcloud run domain-mappings create --service tagmage --domain seu-dominio.com --region us-central1
```

### Configurar HTTPS
```powershell
gcloud run services update tagmage --region us-central1 --set-env-vars HTTPS=true
```

### Configurar variáveis secretas
```powershell
echo "sua-chave-secreta" | gcloud secrets create supabase-key --data-file=-
gcloud run services update tagmage --region us-central1 --set-env-vars NEXT_PUBLIC_SUPABASE_ANON_KEY=@supabase-key
```

## 📚 Links Úteis

- **Console Google Cloud**: https://console.cloud.google.com
- **Cloud Run**: https://console.cloud.google.com/run
- **Container Registry**: https://console.cloud.google.com/gcr
- **Cloud Build**: https://console.cloud.google.com/cloud-build
- **Logs**: https://console.cloud.google.com/logs 