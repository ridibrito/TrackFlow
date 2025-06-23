# Instalação do Docker no Windows

## Opção 1: Docker Desktop (Recomendado)

### 1. Baixar Docker Desktop
1. Acesse [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
2. Clique em "Download for Windows"
3. Baixe o instalador do Docker Desktop

### 2. Instalar Docker Desktop
1. Execute o arquivo baixado (`Docker Desktop Installer.exe`)
2. Siga o assistente de instalação
3. Reinicie o computador quando solicitado

### 3. Verificar instalação
Abra o PowerShell e execute:
```powershell
docker --version
```

## Opção 2: WSL2 + Docker (Alternativa)

Se preferir usar WSL2:

### 1. Habilitar WSL2
```powershell
# Executar como administrador
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

### 2. Instalar WSL2
```powershell
wsl --install
```

### 3. Instalar Docker no WSL2
```bash
# No terminal WSL2
sudo apt update
sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

## Opção 3: Cloud Build (Sem Docker local)

Se não quiser instalar Docker, você pode usar o Google Cloud Build:

### 1. Habilitar Cloud Build
```bash
gcloud services enable cloudbuild.googleapis.com
```

### 2. Criar arquivo cloudbuild.yaml
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/tagmage', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/tagmage']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'tagmage'
      - '--image'
      - 'gcr.io/$PROJECT_ID/tagmage'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--port'
      - '3000'
      - '--memory'
      - '1Gi'
      - '--cpu'
      - '1'
      - '--max-instances'
      - '10'
```

### 3. Deploy com Cloud Build
```bash
gcloud builds submit --config cloudbuild.yaml
```

## Verificação da Instalação

Após instalar o Docker, teste com:

```powershell
# Verificar versão
docker --version

# Testar com imagem simples
docker run hello-world

# Verificar se o daemon está rodando
docker info
```

## Próximos Passos

Após instalar o Docker:

1. **Fazer login no Google Cloud**:
   ```bash
   gcloud auth login
   gcloud auth configure-docker
   ```

2. **Executar o deploy**:
   ```powershell
   .\deploy.ps1 seu-project-id tagmage
   ```

## Troubleshooting

### Docker não inicia
- Verifique se o WSL2 está habilitado
- Reinicie o Docker Desktop
- Verifique se a virtualização está habilitada na BIOS

### Erro de permissão
- Execute o PowerShell como administrador
- Verifique se o usuário está no grupo "docker-users"

### Erro de conexão
- Verifique se o Docker Desktop está rodando
- Reinicie o serviço Docker 