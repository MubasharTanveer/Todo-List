import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MCPBridge } from '../src/services/mcp-bridge';
import { TodoRepository } from '../src/services/todo.repository';
import { MemoryStorageAdapter } from '../src/storage/memory-storage.adapter';

describe('Model Context Protocol (MCP) Bridge', () => {
  let repository: TodoRepository;
  let mcpBridge: MCPBridge;

  beforeEach(() => {
    const storage = new MemoryStorageAdapter<any>();
    storage.setItem('items', []);
    repository = new TodoRepository(storage);
    mcpBridge = new MCPBridge(repository);
  });

  it('should expose valid MCP server manifest', () => {
    const manifest = mcpBridge.getManifest();
    expect(manifest.name).toBe('todo-mcp-service');
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.capabilities.tools).toBe(true);
  });

  it('should list all registered MCP tool definitions with schemas', () => {
    const tools = mcpBridge.getTools();
    expect(tools.length).toBeGreaterThanOrEqual(9);

    const toolNames = tools.map(t => t.name);
    expect(toolNames).toContain('list_todos');
    expect(toolNames).toContain('create_todo');
    expect(toolNames).toContain('update_todo');
    expect(toolNames).toContain('toggle_todo');
    expect(toolNames).toContain('delete_todo');
    expect(toolNames).toContain('clear_completed');
    expect(toolNames).toContain('get_todo_stats');
    expect(toolNames).toContain('export_todos');
    expect(toolNames).toContain('import_todos');

    // Verify inputSchema structure
    tools.forEach(tool => {
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.description).toBeTruthy();
    });
  });

  it('should execute create_todo tool successfully', async () => {
    const result = await mcpBridge.executeTool('create_todo', {
      title: 'Task via MCP',
      priority: 'high',
      category: 'Autonomous'
    });

    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.title).toBe('Task via MCP');
    expect(parsed.priority).toBe('high');
    expect(parsed.category).toBe('Autonomous');
  });

  it('should execute list_todos and filter results', async () => {
    await mcpBridge.executeTool('create_todo', { title: 'First', priority: 'low' });
    await mcpBridge.executeTool('create_todo', { title: 'Second', priority: 'high' });

    const result = await mcpBridge.executeTool('list_todos', { priority: 'high' });
    expect(result.isError).toBeFalsy();
    const items = JSON.parse(result.content[0].text);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Second');
  });

  it('should execute toggle_todo and update_todo tools', async () => {
    const created = await mcpBridge.executeTool('create_todo', { title: 'Toggle Me' });
    const id = JSON.parse(created.content[0].text).id;

    // Toggle
    const toggleResult = await mcpBridge.executeTool('toggle_todo', { id });
    expect(toggleResult.isError).toBeFalsy();
    expect(JSON.parse(toggleResult.content[0].text).completed).toBe(true);

    // Update
    const updateResult = await mcpBridge.executeTool('update_todo', {
      id,
      title: 'Renamed Title'
    });
    expect(updateResult.isError).toBeFalsy();
    expect(JSON.parse(updateResult.content[0].text).title).toBe('Renamed Title');
  });

  it('should execute get_todo_stats tool', async () => {
    await mcpBridge.executeTool('create_todo', { title: 'Task 1', priority: 'high' });
    const statsResult = await mcpBridge.executeTool('get_todo_stats', {});
    expect(statsResult.isError).toBeFalsy();
    const stats = JSON.parse(statsResult.content[0].text);
    expect(stats.total).toBe(1);
    expect(stats.byPriority.high).toBe(1);
  });

  it('should return error for unknown tool or missing required params', async () => {
    const unknownRes = await mcpBridge.executeTool('non_existent_tool', {});
    expect(unknownRes.isError).toBe(true);

    const emptyTitleRes = await mcpBridge.executeTool('create_todo', { title: '' });
    expect(emptyTitleRes.isError).toBe(true);
  });

  it('should notify subscribers on data mutations', async () => {
    const listener = vi.fn();
    const unsubscribe = mcpBridge.subscribe(listener);

    await mcpBridge.executeTool('create_todo', { title: 'Event Task' });
    expect(listener).toHaveBeenCalledWith('todo_created', expect.any(Object));

    unsubscribe();
  });
});
