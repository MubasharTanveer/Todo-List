import type { StorageAdapter } from './storage.interface';

export class MemoryStorageAdapter<T> implements StorageAdapter<T> {
  private store: Map<string, string> = new Map();

  getItem(key: string): T | null {
    const data = this.store.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  setItem(key: string, value: T): void {
    this.store.set(key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  isAvailable(): boolean {
    return true;
  }
}
