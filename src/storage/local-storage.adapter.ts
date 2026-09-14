import type { StorageAdapter } from './storage.interface';
import { MemoryStorageAdapter } from './memory-storage.adapter';

export class LocalStorageAdapter<T> implements StorageAdapter<T> {
  private fallback: MemoryStorageAdapter<T>;
  private prefix: string;
  private isLocalStorageSupported: boolean;

  constructor(prefix: string = 'todo_app_') {
    this.prefix = prefix;
    this.fallback = new MemoryStorageAdapter<T>();
    this.isLocalStorageSupported = this.checkStorageAvailability();
  }

  private checkStorageAvailability(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      const testKey = `__test_${Date.now()}__`;
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  getItem(key: string): T | null {
    if (!this.isLocalStorageSupported) {
      return this.fallback.getItem(key);
    }
    try {
      const raw = window.localStorage.getItem(this.getKey(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[LocalStorageAdapter] Failed to parse item for key "${key}", falling back.`, err);
      return this.fallback.getItem(key);
    }
  }

  setItem(key: string, value: T): void {
    const fullKey = this.getKey(key);
    const serialized = JSON.stringify(value);
    
    // Always keep fallback updated in case storage throws later
    this.fallback.setItem(key, value);

    if (this.isLocalStorageSupported) {
      try {
        window.localStorage.setItem(fullKey, serialized);
      } catch (err) {
        console.warn(`[LocalStorageAdapter] Failed to save key "${key}" to localStorage (quota or disabled). Using fallback.`, err);
      }
    }
  }

  removeItem(key: string): void {
    this.fallback.removeItem(key);
    if (this.isLocalStorageSupported) {
      try {
        window.localStorage.removeItem(this.getKey(key));
      } catch (err) {
        console.warn(`[LocalStorageAdapter] Failed to remove key "${key}".`, err);
      }
    }
  }

  clear(): void {
    this.fallback.clear();
    if (this.isLocalStorageSupported) {
      try {
        // Only clear keys belonging to this prefix
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(this.prefix)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => window.localStorage.removeItem(k));
      } catch (err) {
        console.warn('[LocalStorageAdapter] Failed to clear storage.', err);
      }
    }
  }

  isAvailable(): boolean {
    return this.isLocalStorageSupported;
  }
}
