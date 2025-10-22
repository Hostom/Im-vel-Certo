import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuração do pool de conexões PostgreSQL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Railway requer SSL
  } : undefined,
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL (Railway)');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no PostgreSQL:', err);
  process.exit(-1);
});

// Query helper com error handling
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Query executada:', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('❌ Erro na query:', { text, error });
    throw error;
  }
}

// Helper para transações
export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default pool;


