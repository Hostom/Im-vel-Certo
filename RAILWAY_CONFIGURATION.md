# Configuração Correta do Railway

## Problema Identificado
O Railway estava tentando executar `npm start` no diretório raiz, mas o script `start` está no diretório `backend/`.

## Solução Implementada

### 1. Configuração do railway.json
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd backend && npm start"
  }
}
```

### 2. Configuração no Railway Dashboard

**IMPORTANTE**: No Railway Dashboard, configure:

1. **Root Directory**: `backend/`
   - Vá em Settings → Root Directory
   - Configure como `backend`

2. **Ou use a configuração automática**:
   - O railway.json agora está configurado para navegar automaticamente para o diretório backend

## Variáveis de Ambiente Necessárias

Configure estas variáveis no Railway:

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=mySuperSecretKey2024!@#$%^&*()_+{}[]|;':",./<>?
CORS_ORIGIN=https://im-vel-certo-production.up.railway.app
DATABASE_URL=postgresql://... (criado automaticamente pelo PostgreSQL)
```

## Próximos Passos

1. **Configure o Root Directory no Railway** como `backend/`
2. **Configure as variáveis de ambiente**
3. **Adicione PostgreSQL**
4. **Execute o script SQL**
5. **Faça deploy**

## Alternativa: Deploy Separado

Se preferir, você pode:
1. Criar um projeto separado no Railway só para o backend
2. Usar o diretório `backend/` como root
3. Manter o frontend em outro projeto

## Teste

Após configurar, teste:
```bash
curl https://seu-backend-url.railway.app/api/health
```
