# 🚀 Guia Rápido: Migração Supabase → Railway

## ✅ O que foi criado

1. **📁 Migrations SQL** (`Railway/migrations/`)
   - `01_initial_schema.sql` - Schema completo sem dependências do Supabase
   - `02_seed_data.sql` - Dados iniciais e usuários de exemplo
   - `03_optional_rls.sql` - RLS opcional (avançado)

2. **🔧 Backend Node.js** (`backend/`)
   - Express + PostgreSQL + JWT Auth
   - Rotas de autenticação e demandas
   - Middleware de segurança
   - Pronto para deploy no Railway

3. **📖 Documentação**
   - `MIGRACAO_RAILWAY.md` - Guia completo de migração
   - `FRONTEND_MIGRATION.md` - Como atualizar o frontend
   - `Railway/import_to_railway.md` - Como importar dados

## 🎯 Próximos Passos (Ordem Recomendada)

### 1️⃣ Criar Database no Railway (5 min)

1. Acesse [railway.app](https://railway.app)
2. Crie novo projeto → Provision PostgreSQL
3. Copie a `DATABASE_URL`

### 2️⃣ Executar Migrations (10 min)

**Opção A: Via Railway Dashboard**
- Vá em PostgreSQL → Query
- Cole e execute `Railway/migrations/01_initial_schema.sql`
- Cole e execute `Railway/migrations/02_seed_data.sql`

**Opção B: Via psql local**
```bash
psql "sua-database-url-aqui"
\i Railway/migrations/01_initial_schema.sql
\i Railway/migrations/02_seed_data.sql
```

### 3️⃣ Configurar Backend (10 min)

```bash
cd backend

# Instalar dependências
npm install

# Copiar .env.example para .env
cp .env.example .env

# Editar .env e adicionar:
# - DATABASE_URL do Railway
# - JWT_SECRET (qualquer string aleatória longa)
```

### 4️⃣ Testar Backend (5 min)

```bash
npm run dev
```

Deve aparecer:
```
✅ Conectado ao PostgreSQL (Railway)
🚀 Servidor rodando na porta 3000
```

Teste o login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@imovelcerto.com","senha":"Admin123!"}'
```

### 5️⃣ Atualizar Frontend (30 min)

Siga o guia: `FRONTEND_MIGRATION.md`

Resumo:
1. Atualizar `.env` com `VITE_API_URL`
2. Instalar `axios` e `zustand`
3. Criar `src/lib/api.ts` e `src/stores/authStore.ts`
4. Substituir chamadas `supabase.from()` por `api.get/post/put()`

### 6️⃣ Migrar Dados Existentes (Opcional)

Se você já tem dados no Supabase:

1. Execute `Railway/export_supabase_data.sql` no Supabase
2. Salve os CSVs
3. Siga `Railway/import_to_railway.md`

### 7️⃣ Deploy (20 min)

**Backend:**
- Conecte repositório ao Railway
- Configure variáveis de ambiente
- Deploy automático!

**Frontend:**
- Vercel/Netlify/Railway
- Atualize `VITE_API_URL` para URL do backend em produção

## 👥 Usuários de Teste

Criados automaticamente no `02_seed_data.sql`:

| Email | Senha | Tipo |
|-------|-------|------|
| admin@imovelcerto.com | Admin123! | admin |
| diretor@imovelcerto.com | Diretor123! | diretor |
| gerente.bc@imovelcerto.com | Gerente123! | gerente_regional |
| captador@imovelcerto.com | Captador123! | captador |

**⚠️ MUDE ESTAS SENHAS EM PRODUÇÃO!**

## 🆘 Problemas Comuns

### "Conexão recusada" no backend
- Verifique se `DATABASE_URL` está correta no `.env`
- Railway requer SSL em produção

### "Token inválido" no frontend
- Verifique se `JWT_SECRET` é o mesmo em produção e dev
- Limpe localStorage: `localStorage.clear()`

### "CORS error" no frontend
- Atualize `CORS_ORIGIN` no backend para URL do frontend

### Erros nas migrations
- Execute na ordem: 01 → 02
- Não execute 03 (RLS) a menos que saiba o que está fazendo

## 📚 Estrutura do Projeto

```
Imóvel-Certo/
├── backend/                 # Backend Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuração PostgreSQL
│   │   ├── controllers/    # Lógica das rotas
│   │   ├── middleware/     # Auth, error handling
│   │   ├── routes/         # Definição de rotas
│   │   ├── services/       # Lógica de negócio
│   │   └── server.ts       # Servidor
│   └── package.json
│
├── Railway/                # Migrations e scripts
│   ├── migrations/
│   │   ├── 01_initial_schema.sql
│   │   ├── 02_seed_data.sql
│   │   └── 03_optional_rls.sql
│   ├── export_supabase_data.sql
│   └── import_to_railway.md
│
├── src/                    # Frontend React (existente)
│   ├── lib/
│   │   └── api.ts          # Cliente API (criar)
│   ├── stores/
│   │   └── authStore.ts    # Store Zustand (criar)
│   └── ...
│
├── MIGRACAO_RAILWAY.md     # Guia completo
├── FRONTEND_MIGRATION.md   # Guia frontend
└── QUICK_START.md          # Este arquivo
```

## 🎓 Recursos Adicionais

- [Documentação Railway](https://docs.railway.app)
- [Express.js Docs](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io) - Debug de tokens JWT

## ✉️ Precisa de Ajuda?

1. Leia `MIGRACAO_RAILWAY.md` para detalhes completos
2. Verifique logs do backend: `npm run dev`
3. Inspecione Network tab do navegador
4. Teste endpoints com Postman/Thunder Client

---

**Boa sorte com a migração! 🚀**


