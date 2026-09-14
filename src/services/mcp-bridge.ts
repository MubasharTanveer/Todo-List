import { TodoRepository } from './todo.repository';
import type { CreateTodoDTO, UpdateTodoDTO, TodoFilter } from '../types/todo';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPToolResult {
  isError?: boolean;
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export class MCPBridge {
  private repository: TodoRepository;
  private listeners: Set<(event: string, payload: any) => void> = new Set();

  constructor(repository: TodoRepository) {
    this.repository = repository;
  }

  public getManifest() {
    return {
      name: 'todo-mcp-service',
      version: '1.0.0',
      description: 'Model Context Protocol (MCP) bridge for the Todo Application',
      capabilities: {
        tools: true,
        resources: true
      }
    };
  }

  public getTools(): MCPToolDefinition[] {
    return [
      {
        name: 'list_todos',
        description: 'Query, search, filter and sort todos from the persistence layer.',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['all', 'active', 'completed'],
              description: 'Filter by completion status'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'all'],
              description: 'Filter by priority level'
            },
            category: {
              type: 'string',
              description: 'Filter by category name (e.g. "Work", "Design", "Personal")'
            },
            searchQuery: {
              type: 'string',
              description: 'Search substring across title, description, and category'
            },
            sortBy: {
              type: 'string',
              enum: ['createdAt_desc', 'createdAt_asc', 'priority_desc', 'priority_asc', 'title_asc'],
              description: 'Sort criteria'
            }
          }
        }
      },
      {
        name: 'get_todo',
        description: 'Fetch details of a single todo item by its unique ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique identifier of the todo item' }
          },
          required: ['id']
        }
      },
      {
        name: 'create_todo',
        description: 'Create a new todo item with title, priority, category, and optional notes.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'The title of the todo item (required, non-empty)' },
            description: { type: 'string', description: 'Optional detailed description or markdown notes' },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Priority level (default: medium)'
            },
            category: { type: 'string', description: 'Category or tag (default: General)' }
          },
          required: ['title']
        }
      },
      {
        name: 'update_todo',
        description: 'Update one or more fields of an existing todo item.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID of the todo to update' },
            title: { type: 'string', description: 'Updated title' },
            description: { type: 'string', description: 'Updated description' },
            completed: { type: 'boolean', description: 'Updated completed status flag' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            category: { type: 'string', description: 'Updated category' }
          },
          required: ['id']
        }
      },
      {
        name: 'toggle_todo',
        description: 'Toggle the completion status of a todo item.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID of the todo to toggle' }
          },
          required: ['id']
        }
      },
      {
        name: 'delete_todo',
        description: 'Delete a todo item by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID of the todo to delete' }
          },
          required: ['id']
        }
      },
      {
        name: 'clear_completed',
        description: 'Remove all completed todos from persistence.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_todo_stats',
        description: 'Retrieve statistical overview of todos (total, completed, pending, completion rate, counts by priority & category).',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'export_todos',
        description: 'Export all todos as a formatted JSON string.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'import_todos',
        description: 'Import or restore todos from a JSON array string.',
        inputSchema: {
          type: 'object',
          properties: {
            jsonString: { type: 'string', description: 'JSON serialized array of TodoItem objects' }
          },
          required: ['jsonString']
        }
      }
    ];
  }

  public async executeTool(name: string, params: Record<string, any> = {}): Promise<MCPToolResult> {
    try {
      let result: any;
      switch (name) {
        case 'list_todos': {
          const filter: TodoFilter = {
            status: params.status,
            priority: params.priority,
            category: params.category,
            searchQuery: params.searchQuery,
            sortBy: params.sortBy
          };
          result = this.repository.filter(filter);
          break;
        }
        case 'get_todo': {
          const item = this.repository.getById(params.id);
          if (!item) {
            return {
              isError: true,
              content: [{ type: 'text', text: `Todo item with id "${params.id}" not found.` }]
            };
          }
          result = item;
          break;
        }
        case 'create_todo': {
          const dto: CreateTodoDTO = {
            title: params.title,
            description: params.description,
            priority: params.priority,
            category: params.category
          };
          result = this.repository.create(dto);
          this.emit('todo_created', result);
          break;
        }
        case 'update_todo': {
          const { id, ...updates } = params;
          result = this.repository.update(id, updates as UpdateTodoDTO);
          this.emit('todo_updated', result);
          break;
        }
        case 'toggle_todo': {
          result = this.repository.toggle(params.id);
          this.emit('todo_toggled', result);
          break;
        }
        case 'delete_todo': {
          const deleted = this.repository.delete(params.id);
          result = { deleted, id: params.id };
          this.emit('todo_deleted', result);
          break;
        }
        case 'clear_completed': {
          const removed = this.repository.clearCompleted();
          result = { removedCount: removed };
          this.emit('todos_cleared', result);
          break;
        }
        case 'get_todo_stats': {
          result = this.repository.getStats();
          break;
        }
        case 'export_todos': {
          result = this.repository.exportJSON();
          break;
        }
        case 'import_todos': {
          result = this.repository.importJSON(params.jsonString);
          this.emit('todos_imported', result);
          break;
        }
        default:
          return {
            isError: true,
            content: [{ type: 'text', text: `Unknown tool name: ${name}` }]
          };
      }

      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: 'text', text: error?.message || 'An unexpected error occurred.' }]
      };
    }
  }

  public subscribe(listener: (event: string, payload: any) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: string, payload: any): void {
    this.listeners.forEach(fn => fn(event, payload));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('todo:mcp-event', { detail: { event, payload } }));
    }
  }
}

declare global {
  interface Window {
    __TODO_MCP_BRIDGE__?: MCPBridge;
  }
}
