import { create, StoreApi, UseBoundStore } from 'zustand';
import { logger } from '../utils/logger';

/**
 * Base state and actions shared by all feature stores (sleep, exercise, journal, nutrition).
 */
export interface FeatureStoreState<T> {
  entries: T[];
  isLoading: boolean;
  error: string | null;

  loadEntries: () => Promise<void>;
  addEntry: (entry: T) => Promise<void>;
  updateEntry: (entry: T) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearError: () => void;
}

interface FeatureRepository<T> {
  getAll: () => Promise<T[]>;
  create: (entry: T) => Promise<void>;
  update: (entry: T) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

interface CreateFeatureStoreOptions<T> {
  name: string;
  repository: FeatureRepository<T>;
  getId: (entry: T) => string;
}

export function createFeatureStore<T>(
  options: CreateFeatureStoreOptions<T>
): UseBoundStore<StoreApi<FeatureStoreState<T>>> {
  const { name, repository, getId } = options;

  return create<FeatureStoreState<T>>((set, get) => ({
    entries: [],
    isLoading: false,
    error: null,

    loadEntries: async () => {
      set({ isLoading: true, error: null });
      try {
        const entries = await repository.getAll();
        logger.info(`${name}Store`, `Loaded ${entries.length} entries`);
        set({ entries, isLoading: false });
      } catch (error) {
        logger.error(`${name}Store`, 'Failed to load entries', error);
        set({
          error: `Failed to load ${name.toLowerCase()} data.`,
          isLoading: false,
        });
      }
    },

    addEntry: async (entry: T) => {
      try {
        await repository.create(entry);
        set({ entries: [...get().entries, entry] });
      } catch (error) {
        logger.error(`${name}Store`, 'Failed to add entry', error);
        set({ error: `Failed to add ${name.toLowerCase()} entry.` });
      }
    },

    updateEntry: async (entry: T) => {
      try {
        await repository.update(entry);
        const entries = get().entries.map(e =>
          getId(e) === getId(entry) ? entry : e
        );
        set({ entries });
      } catch (error) {
        logger.error(`${name}Store`, 'Failed to update entry', error);
        set({ error: `Failed to update ${name.toLowerCase()} entry.` });
      }
    },

    deleteEntry: async (id: string) => {
      try {
        await repository.delete(id);
        const entries = get().entries.filter(e => getId(e) !== id);
        set({ entries });
      } catch (error) {
        logger.error(`${name}Store`, 'Failed to delete entry', error);
        set({ error: `Failed to delete ${name.toLowerCase()} entry.` });
      }
    },

    clearError: () => {
      set({ error: null });
    },
  }));
}
