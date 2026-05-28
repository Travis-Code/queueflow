import type { StoreAdapter } from './types';
import { inMemoryAdapter } from './inMemory';

/**
 * Global adapter resolver.
 * In production, this can be swapped to DatabaseAdapter when DATABASE_URL is set.
 * For now, defaults to in-memory.
 */
function resolveAdapter(): StoreAdapter {
  // Future: if (process.env.DATABASE_URL) { return databaseAdapter; }
  return inMemoryAdapter;
}

export const getAdapter = (): StoreAdapter => resolveAdapter();
