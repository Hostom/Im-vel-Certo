// Types e interfaces do sistema

export type AppRole = 'captador' | 'gerente_regional' | 'admin' | 'diretor';

export type StatusDemanda = 'pendente' | 'em_captacao' | 'concluida' | 'cancelada';

export type StatusMissao = 
  | 'pendente' 
  | 'em_andamento' 
  | 'imovel_encontrado' 
  | 'apresentado_cliente' 
  | 'locacao_fechada' 
  | 'cancelada' 
  | 'tempo_esgotado';

export type ResultadoMissao = 'sucesso' | 'fracasso' | 'tempo_esgotado';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  tipo: AppRole;
  regiao: string;
  regioes_responsavel?: string | null;
  gerente_responsavel_id?: string | null;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UsuarioSemSenha extends Omit<Usuario, 'senha_hash'> {}

export interface Demanda {
  id: string;
  codigo_demanda: string;
  consultor_locacao: string;
  cliente_interessado: string;
  contato: string;
  tipo_imovel: string;
  regiao_desejada: string;
  regiao_demanda: string;
  faixa_aluguel: string;
  valor_aluguel_min?: number | null;
  valor_aluguel_max?: number | null;
  caracteristicas_desejadas?: string | null;
  prazo_necessidade: string;
  observacoes?: string | null;
  criado_por_id?: string | null;
  status: StatusDemanda;
  created_at: Date;
  updated_at: Date;
}

export interface Missao {
  id: string;
  demanda_id: string;
  captador_id?: string | null;
  criado_por_id?: string | null;
  status: StatusMissao;
  data_atribuicao: Date;
  prazo_horas: number;
  data_limite?: Date | null;
  tempo_decorrido_minutos: number;
  observacoes_captador?: string | null;
  imovel_encontrado_detalhes?: string | null;
  data_conclusao?: Date | null;
  resultado?: ResultadoMissao | null;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  tipo: AppRole;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  user: UsuarioSemSenha;
}

// Tipos para Request com user autenticado
export interface AuthRequest extends Request {
  user?: JWTPayload;
}


