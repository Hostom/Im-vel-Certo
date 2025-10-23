export interface User {
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

export interface Metrics {
  totalDemandas: number;
  demandasPendentes: number;
  missoesAtivas: number;
  captadoresAtivos: number;
}

export interface Missao {
  id: string;
  titulo: string;
  descricao: string;
  captador_id: string;
  demanda_id: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  created_at: string;
  updated_at: string;
}

export interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  captador_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Captador {
  id: string;
  nome: string;
  email: string;
  regiao: string;
  ativo: boolean;
}
