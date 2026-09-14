import { describe, it, expect, beforeEach } from 'vitest';
import { TodoRepository } from '../src/services/todo.repository';
import { MemoryStorageAdapter } from '../src/storage/memory-storage.adapter';
import { TodoItem } from '../src/types/todo';

describe('TodoRepository Domain Logic', () => {
  let repository: TodoRepository;
  let memoryStorage: MemoryStorageAdapter<TodoItem[]>;

  beforeEach(() => {
    memoryStorage = new MemoryStorageAdapter();
    // Start with empty storage
    memoryStorage.setItem('items', []);
    repository = new TodoRepository(memoryStorage);
  });

  it('should create a todo matching strict TodoItem schema', () => {
    const created = repository.create({
      title: 'Build automated pipeline',
      description: 'Full stack testing suite',
      priority: 'high',
      category: 'CI/CD'
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe('Build automated pipeline');
    expect(created.description).toBe('Full stack testing suite');
    expect(created.completed).toBe(false);
    expect(created.priority).toBe('high');
    expect(created.category).toBe('CI/CD');
    expect(new Date(created.createdAt).toISOString()).toBe(created.createdAt);
    expect(new Date(created.updatedAt).toISOString()).toBe(created.updatedAt);
  });

  it('should reject creating a todo with an empty title', () => {
    expect(() => repository.create({ title: '   ' })).toThrow('Todo title cannot be empty.');
  });

  it('should update todo fields and refresh updatedAt timestamp', async () => {
    const item = repository.create({ title: 'Original Task' });
    const originalTime = item.updatedAt;

    // Small delay to ensure timestamp difference
    await new Promise(r => setTimeout(r, 10));

    const updated = repository.update(item.id, {
      title: 'Updated Task Title',
      completed: true,
      priority: 'high'
    });

    expect(updated.title).toBe('Updated Task Title');
    expect(updated.completed).toBe(true);
    expect(updated.priority).toBe('high');
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(originalTime).getTime());
  });

  it('should toggle todo completion state', () => {
    const item = repository.create({ title: 'Toggle Test' });
    expect(item.completed).toBe(false);

    const toggled = repository.toggle(item.id);
    expect(toggled.completed).toBe(true);

    const toggledAgain = repository.toggle(item.id);
    expect(toggledAgain.completed).toBe(false);
  });

  it('should delete a todo item by id', () => {
    const item = repository.create({ title: 'To be deleted' });
    expect(repository.getById(item.id)).toBeDefined();

    const deleted = repository.delete(item.id);
    expect(deleted).toBe(true);
    expect(repository.getById(item.id)).toBeUndefined();
  });

  it('should clear all completed todos', () => {
    const t1 = repository.create({ title: 'Active 1' });
    const t2 = repository.create({ title: 'Completed 1' });
    const t3 = repository.create({ title: 'Completed 2' });

    repository.toggle(t2.id);
    repository.toggle(t3.id);

    const clearedCount = repository.clearCompleted();
    expect(clearedCount).toBe(2);

    const remaining = repository.getAll();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(t1.id);
  });

  it('should filter todos by status, priority, category, and search query', () => {
    repository.create({ title: 'Alpha task', priority: 'high', category: 'Backend' });
    repository.create({ title: 'Beta design', description: 'Figma mockups', priority: 'low', category: 'Design' });
    const gamma = repository.create({ title: 'Gamma testing', priority: 'medium', category: 'QA' });
    repository.toggle(gamma.id);

    // Filter by status
    expect(repository.filter({ status: 'active' })).toHaveLength(2);
    expect(repository.filter({ status: 'completed' })).toHaveLength(1);

    // Filter by priority
    expect(repository.filter({ priority: 'high' })).toHaveLength(1);

    // Filter by category
    expect(repository.filter({ category: 'Design' })).toHaveLength(1);

    // Search query matching title
    expect(repository.filter({ searchQuery: 'Alpha' })).toHaveLength(1);
    // Search query matching description
    expect(repository.filter({ searchQuery: 'Figma' })).toHaveLength(1);
  });

  it('should sort todos correctly', () => {
    repository.create({ title: 'C task', priority: 'low' });
    repository.create({ title: 'A task', priority: 'high' });
    repository.create({ title: 'B task', priority: 'medium' });

    const sortedByPriorityDesc = repository.filter({ sortBy: 'priority_desc' });
    expect(sortedByPriorityDesc[0].priority).toBe('high');
    expect(sortedByPriorityDesc[1].priority).toBe('medium');
    expect(sortedByPriorityDesc[2].priority).toBe('low');

    const sortedByTitle = repository.filter({ sortBy: 'title_asc' });
    expect(sortedByTitle[0].title).toBe('A task');
    expect(sortedByTitle[1].title).toBe('B task');
    expect(sortedByTitle[2].title).toBe('C task');
  });

  it('should compute comprehensive statistics', () => {
    repository.create({ title: 'Task 1', priority: 'high', category: 'Core' });
    const t2 = repository.create({ title: 'Task 2', priority: 'medium', category: 'Core' });
    repository.create({ title: 'Task 3', priority: 'low', category: 'Docs' });

    repository.toggle(t2.id);

    const stats = repository.getStats();
    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(1);
    expect(stats.active).toBe(2);
    expect(stats.completionRate).toBe(33);
    expect(stats.byPriority).toEqual({ low: 1, medium: 1, high: 1 });
    expect(stats.byCategory).toEqual({ Core: 2, Docs: 1 });
  });

  it('should export and import JSON data correctly', () => {
    repository.create({ title: 'Exported task', priority: 'high' });
    const exportedJson = repository.exportJSON();
    expect(typeof exportedJson).toBe('string');

    // Create fresh repository
    const freshRepo = new TodoRepository(new MemoryStorageAdapter());
    const importRes = freshRepo.importJSON(exportedJson);
    expect(importRes.success).toBe(true);
    expect(importRes.count).toBe(1);

    const all = freshRepo.getAll();
    expect(all[0].title).toBe('Exported task');
  });
});
