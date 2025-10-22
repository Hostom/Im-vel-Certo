# Como Corrigir o Erro RLS "new row violates row-level security policy"

## Problema
O erro ocorre porque a política RLS (Row Level Security) exige que o usuário tenha uma role específica (`admin`, `diretor` ou `gerente_regional`) na tabela `user_roles` para criar demandas.

## Solução - Opção 1: Executar SQL no Supabase (RECOMENDADO)

1. Acesse o painel do Supabase: https://supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Copie e cole o seguinte SQL:

```sql
-- Sincronizar roles de usuarios para user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, tipo::public.app_role
FROM public.usuarios
WHERE tipo IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar os usuários e suas roles
SELECT 
  u.nome,
  u.email,
  u.tipo,
  array_agg(ur.role) as roles
FROM public.usuarios u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
GROUP BY u.id, u.nome, u.email, u.tipo;
```

5. Clique em **Run** (▶️)
6. Verifique se seu usuário aparece com a role correta

## Solução - Opção 2: Atualizar Role Manualmente

Se você sabe o email do seu usuário, execute este SQL:

```sql
-- Substitua 'SEU_EMAIL@exemplo.com' pelo seu email
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM public.usuarios u
WHERE u.email = 'SEU_EMAIL@exemplo.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

## Solução - Opção 3: Atribuir Role via Código (Temporário para Desenvolvimento)

Você pode criar um script para atribuir a role automaticamente ao fazer login. Mas isso não é recomendado para produção.

## Verificar se funcionou

Após executar o SQL:
1. Faça logout do sistema
2. Faça login novamente
3. Tente criar uma demanda novamente

## Causa Raiz

O sistema usa duas tabelas para controle de acesso:
- `usuarios.tipo` - campo antigo (ainda usado para compatibilidade)
- `user_roles` - tabela nova (usada pelas políticas RLS)

A migration `20251015133911` deveria sincronizar automaticamente, mas pode não ter sido executada ou pode ter usuários criados depois dela.

## Prevenção

Para novos usuários, certifique-se de que ao criar um usuário na tabela `usuarios`, também seja criado um registro em `user_roles`.


