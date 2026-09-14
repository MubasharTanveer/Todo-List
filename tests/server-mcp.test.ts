import { describe, it, expect, beforeEach } from 'vitest';
import { handleToolCall, TOOLS } from '../server/mcp-server.js';
import fs from 'fs';
import path from 'path';

describe('Standalone MCP Server Engine', () => {
  beforeEach(() => {
    // reset data file for clean testing
    const dataFile = path.resolve(__dirname, '../data/todos.json');
    if (fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
    }
  });

  it('exposes all tools required by MCP protocol', () => {
    expect(TOOLS.length).toBeGreaterThanOrEqual(8);
    const names = TOOLS.map(t => t.name);
    expect(names).toContain('list_todos');
    expect(names).toContain('create_todo');
    expect(names).toContain('update_todo');
    expect(names).toContain('toggle_todo');
    expect(names).toContain('delete_todo');
    expect(names).toContain('clear_completed');
    expect(names).toContain('get_todo_stats');
  });

  it('creates, lists, and toggles todos via handleToolCall', () => {
    const created = handleToolCall('create_todo', {
      title: 'MCP Server Integration Test',
      priority: 'high',
      category: 'Protocol'
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe('MCP Server Integration Test');
    expect(created.completed).toBe(false);

    const list = handleToolCall('list_todos', { priority: 'high' });
    expect(list.length).toBe(1);

    const toggled = handleToolCall('toggle_todo', { id: created.id });
    expect(toggled.completed).toBe(true);

    const stats = handleToolCall('get_todo_stats', {});
    expect(stats.completed).toBe(1);
  });
});
