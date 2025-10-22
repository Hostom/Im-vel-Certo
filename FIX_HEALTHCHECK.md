# Corrigir Healthcheck Falhando no Railway

## Problema
O healthcheck está falhando porque o servidor não está conseguindo iniciar. Isso geralmente acontece por:

1. **Banco de dados não configurado**
2. **Variáveis de ambiente faltando**
3. **Porta incorreta**

## Solução Passo a Passo

### 1. Configure as Variáveis de Ambiente Básicas

No Railway Dashboard, vá em **Variables** e adicione:

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=mySuperSecretKey2024!@#$%^&*()_+{}[]|;':",./<>?
CORS_ORIGIN=https://im-vel-certo-production.up.railway.app
```

### 2. Adicione PostgreSQL

1. No Railway, clique em **"New Service"**
2. Escolha **"Database"** → **"PostgreSQL"**
3. Railway criará automaticamente a variável `DATABASE_URL`

### 3. Execute o Script SQL

1. Vá para o serviço PostgreSQL no Railway
2. Clique em **"Query"**
3. Cole e execute o conteúdo do arquivo `backend/database-setup.sql`

### 4. Faça Deploy

```bash
git add .
git commit -m "fix: improve server startup and healthcheck"
git push origin main
```

### 5. Verifique os Logs

No Railway Dashboard:
1. Vá para o serviço do backend
2. Clique em **"Deployments"**
3. Veja os logs para identificar problemas

## O que foi corrigido:

- ✅ Servidor inicia mesmo sem banco de dados
- ✅ Healthcheck não depende do banco
- ✅ Logs mais informativos
- ✅ Script SQL simplificado

## Teste após deploy:

```bash
curl https://seu-backend-url.railway.app/api/health
```

Deve retornar:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## Se ainda falhar:

1. Verifique se todas as variáveis estão configuradas
2. Confirme que o PostgreSQL está rodando
3. Verifique os logs no Railway
4. Teste localmente primeiro
