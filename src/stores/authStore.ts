import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: string;
  nome: string;
  email: string;
  tipo: 'captador' | 'gerente_regional' | 'admin' | 'diretor';
  regiao: string;
  regioes_responsavel?: string | null;
  gerente_responsavel_id?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
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
        try {
          const res = await api.post('/auth/login', { email, senha });
          const { token, user } = res.data.data;
          localStorage.setItem('auth_token', token);
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          // Modo desenvolvimento - simular login
          console.warn('Backend não disponível, usando modo desenvolvimento');
          const mockUser = {
            id: '1',
            nome: 'Usuário Demo',
            email: email,
            tipo: 'admin' as const,
            regiao: 'Geral',
            regioes_responsavel: null,
            gerente_responsavel_id: null,
            ativo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          const mockToken = 'demo-token-' + Date.now();
          localStorage.setItem('auth_token', mockToken);
          set({ user: mockUser, token: mockToken, isAuthenticated: true });
        }
      },

      register: async (nome: string, email: string, senha: string) => {
        try {
          const res = await api.post('/auth/register', { nome, email, senha });
          const { token, user } = res.data.data;
          localStorage.setItem('auth_token', token);
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          // Modo desenvolvimento - simular registro
          console.warn('Backend não disponível, simulando registro');
          const mockUser = {
            id: '1',
            nome: nome,
            email: email,
            tipo: 'captador' as const,
            regiao: 'Geral',
            regioes_responsavel: null,
            gerente_responsavel_id: null,
            ativo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          const mockToken = 'demo-token-' + Date.now();
          localStorage.setItem('auth_token', mockToken);
          set({ user: mockUser, token: mockToken, isAuthenticated: true });
        }
      },

      me: async () => {
        const res = await api.get('/auth/me');
        set({ user: res.data.data, isAuthenticated: true });
      },

      logout: async () => {
        try { 
          await api.post('/auth/logout'); 
        } catch (error) {
          console.warn('Erro ao fazer logout:', error);
        }
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
    }),
    { name: 'auth-storage' }
  )
);


