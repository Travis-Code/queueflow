import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL env var is required');
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
    });
  }

  return pool;
}

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[]; rowCount: number }> {
  const activePool = getPool();
  const result = await activePool.query(text, params);
  return {
    rows: result.rows as T[],
    rowCount: result.rowCount ?? 0,
  };
}
