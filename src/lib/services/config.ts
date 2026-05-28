import type { ActivityConfig } from '@/types';
import { getAdapter } from '@/lib/adapters';
import type { StoreAdapter } from '@/lib/adapters/types';

export async function getConfig(adapter?: StoreAdapter): Promise<ActivityConfig> {
  const a = adapter || getAdapter();
  return a.getConfig();
}

export async function updateConfig(
  updates: Partial<ActivityConfig>,
  adapter?: StoreAdapter,
): Promise<ActivityConfig> {
  const a = adapter || getAdapter();
  return a.updateConfig(updates);
}