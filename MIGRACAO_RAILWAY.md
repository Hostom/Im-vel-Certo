# Guia de Migração: Supabase → Railway Database

## ⚠️ IMPORTANTE: Diferenças Principais

O Railway oferece **PostgreSQL puro**, diferente do Supabase que inclui:
- Autenticação integrada (`auth.uid()`)
- Row Level Security com autenticação automática
- APIs REST automáticas

Para Railway, precisamos:
1. **Backend próprio** (Node.js/Express recomendado)
2. **Sistema de autenticação** (JWT ou sessions)
3. **Controle de acesso** no backend (em vez de RLS)

---

## 📋 Passo 1: Criar Database no Railway

1. Acesse [Railway.app](https://railway.app)
2. Faça login/crie uma conta
3. Clique em **"New Project"**
4. Selecione **"Provision PostgreSQL"**
5. Copie as credenciais:
   - **DATABASE_URL** (string de conexão completa)
   - **PGHOST**, **PGPORT**, **PGUSER**, **PGPASSWORD**, **PGDATABASE**

---

## 📋 Passo 2: Executar Migrations no Railway

### Opção A: Via Railway Dashboard (Mais Simples)

1. No Railway, clique no seu banco PostgreSQL
2. Vá na aba **"Data"** ou **"Query"**
3. Execute os SQLs na pasta `Railway/migrations/` na ordem:
   - `01_initial_schema.sql` (schema sem RLS)
   - `02_seed_data.sql` (dados iniciais)

### Opção B: Via Cliente PostgreSQL Local

```bash
# Instalar PostgreSQL client (se não tiver)
# Windows: baixe de https://www.postgresql.org/download/windows/

# Conectar ao Railway
psql "postgresql://usuario:senha@host:porta/database"

# Executar migrations
\i Railway/migrations/01_initial_schema.sql
\i Railway/migrations/02_seed_data.sql
```

---

## 📋 Passo 3: Configurar Backend (Node.js + Express)

O projeto frontend React precisa se conectar a um **backend** que fará:
- Autenticação de usuários
- Validação de permissões
- Queries ao PostgreSQL

### Estrutura do Backend:
```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # Conexão PostgreSQL
│   ├── middleware/
│   │   └── auth.ts           # Validação JWT
│   ├── routes/
│   │   ├── auth.ts           # Login/Logout
│   │   ├── demandas.ts       # CRUD demandas
│   │   ├── missoes.ts        # CRUD missões
│   │   └── usuarios.ts       # CRUD usuários
│   ├── services/
│   │   └── authService.ts    # Lógica de autenticação
│   └── server.ts             # Servidor Express
├── package.json
└── tsconfig.json
```

---

## 📋 Passo 4: Atualizar Frontend

### 4.1 Remover `@supabase/supabase-js`
```bash
npm uninstall @supabase/supabase-js
```

### 4.2 Instalar bibliotecas necessárias
```bash
# Para comunicação com backend
npm install axios

# Para gerenciamento de estado de autenticação (opcional)
npm install zustand
```

### 4.3 Substituir chamadas Supabase por chamadas API REST

**Antes (Supabase):**
```typescript
const { data, error } = await supabase
  .from('demandas')
  .select('*')
  .eq('status', 'pendente');
```

**Depois (Railway + Backend):**
```typescript
const response = await axios.get('/api/demandas', {
  params: { status: 'pendente' },
  headers: { Authorization: `Bearer ${token}` }
});
const data = response.data;
```

---

## 📋 Passo 5: Migrar Dados Existentes (Opcional)

Se você já tem dados no Supabase:

1. **Exportar do Supabase:**
   - Via SQL Editor: `COPY (SELECT * FROM tabela) TO STDOUT CSV HEADER`
   - Ou use `pg_dump` se tiver acesso

2. **Importar no Railway:**
   ```bash
   psql "postgresql://..." -c "\COPY tabela FROM 'arquivo.csv' CSV HEADER"
   ```

---

## 📋 Passo 6: Variáveis de Ambiente

### Criar arquivo `.env` no frontend:
```env
# Railway Backend URL
VITE_API_URL=https://seu-backend.railway.app
```

### Criar arquivo `.env` no backend:
```env
# Railway Database
DATABASE_URL=postgresql://usuario:senha@host:porta/database

# JWT Secret (gere um aleatório)
JWT_SECRET=sua_chave_secreta_aqui_mude_isso

# Port
PORT=3000

# CORS Origin (URL do frontend)
CORS_ORIGIN=http://localhost:5173
```

---

## 🔐 Segurança: Alternativas ao RLS do Supabase

### Opção 1: Controle no Backend (Recomendado)

Validar permissões em cada rota:

```typescript
// middleware/checkRole.ts
export const requireRole = (roles: string[]) => {
  return (req, res, next) => {
    const userRole = req.user.tipo; // vem do JWT
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Permissão negada' });
    }
    
    next();
  };
};

// routes/demandas.ts
router.post('/demandas', 
  authenticateJWT, 
  requireRole(['admin', 'diretor', 'gerente_regional']),
  createDemanda
);
```

### Opção 2: Manter RLS com Context Personalizado

É possível manter RLS no PostgreSQL, mas requer:
1. Usar `SET LOCAL app.user_id = 'uuid'` antes de cada query
2. Adaptar políticas RLS para usar `current_setting('app.user_id')` em vez de `auth.uid()`

**Mais complexo**, mas mantém segurança no banco.

---

## 🚀 Deploy

### Frontend (Vercel/Netlify/Railway)
```bash
npm run build
# Fazer deploy da pasta dist/
```

### Backend (Railway)
1. Conecte o repositório do backend ao Railway
2. Railway detectará automaticamente Node.js
3. Configure as variáveis de ambiente
4. Deploy automático!

---

## ✅ Checklist Final

- [ ] Database PostgreSQL criado no Railway
- [ ] Migrations executadas
- [ ] Backend Node.js criado e funcionando
- [ ] Sistema de autenticação JWT implementado
- [ ] Frontend atualizado (removido Supabase)
- [ ] Variáveis de ambiente configuradas
- [ ] Dados migrados (se aplicável)
- [ ] Testes de login e permissões
- [ ] Deploy frontend e backend

---

## 📞 Próximos Passos

Escolha uma das opções:

### A) Migração Simples (Backend Básico)
Vou criar o backend básico com autenticação e rotas principais.

### B) Migração Completa (Com todas as funcionalidades)
Vou criar backend completo com todas as rotas, validações e lógica de negócio.

### C) Apenas SQL (Você cria o backend)
Vou preparar apenas as migrations SQL adaptadas para PostgreSQL puro.

**Qual opção você prefere?**


