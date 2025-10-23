# Configuração do Backend no Railway

## Problema Atual
O frontend está retornando erro 502 porque o backend não está configurado no Railway.

## Solução Imediata
O frontend agora funciona em **modo desenvolvimento** sem backend:
- Login/registro simulados
- Todas as funcionalidades funcionam
- Dados mockados para demonstração

## Para Configurar o Backend no Railway

### 1. Criar Projeto Backend

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Escolha "Deploy from GitHub repo"
4. Selecione o repositório `Im-vel-Certo`
5. **IMPORTANTE**: Configure **Root Directory** como `backend/`

### 2. Configurar Variáveis de Ambiente

No Railway Dashboard, adicione:

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=mySuperSecretKey2024!@#$%^&*()_+{}[]|;':",./<>?
CORS_ORIGIN=https://im-vel-certo-production.up.railway.app
```

### 3. Adicionar PostgreSQL

1. No Railway, clique em "New Service"
2. Escolha "Database" → "PostgreSQL"
3. Railway criará automaticamente `DATABASE_URL`

### 4. Executar Script SQL

1. Vá para o serviço PostgreSQL
2. Clique em "Query"
3. Execute o conteúdo do arquivo `backend/database-setup.sql`

### 5. Atualizar URL da API

Após o backend estar funcionando, atualize:

```typescript
// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'https://seu-backend-url.railway.app/api';
```

## Status Atual

- ✅ **Frontend**: Funcionando em modo desenvolvimento
- ✅ **Login/Registro**: Simulados e funcionais
- ✅ **Dashboard**: Acessível com dados mockados
- ⏳ **Backend**: Aguardando configuração no Railway

## Teste

1. Acesse o frontend
2. Faça login com qualquer email/senha
3. Explore todas as funcionalidades
4. Configure o backend quando necessário
