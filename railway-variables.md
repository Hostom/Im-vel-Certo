# Variáveis de Ambiente para Railway

## Configurar no Railway Dashboard

Vá em **Variables** no seu projeto Railway e adicione estas variáveis:

### Obrigatórias:
```
NODE_ENV=production
PORT=3000
```

### Para JWT (Crie uma chave segura):
```
JWT_SECRET=seu-jwt-secret-super-seguro-aqui-mude-esta-chave
JWT_EXPIRES_IN=7d
```

### Para CORS (URL do seu frontend):
```
CORS_ORIGIN=https://im-vel-certo-production.up.railway.app
```

### Para Rate Limiting (Opcional):
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Para PostgreSQL (Será criada automaticamente):
```
DATABASE_URL=postgresql://...
```

## Ordem de Configuração:

1. **Primeiro**: Configure as variáveis básicas (NODE_ENV, PORT, JWT_SECRET, CORS_ORIGIN)
2. **Segundo**: Adicione o serviço PostgreSQL
3. **Terceiro**: Execute o script SQL das tabelas
4. **Quarto**: Faça deploy

## Exemplo de JWT_SECRET seguro:
```
JWT_SECRET=mySuperSecretKey2024!@#$%^&*()_+{}[]|;':",./<>?
```
