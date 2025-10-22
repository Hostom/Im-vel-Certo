# Como Importar Dados do Supabase para Railway

## 📋 Passo 1: Exportar dados do Supabase

1. Acesse o SQL Editor do Supabase
2. Execute o script `export_supabase_data.sql`
3. Copie cada resultado e salve em arquivos CSV:
   - `usuarios.csv`
   - `demandas.csv`
   - `missoes.csv`
   - `historico_missoes.csv`
   - `configuracoes_regionais.csv`

## 📋 Passo 2: Conectar ao Railway Database

Via psql (PostgreSQL client):

```bash
psql "postgresql://usuario:senha@host:porta/database"
```

Ou use o Railway Dashboard → Data → Query

## 📋 Passo 3: Importar dados

### Opção A: Via psql (Recomendado)

```sql
-- 1. Importar usuários (precisarão resetar senhas)
\COPY usuarios(id, nome, email, tipo, regiao, regioes_responsavel, gerente_responsavel_id, ativo, created_at, updated_at) 
FROM 'usuarios.csv' CSV HEADER;

-- 2. Definir senha temporária para todos (bcrypt hash de 'Temp123!')
UPDATE usuarios 
SET senha_hash = '$2b$10$rXvFkQQ7nN9J7tZxK5n5.OZKGqY9J7tZxK5n5OZKGqY9J7tZxK5n5O';

-- 3. Criar user_roles baseado no tipo
INSERT INTO user_roles (user_id, role)
SELECT id, tipo FROM usuarios
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Importar demandas
\COPY demandas FROM 'demandas.csv' CSV HEADER;

-- 5. Importar missões
\COPY missoes FROM 'missoes.csv' CSV HEADER;

-- 6. Importar histórico
\COPY historico_missoes FROM 'historico_missoes.csv' CSV HEADER;

-- 7. Importar configurações regionais (se não existirem)
\COPY configuracoes_regionais FROM 'configuracoes_regionais.csv' CSV HEADER 
ON CONFLICT (regiao) DO NOTHING;
```

### Opção B: Via Railway Dashboard

1. Vá em **Data** → **Import**
2. Selecione cada CSV e a tabela correspondente
3. Mapeie as colunas corretamente
4. Importe

## ⚠️ IMPORTANTE: Senhas

Após importar, todos os usuários terão a senha temporária: **`Temp123!`**

**Você deve:**
1. Avisar todos os usuários para alterarem a senha
2. Ou implementar um sistema de "primeiro login" com reset obrigatório
3. Ou criar um endpoint admin para resetar senhas individuais

## 🔍 Verificar importação

```sql
-- Contar registros
SELECT 'usuarios' as tabela, COUNT(*) FROM usuarios
UNION ALL
SELECT 'demandas', COUNT(*) FROM demandas
UNION ALL
SELECT 'missoes', COUNT(*) FROM missoes
UNION ALL
SELECT 'historico_missoes', COUNT(*) FROM historico_missoes;

-- Verificar usuários
SELECT nome, email, tipo, ativo FROM usuarios;
```

## 🚨 Troubleshooting

### Erro: "duplicate key value"
- Significa que já existem dados com os mesmos IDs
- Solução: Limpar tabela antes ou usar `ON CONFLICT DO NOTHING`

### Erro: "foreign key violation"
- Importar na ordem: usuarios → demandas → missoes → historico
- Verificar se todos os IDs referenciados existem

### Erro de encoding
- Certifique-se que os CSVs estão em UTF-8
- No Windows: salve com "UTF-8 BOM"


