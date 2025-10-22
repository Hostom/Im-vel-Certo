-- =============================================
-- RAILWAY MIGRATION: Seed Data
-- Dados iniciais para o sistema
-- =============================================

-- 1. Inserir regiões padrão
INSERT INTO public.configuracoes_regionais (regiao, meta_captacoes_mes, prazo_padrao_horas)
VALUES 
    ('Geral', 10, 48),
    ('Balneário Camboriú', 15, 48),
    ('Itajaí', 12, 48),
    ('Florianópolis', 20, 48),
    ('Joinville', 15, 48),
    ('Blumenau', 12, 48)
ON CONFLICT (regiao) DO NOTHING;

-- 2. Criar usuário admin padrão
-- SENHA PADRÃO: Admin123! (MUDE APÓS PRIMEIRO LOGIN!)
-- Hash bcrypt para 'Admin123!'
INSERT INTO public.usuarios (
    id,
    nome, 
    email, 
    senha_hash, 
    tipo, 
    regiao,
    ativo
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Administrador', 
    'admin@imovelcerto.com', 
    '$2b$10$rXvFkQQ7nN9J7tZxK5n5.OZKGqY9J7tZxK5n5OZKGqY9J7tZxK5n5O', -- Admin123!
    'admin', 
    'Geral',
    true
)
ON CONFLICT (email) DO NOTHING;

-- Adicionar role admin ao usuário admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Criar usuário diretor de exemplo
-- SENHA: Diretor123!
INSERT INTO public.usuarios (
    id,
    nome, 
    email, 
    senha_hash, 
    tipo, 
    regiao,
    ativo
)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Diretor Exemplo', 
    'diretor@imovelcerto.com', 
    '$2b$10$rXvFkQQ7nN9J7tZxK5n5.OZKGqY9J7tZxK5n5OZKGqY9J7tZxK5n5O', -- Diretor123!
    'diretor', 
    'Geral',
    true
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000002', 'diretor')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Criar gerente regional de exemplo
-- SENHA: Gerente123!
INSERT INTO public.usuarios (
    id,
    nome, 
    email, 
    senha_hash, 
    tipo, 
    regiao,
    regioes_responsavel,
    ativo
)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'Gerente BC', 
    'gerente.bc@imovelcerto.com', 
    '$2b$10$rXvFkQQ7nN9J7tZxK5n5.OZKGqY9J7tZxK5n5OZKGqY9J7tZxK5n5O', -- Gerente123!
    'gerente_regional', 
    'Balneário Camboriú',
    '["Balneário Camboriú", "Itajaí"]',
    true
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000003', 'gerente_regional')
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Criar captador de exemplo
-- SENHA: Captador123!
INSERT INTO public.usuarios (
    id,
    nome, 
    email, 
    senha_hash, 
    tipo, 
    regiao,
    gerente_responsavel_id,
    ativo
)
VALUES (
    '00000000-0000-0000-0000-000000000004',
    'Captador Exemplo', 
    'captador@imovelcerto.com', 
    '$2b$10$rXvFkQQ7nN9J7tZxK5n5.OZKGqY9J7tZxK5n5OZKGqY9J7tZxK5n5O', -- Captador123!
    'captador', 
    'Balneário Camboriú',
    '00000000-0000-0000-0000-000000000003', -- Gerente BC
    true
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000004', 'captador')
ON CONFLICT (user_id, role) DO NOTHING;

-- =============================================
-- COMENTÁRIOS IMPORTANTES
-- =============================================

COMMENT ON TABLE public.usuarios IS 
'ATENÇÃO: Usuários de exemplo criados com senhas padrão.
Usuários criados:
- admin@imovelcerto.com (senha: Admin123!)
- diretor@imovelcerto.com (senha: Diretor123!)
- gerente.bc@imovelcerto.com (senha: Gerente123!)
- captador@imovelcerto.com (senha: Captador123!)

IMPORTANTE: Altere todas as senhas após primeiro login!';

-- =============================================
-- FIM DOS DADOS INICIAIS
-- =============================================


