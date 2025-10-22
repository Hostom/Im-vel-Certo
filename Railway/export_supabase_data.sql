-- =============================================
-- SCRIPT: Exportar dados do Supabase
-- =============================================
-- Execute este script no SQL Editor do Supabase
-- para exportar os dados atuais
-- =============================================

-- IMPORTANTE: Copie os resultados e salve em arquivos CSV

-- 1. Exportar usuários (sem senhas - você precisará resetá-las)
COPY (
  SELECT 
    id, 
    nome, 
    email,
    tipo,
    regiao,
    regioes_responsavel,
    gerente_responsavel_id,
    ativo,
    created_at,
    updated_at
  FROM public.usuarios
  ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Salve o resultado como: usuarios.csv

-- =============================================

-- 2. Exportar demandas
COPY (
  SELECT * FROM public.demandas
  ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Salve o resultado como: demandas.csv

-- =============================================

-- 3. Exportar missões
COPY (
  SELECT * FROM public.missoes
  ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Salve o resultado como: missoes.csv

-- =============================================

-- 4. Exportar histórico de missões
COPY (
  SELECT * FROM public.historico_missoes
  ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Salve o resultado como: historico_missoes.csv

-- =============================================

-- 5. Exportar configurações regionais
COPY (
  SELECT * FROM public.configuracoes_regionais
  ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Salve o resultado como: configuracoes_regionais.csv

-- =============================================
-- ATENÇÃO: SENHAS
-- =============================================
-- As senhas dos usuários NÃO serão exportadas por segurança.
-- Opções:
-- 1. Criar senhas temporárias para todos os usuários
-- 2. Implementar "reset de senha" para usuários fazerem login inicial
-- 3. Criar script para migrar hashes de senha (mais complexo)
-- =============================================


