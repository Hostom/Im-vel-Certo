# Migração do Frontend: Supabase → Railway Backend

## 📋 Passo 1: Atualizar Variáveis de Ambiente

Edite o arquivo `.env` (ou crie se não existir):

```env
# Remover variáveis do Supabase:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_PUBLISHABLE_KEY=...

# Adicionar URL do backend:
VITE_API_URL=http://localhost:3000/api
# Em produção, use a URL do Railway: https://seu-backend.railway.app/api
```

## 📋 Passo 2: Instalar Dependências

```bash
# Remover Supabase
npm uninstall @supabase/supabase-js

# Instalar Axios para chamadas HTTP
npm install axios

# Instalar Zustand para gerenciar estado de autenticação (opcional)
npm install zustand
```

## 📋 Passo 3: Criar Cliente da API

Crie o arquivo `src/lib/api.ts`:

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Criar instância do Axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 📋 Passo 4: Criar Store de Autenticação (Zustand)

Crie o arquivo `src/stores/authStore.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface User {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  regiao: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, senha: string) => {
        const response = await api.post('/auth/login', { email, senha });
        const { token, user } = response.data.data;

        localStorage.setItem('auth_token', token);

        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Erro ao fazer logout:', error);
        }

        localStorage.removeItem('auth_token');

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

## 📋 Passo 5: Atualizar Componente de Login

**Antes (com Supabase):**
```typescript
import { supabase } from '@/integrations/supabase/client';

const handleLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  // ...
};
```

**Depois (com Railway Backend):**
```typescript
import { useAuthStore } from '@/stores/authStore';

const { login } = useAuthStore();

const handleLogin = async (email: string, senha: string) => {
  try {
    await login(email, senha);
    // Redirecionar ou mostrar sucesso
  } catch (error) {
    // Tratar erro
    console.error('Erro no login:', error);
  }
};
```

## 📋 Passo 6: Atualizar Chamadas de API

### Exemplo: Listar Demandas

**Antes (Supabase):**
```typescript
const { data, error } = await supabase
  .from('demandas')
  .select('*')
  .eq('status', 'pendente');
```

**Depois (Railway):**
```typescript
import api from '@/lib/api';

const response = await api.get('/demandas', {
  params: { status: 'pendente' }
});
const data = response.data.data;
```

### Exemplo: Criar Demanda

**Antes (Supabase):**
```typescript
const { data, error } = await supabase
  .from('demandas')
  .insert([novaDemanda]);
```

**Depois (Railway):**
```typescript
const response = await api.post('/demandas', novaDemanda);
const data = response.data.data;
```

### Exemplo: Atualizar Demanda

**Antes (Supabase):**
```typescript
const { data, error } = await supabase
  .from('demandas')
  .update(updates)
  .eq('id', demandaId);
```

**Depois (Railway):**
```typescript
const response = await api.put(`/demandas/${demandaId}`, updates);
const data = response.data.data;
```

## 📋 Passo 7: Remover Arquivos do Supabase

Você pode manter ou remover:
```
src/integrations/supabase/
  - client.ts
  - types.ts
```

Apenas certifique-se de que nenhum arquivo está mais importando deles.

## 📋 Passo 8: Atualizar Proteção de Rotas

Se você usa React Router, crie um componente `ProtectedRoute`:

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

Use assim:
```typescript
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## 📋 Passo 9: Testar

1. Inicie o backend: `cd backend && npm run dev`
2. Inicie o frontend: `npm run dev`
3. Teste:
   - Login
   - Listar demandas
   - Criar demanda
   - Atualizar demanda
   - Logout

## 🎯 Checklist de Migração

- [ ] Variáveis de ambiente atualizadas
- [ ] Dependências instaladas (axios, zustand)
- [ ] Cliente API criado (`src/lib/api.ts`)
- [ ] Store de autenticação criado
- [ ] Componente de Login atualizado
- [ ] Todas as chamadas Supabase substituídas por API REST
- [ ] Arquivos do Supabase removidos (opcional)
- [ ] Proteção de rotas implementada
- [ ] Testes realizados

## 🚀 Próximos Passos

- Implementar refresh token (opcional)
- Adicionar loading states
- Implementar tratamento de erros global
- Adicionar cache com React Query (opcional)
- Deploy do frontend

## 📞 Dúvidas?

Consulte o `MIGRACAO_RAILWAY.md` para mais informações sobre o processo completo.


