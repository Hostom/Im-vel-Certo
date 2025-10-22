# Configuração Railway sem Healthcheck

## Decisão: Sem Healthcheck

Este projeto **NÃO usa healthcheck** no Railway porque:
- ✅ Simplifica o deploy
- ✅ Evita problemas de inicialização
- ✅ Funciona perfeitamente sem monitoramento automático
- ✅ Outros projetos no Railway funcionam bem sem healthcheck

## Configuração Railway

O projeto usa configuração simples sem healthcheck:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

## Configurar Variáveis de Ambiente

No Railway Dashboard, adicione:

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=mySuperSecretKey2024!@#$%^&*()_+{}[]|;':",./<>?
CORS_ORIGIN=https://im-vel-certo-production.up.railway.app
```

### Configurar PostgreSQL

1. Adicione serviço PostgreSQL no Railway
2. Execute o script `backend/database-setup.sql`
3. Railway criará automaticamente `DATABASE_URL`

### Verificar Logs

No Railway Dashboard:
1. Vá para o serviço do backend
2. Clique em "Deployments"
3. Veja os logs para identificar problemas

## Teste Manual

Após configurar, teste:

```bash
# Teste a API
curl https://seu-backend-url.railway.app/api/health
```

## Próximos Passos

1. **Primeiro**: Configure as variáveis de ambiente
2. **Segundo**: Adicione PostgreSQL
3. **Terceiro**: Execute o script SQL
4. **Quarto**: Teste a aplicação
