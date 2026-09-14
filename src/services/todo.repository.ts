import type { TodoItem, CreateTodoDTO, UpdateTodoDTO, TodoFilter, TodoStats, Priority } from '../types/todo';
import type { StorageAdapter } from '../storage/storage.interface';
import { LocalStorageAdapter } from '../storage/local-storage.adapter';

const STORAGE_KEY = 'items';

const DEFAULT_SEEDS: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Review MCP Protocol Architecture Specification',
    description: 'Ensure tool schemas and reflection endpoints align with Model Context Protocol standards.',
    completed: true,
    priority: 'high',
    category: 'Architecture'
  },
  {
    title: 'Implement Decoupled Storage Layer',
    description: 'Build LocalStorageAdapter with automatic fallback to MemoryStorageAdapter for headless environments.',
    completed: true,
    priority: 'medium',
    category: 'Storage'
  },
  {
    title: 'Optimize Glassmorphic Dashboard UI & Micro-interactions',
    description: 'Fine-tune fluid typography, high-contrast dark mode, and smooth toggle transitions.',
    completed: false,
    priority: 'high',
    category: 'Design'
  },
  {
    title: 'Write Automated Test Suite & Coverage Reports',
    description: 'Run unit & integration tests across storage adapters, domain repository, and React components.',
    completed: false,
    priority: 'low',
    category: 'Testing'
  }
];

export class TodoRepository {
  private storage: StorageAdapter<TodoItem[]>;
  private cache: TodoItem[] = [];

  constructor(storageAdapter?: StorageAdapter<TodoItem[]>) {
    this.storage = storageAdapter || new LocalStorageAdapter<TodoItem[]>('todo_app_');
    this.load();
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `todo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private load(): void {
    const data = this.storage.getItem(STORAGE_KEY);
    if (data && Array.isArray(data)) {
      this.cache = data;
    } else {
      this.cache = [];
      this.seedInitialData();
    }
  }

  private persist(): void {
    this.storage.setItem(STORAGE_KEY, this.cache);
  }

  private seedInitialData(): void {
    const now = new Date().toISOString();
    this.cache = DEFAULT_SEEDS.map((seed, idx) => ({
      ...seed,
      id: `seed_${idx + 1}_${Date.now()}`,
      createdAt: new Date(Date.now() - (4 - idx) * 3600000).toISOString(),
      updatedAt: now
    }));
    this.persist();
  }

  getAll(): TodoItem[] {
    return [...this.cache];
  }

  getById(id: string): TodoItem | undefined {
    return this.cache.find(item => item.id === id);
  }

  create(dto: CreateTodoDTO): TodoItem {
    const trimmedTitle = (dto.title || '').trim();
    if (!trimmedTitle) {
      throw new Error('Todo title cannot be empty.');
    }

    const now = new Date().toISOString();
    const newItem: TodoItem = {
      id: this.generateId(),
      title: trimmedTitle,
      description: dto.description ? dto.description.trim() : undefined,
      completed: false,
      priority: dto.priority || 'medium',
      category: (dto.category && dto.category.trim()) || 'General',
      createdAt: now,
      updatedAt: now
    };

    this.cache.unshift(newItem);
    this.persist();
    return newItem;
  }

  update(id: string, updates: UpdateTodoDTO): TodoItem {
    const index = this.cache.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Todo with id "${id}" not found.`);
    }

    const current = this.cache[index];
    const updatedTitle = updates.title !== undefined ? updates.title.trim() : current.title;
    if (updates.title !== undefined && !updatedTitle) {
      throw new Error('Todo title cannot be empty.');
    }

    const updatedItem: TodoItem = {
      ...current,
      title: updatedTitle,
      description: updates.description !== undefined ? (updates.description ? updates.description.trim() : undefined) : current.description,
      completed: updates.completed !== undefined ? Boolean(updates.completed) : current.completed,
      priority: updates.priority || current.priority,
      category: updates.category !== undefined ? (updates.category.trim() || 'General') : current.category,
      updatedAt: new Date().toISOString()
    };

    this.cache[index] = updatedItem;
    this.persist();
    return updatedItem;
  }

  toggle(id: string): TodoItem {
    const item = this.getById(id);
    if (!item) {
      throw new Error(`Todo with id "${id}" not found.`);
    }
    return this.update(id, { completed: !item.completed });
  }

  delete(id: string): boolean {
    const initialLen = this.cache.length;
    this.cache = this.cache.filter(item => item.id !== id);
    if (this.cache.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  clearCompleted(): number {
    const initialLen = this.cache.length;
    this.cache = this.cache.filter(item => !item.completed);
    const removedCount = initialLen - this.cache.length;
    if (removedCount > 0) {
      this.persist();
    }
    return removedCount;
  }

  filter(criteria: TodoFilter = {}): TodoItem[] {
    let result = [...this.cache];

    // Status filter
    if (criteria.status && criteria.status !== 'all') {
      const isCompleted = criteria.status === 'completed';
      result = result.filter(item => item.completed === isCompleted);
    }

    // Priority filter
    if (criteria.priority && criteria.priority !== 'all') {
      result = result.filter(item => item.priority === criteria.priority);
    }

    // Category filter
    if (criteria.category && criteria.category !== 'all') {
      result = result.filter(item => item.category.toLowerCase() === criteria.category!.toLowerCase());
    }

    // Search query filter
    if (criteria.searchQuery && criteria.searchQuery.trim()) {
      const q = criteria.searchQuery.trim().toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
      );
    }

    // Sorting
    const priorityWeights: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
    const sortBy = criteria.sortBy || 'createdAt_desc';

    result.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'createdAt_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority_desc':
          return priorityWeights[b.priority] - priorityWeights[a.priority];
        case 'priority_asc':
          return priorityWeights[a.priority] - priorityWeights[b.priority];
        case 'title_asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }

  getStats(): TodoStats {
    const total = this.cache.length;
    const completed = this.cache.filter(item => item.completed).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byPriority = {
      low: this.cache.filter(item => item.priority === 'low').length,
      medium: this.cache.filter(item => item.priority === 'medium').length,
      high: this.cache.filter(item => item.priority === 'high').length
    };

    const byCategory: Record<string, number> = {};
    this.cache.forEach(item => {
      const cat = item.category || 'General';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    return {
      total,
      completed,
      active,
      completionRate,
      byPriority,
      byCategory
    };
  }

  getCategories(): string[] {
    const set = new Set<string>();
    this.cache.forEach(item => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }

  exportJSON(): string {
    return JSON.stringify(this.cache, null, 2);
  }

  importJSON(jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'Imported payload must be an array of todo items.' };
      }

      // Validate items
      const validItems: TodoItem[] = [];
      for (const item of parsed) {
        if (!item || typeof item.title !== 'string' || !item.title.trim()) {
          continue;
        }
        const validItem: TodoItem = {
          id: typeof item.id === 'string' && item.id ? item.id : this.generateId(),
          title: item.title.trim(),
          description: typeof item.description === 'string' ? item.description.trim() : undefined,
          completed: Boolean(item.completed),
          priority: ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'medium',
          category: typeof item.category === 'string' && item.category.trim() ? item.category.trim() : 'General',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString()
        };
        validItems.push(validItem);
      }

      this.cache = validItems;
      this.persist();
      return { success: true, count: validItems.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'Invalid JSON format.' };
    }
  }
}
