export interface StorageAdapter<T> {
  getItem(key: string): T | null;
  setItem(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
  isAvailable(): boolean;
}
