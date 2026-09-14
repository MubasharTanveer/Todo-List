import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageAdapter } from '../src/storage/memory-storage.adapter';
import { LocalStorageAdapter } from '../src/storage/local-storage.adapter';

describe('Storage Adapters', () => {
  describe('MemoryStorageAdapter', () => {
    let adapter: MemoryStorageAdapter<{ name: string; val: number }>;

    beforeEach(() => {
      adapter = new MemoryStorageAdapter();
    });

    it('should store and retrieve items', () => {
      expect(adapter.getItem('testKey')).toBeNull();
      adapter.setItem('testKey', { name: 'Item 1', val: 42 });
      expect(adapter.getItem('testKey')).toEqual({ name: 'Item 1', val: 42 });
    });

    it('should remove items properly', () => {
      adapter.setItem('itemA', { name: 'A', val: 1 });
      expect(adapter.getItem('itemA')).not.toBeNull();
      adapter.removeItem('itemA');
      expect(adapter.getItem('itemA')).toBeNull();
    });

    it('should clear all items', () => {
      adapter.setItem('k1', { name: 'K1', val: 1 });
      adapter.setItem('k2', { name: 'K2', val: 2 });
      adapter.clear();
      expect(adapter.getItem('k1')).toBeNull();
      expect(adapter.getItem('k2')).toBeNull();
    });

    it('should report availability', () => {
      expect(adapter.isAvailable()).toBe(true);
    });
  });

  describe('LocalStorageAdapter', () => {
    let adapter: LocalStorageAdapter<{ id: string; title: string }>;

    beforeEach(() => {
      localStorage.clear();
      adapter = new LocalStorageAdapter('test_prefix_');
    });

    it('should store and read from localStorage', () => {
      adapter.setItem('todos', [{ id: '1', title: 'Test Task' }]);
      const retrieved = adapter.getItem('todos');
      expect(retrieved).toEqual([{ id: '1', title: 'Test Task' }]);
    });

    it('should handle removeItem', () => {
      adapter.setItem('todos', [{ id: '1', title: 'Task' }]);
      adapter.removeItem('todos');
      expect(adapter.getItem('todos')).toBeNull();
    });

    it('should handle corrupt JSON gracefully by returning fallback', () => {
      localStorage.setItem('test_prefix_corrupt', 'INVALID_JSON_DATA{{{');
      const res = adapter.getItem('corrupt');
      expect(res).toBeNull();
    });

    it('should clear only items matching its prefix', () => {
      adapter.setItem('appData', [{ id: '1', title: 'Data' }]);
      localStorage.setItem('other_app_data', 'keep me');

      adapter.clear();

      expect(adapter.getItem('appData')).toBeNull();
      expect(localStorage.getItem('other_app_data')).toBe('keep me');
    });
  });
});
