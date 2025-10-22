# Backend - Sistema de Gestão de Captação

Backend API Node.js + Express + PostgreSQL para o sistema Imóvel Certo.

## 🚀 Setup

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie `.env.example` para `.env` e preencha:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Railway.

### 3. Executar migrations
As migrations estão em `../Railway/migrations/`. Execute-as diretamente no Railway Database via dashboard ou psql.

### 4. Executar em desenvolvimento
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 📁 Estrutura

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts      # Configuração PostgreSQL
│   ├── middleware/
│   │   ├── auth.ts          # Middleware de autenticação JWT
│   │   └── errorHandler.ts # Tratamento de erros
│   ├── routes/
│   │   ├── auth.ts          # Rotas de login/logout
│   │   ├── usuarios.ts      # CRUD usuários
│   │   ├── demandas.ts      # CRUD demandas
│   │   └── missoes.ts       # CRUD missões
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── usuariosController.ts
│   │   ├── demandasController.ts
│   │   └── missoesController.ts
│   ├── services/
│   │   └── authService.ts   # Lógica de autenticação
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   └── server.ts            # Servidor Express
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens). Para acessar rotas protegidas:

1. Faça login em `POST /api/auth/login`
2. Receba o token JWT
3. Envie o token no header: `Authorization: Bearer {token}`

## 📝 Rotas Principais

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário autenticado

### Usuários
- `GET /api/usuarios` - Listar usuários
- `GET /api/usuarios/:id` - Buscar usuário
- `POST /api/usuarios` - Criar usuário (admin)
- `PUT /api/usuarios/:id` - Atualizar usuário (admin)

### Demandas
- `GET /api/demandas` - Listar demandas
- `GET /api/demandas/:id` - Buscar demanda
- `POST /api/demandas` - Criar demanda (gerente/admin)
- `PUT /api/demandas/:id` - Atualizar demanda (gerente/admin)

### Missões
- `GET /api/missoes` - Listar missões
- `GET /api/missoes/:id` - Buscar missão
- `POST /api/missoes` - Criar missão (gerente/admin)
- `PUT /api/missoes/:id` - Atualizar missão

## 🛠️ Deploy no Railway

1. Conecte o repositório ao Railway
2. Configure as variáveis de ambiente
3. Railway fará deploy automático

## 📦 Build para produção

```bash
npm run build
npm start
```


