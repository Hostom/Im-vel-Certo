import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

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
  register: (nome: string, email: string, senha: string) => Promise<void>;
  me: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, senha: string) => {
        const res = await api.post('/auth/login', { email, senha });
        const { token, user } = res.data.data;
        localStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true });
      },

      register: async (nome: string, email: string, senha: string) => {
        await api.post('/auth/register', { nome, email, senha });
      },

      me: async () => {
        const res = await api.get('/auth/me');
        set({ user: res.data.data, isAuthenticated: true });
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
    }),
    { name: 'auth-storage' }
  )
);


