# Troubleshooting Healthcheck no Railway

## O que é o Healthcheck?

O healthcheck é um mecanismo que o Railway usa para:
- ✅ Verificar se sua aplicação está funcionando
- ✅ Reiniciar automaticamente se falhar
- ✅ Só direcionar tráfego para instâncias saudáveis
- ✅ Garantir que o deploy foi bem-sucedido

## Por que está falhando?

### Possíveis causas:

1. **Servidor não está iniciando**
   - Variáveis de ambiente faltando
   - Erro na compilação
   - Porta incorreta

2. **Banco de dados não configurado**
   - DATABASE_URL não configurada
   - PostgreSQL não está rodando

3. **Configuração incorreta**
   - Healthcheck path errado
   - Timeout muito baixo

## Soluções

### Opção 1: Remover Healthcheck Temporariamente

Renomeie `railway.json` para `railway.json.backup` e use `railway-no-healthcheck.json`:

```bash
# No Railway, remova o healthcheck temporariamente
# Isso permitirá que o servidor inicie mesmo com problemas
```

### Opção 2: Configurar Variáveis de Ambiente

No Railway Dashboard, adicione:

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=mySuperSecretKey2024!@#$%^&*()_+{}[]|;':",./<>?
CORS_ORIGIN=https://im-vel-certo-production.up.railway.app
```

### Opção 3: Configurar PostgreSQL

1. Adicione serviço PostgreSQL no Railway
2. Execute o script `backend/database-setup.sql`
3. Railway criará automaticamente `DATABASE_URL`

### Opção 4: Verificar Logs

No Railway Dashboard:
1. Vá para o serviço do backend
2. Clique em "Deployments"
3. Veja os logs para identificar o erro específico

## Teste Manual

Após configurar, teste:

```bash
# Teste o healthcheck
curl https://seu-backend-url.railway.app/health

# Teste a API
curl https://seu-backend-url.railway.app/api/health
```

## Configuração Recomendada

Para produção, use:

```json
{
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

## Próximos Passos

1. **Primeiro**: Remova o healthcheck temporariamente
2. **Segundo**: Configure as variáveis de ambiente
3. **Terceiro**: Adicione PostgreSQL
4. **Quarto**: Reative o healthcheck
5. **Quinto**: Teste a aplicação
