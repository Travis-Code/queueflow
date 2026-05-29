import type { StoreAdapter } from './types';
import { inMemoryAdapter } from './inMemory';
import { postgresAdapter } from './postgres';

/**
 * Global adapter resolver.
 * Defaults to in-memory, but uses Postgres when configured.
 */
function resolveAdapter(): StoreAdapter {
  const mode = process.env.QUEUEFLOW_STORE;

  if (mode === 'memory') {
    return inMemoryAdapter;
  }

  if (mode === 'postgres') {
    if (!process.env.DATABASE_URL) {
      throw new Error('QUEUEFLOW_STORE=postgres requires DATABASE_URL');
    }
    return postgresAdapter;
  }

  if (process.env.DATABASE_URL) {
    return postgresAdapter;
  }

  return inMemoryAdapter;
}

export const getAdapter = (): StoreAdapter => resolveAdapter();
