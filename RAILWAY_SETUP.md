# Configuração do Railway

## Problema Identificado
O frontend está tentando se conectar ao backend em `localhost:3000`, mas você está rodando no Railway. O backend precisa estar rodando no Railway também.

## Soluções

### 1. Configurar o Backend no Railway

1. **Criar um novo projeto no Railway para o backend:**
   - Acesse [Railway](https://railway.app)
   - Clique em "New Project"
   - Escolha "Deploy from GitHub repo"
   - Selecione o repositório do seu projeto
   - Configure o diretório como `backend/`

2. **Configurar as variáveis de ambiente no Railway:**
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=seu-jwt-secret-aqui
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://im-vel-certo-production.up.railway.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   NODE_ENV=production
   PORT=3000
   ```

3. **Configurar o banco de dados PostgreSQL no Railway:**
   - Adicione um serviço PostgreSQL
   - Execute o script SQL que criamos anteriormente
   - Configure a variável `DATABASE_URL`

### 2. Atualizar a URL da API

Já atualizei os arquivos:
- `src/lib/api.ts` - Agora aponta para o backend do Railway
- `env.txt` - Configurado para produção

### 3. Deploy do Backend

O backend está configurado com:
- ✅ Health check endpoints (`/health` e `/api/health`)
- ✅ Scripts de build configurados
- ✅ Configuração para Railway (`railway.json`)

## Próximos Passos

1. **Criar o projeto backend no Railway**
2. **Configurar as variáveis de ambiente**
3. **Executar o script SQL no banco de dados**
4. **Fazer deploy do backend**
5. **Testar a conexão**

## URLs Esperadas

- **Frontend**: `https://im-vel-certo-production.up.railway.app`
- **Backend**: `https://imovel-certo-backend-production.up.railway.app`
- **API Health**: `https://imovel-certo-backend-production.up.railway.app/api/health`

## Teste da Conexão

Após configurar o backend, teste:
```bash
curl https://imovel-certo-backend-production.up.railway.app/api/health
```

Deve retornar:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```
