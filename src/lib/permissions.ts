// Utilitários para gerenciar permissões e hierarquia de usuários

export type UserRole = 'captador' | 'gerente_regional' | 'admin' | 'diretor';

export interface User {
  id: string;
  nome: string;
  email: string;
  tipo: UserRole;
  regiao: string;
  regioes_responsavel?: string | null;
  gerente_responsavel_id?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Hierarquia de permissões (maior para menor)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'diretor': 4,
  'admin': 3,
  'gerente_regional': 2,
  'captador': 1,
};

// Função para verificar se um usuário tem permissão baseada na hierarquia
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Função para verificar se um usuário pode criar demandas
export function canCreateDemanda(userRole: UserRole): boolean {
  return hasPermission(userRole, 'gerente_regional');
}

// Função para verificar se um usuário pode gerenciar usuários
export function canManageUsers(userRole: UserRole): boolean {
  return hasPermission(userRole, 'admin');
}

// Função para verificar se um usuário pode ver todas as demandas
export function canViewAllDemandas(userRole: UserRole): boolean {
  return hasPermission(userRole, 'gerente_regional');
}

// Função para verificar se um usuário pode atribuir missões
export function canAssignMissions(userRole: UserRole): boolean {
  return hasPermission(userRole, 'gerente_regional');
}

// Função para obter a descrição do papel
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    'captador': 'Busca imóveis para demandas atribuídas',
    'gerente_regional': 'Gerencia equipe e atribui demandas',
    'admin': 'Acesso total ao sistema',
    'diretor': 'Visão estratégica e aprovações',
  };
  return descriptions[role];
}

// Função para obter o nome amigável do papel
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    'captador': 'Captador(a)',
    'gerente_regional': 'Gerente Regional',
    'admin': 'Administrador',
    'diretor': 'Diretor',
  };
  return labels[role];
}

// Função para verificar se um usuário está ativo
export function isUserActive(user: User): boolean {
  return user.ativo;
}

// Função para verificar se um usuário pode acessar uma região específica
export function canAccessRegion(user: User, region: string): boolean {
  if (user.regiao === 'Geral' || user.regiao === region) {
    return true;
  }
  
  if (user.regioes_responsavel) {
    const regions = user.regioes_responsavel.split(',').map(r => r.trim());
    return regions.includes(region);
  }
  
  return false;
}
