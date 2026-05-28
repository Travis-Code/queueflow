import type { ActivityConfig } from '@/types';
import { store } from './state';

export async function getConfig(): Promise<ActivityConfig> {
  return { ...store.config };
}

export async function updateConfig(updates: Partial<ActivityConfig>): Promise<ActivityConfig> {
  store.config = { ...store.config, ...updates };
  return store.config;
}