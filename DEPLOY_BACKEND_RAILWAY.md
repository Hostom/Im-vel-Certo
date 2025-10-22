# Deploy do Backend no Railway

## Passo a Passo para Configurar o Backend

### 1. Criar Projeto Backend no Railway

1. **Acesse o Railway Dashboard:**
   - Vá para [railway.app](https://railway.app)
   - Faça login na sua conta

2. **Criar Novo Projeto:**
   - Clique em "New Project"
   - Escolha "Deploy from GitHub repo"
   - Selecione o repositório `Im-vel-Certo`
   - Configure o **Root Directory** como `backend/`

### 2. Configurar Variáveis de Ambiente

No Railway, vá em **Variables** e adicione:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro-aqui
JWT_EXPIRES_IN=7d

# CORS (URL do seu frontend)
CORS_ORIGIN=https://im-vel-certo-production.up.railway.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Environment
NODE_ENV=production
PORT=3000
```

### 3. Configurar PostgreSQL

1. **Adicionar PostgreSQL:**
   - No Railway, clique em "New Service"
   - Escolha "Database" → "PostgreSQL"
   - Railway criará automaticamente a variável `DATABASE_URL`

2. **Executar Script SQL:**
   - Conecte no banco via Railway Dashboard
   - Execute o script SQL que criamos (tabelas, índices, etc.)

### 4. Deploy

1. **Fazer Push do Código:**
   ```bash
   git add .
   git commit -m "feat: configure backend for Railway deployment"
   git push origin main
   ```

2. **Railway fará o deploy automaticamente**

### 5. Verificar Deploy

Após o deploy, teste:
```bash
curl https://seu-backend-url.railway.app/api/health
```

## URLs Esperadas

- **Frontend**: `https://im-vel-certo-production.up.railway.app`
- **Backend**: `https://imovel-certo-backend-production.up.railway.app` (ou similar)
- **Health Check**: `https://seu-backend-url.railway.app/api/health`

## Troubleshooting

### Se o deploy falhar:
1. Verifique os logs no Railway
2. Confirme que todas as variáveis estão configuradas
3. Verifique se o `package.json` está correto
4. Confirme que o TypeScript compila sem erros

### Se a conexão falhar:
1. Verifique se o CORS está configurado corretamente
2. Confirme que a URL do backend está correta no frontend
3. Teste o health check endpoint
