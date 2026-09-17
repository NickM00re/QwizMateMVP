import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generic, offline-first CRUD repository backed by AsyncStorage.
 *
 * The MVP has no backend yet, so every entity collection is persisted
 * entirely on-device as a JSON array under a single storage key. This keeps
 * previously generated notes, questions, and quiz history available with no
 * network connection, per the project's offline-support requirement.
 *
 * The interface here is deliberately narrow (get/getAll/save/remove) so a
 * future networked implementation (e.g. one that syncs to a backend and
 * falls back to this local cache) can be swapped in without touching any
 * screen or store code.
 */
export interface Repository<T extends {id: string}> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  save(entity: T): Promise<T>;
  remove(id: string): Promise<void>;
}

export class AsyncStorageRepository<T extends {id: string}>
  implements Repository<T>
{
  constructor(private readonly storageKey: string) {}

  async getAll(): Promise<T[]> {
    const raw = await AsyncStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      // Corrupt cache entry should never crash the app; treat as empty.
      return [];
    }
  }

  async getById(id: string): Promise<T | undefined> {
    const all = await this.getAll();
    return all.find(item => item.id === id);
  }

  async save(entity: T): Promise<T> {
    const all = await this.getAll();
    const index = all.findIndex(item => item.id === entity.id);
    if (index >= 0) {
      all[index] = entity;
    } else {
      all.push(entity);
    }
    await AsyncStorage.setItem(this.storageKey, JSON.stringify(all));
    return entity;
  }

  async removeMany(ids: string[]): Promise<void> {
    const all = await this.getAll();
    const idSet = new Set(ids);
    const remaining = all.filter(item => !idSet.has(item.id));
    await AsyncStorage.setItem(this.storageKey, JSON.stringify(remaining));
  }

  async remove(id: string): Promise<void> {
    await this.removeMany([id]);
  }
}
