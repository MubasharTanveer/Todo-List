#!/usr/bin/env node

/**
 * TaskFlow MCP Server (Model Context Protocol)
 * Implements standard JSON-RPC 2.0 over stdio for external agent orchestration
 * Compatible with Claude Desktop, Claude Code, OpenAI Codex, Cursor, and Antigravity.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.resolve(DATA_DIR, 'todos.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed if file does not exist
if (!fs.existsSync(DATA_FILE)) {
  const seeds = [
    {
      id: `seed_1_${Date.now()}`,
      title: 'Review MCP Protocol Architecture Specification',
      description: 'Ensure tool schemas and reflection endpoints align with Model Context Protocol standards.',
      completed: true,
      priority: 'high',
      category: 'Architecture',
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `seed_2_${Date.now()}`,
      title: 'Implement Decoupled Storage Layer',
      description: 'Build LocalStorageAdapter with automatic fallback to MemoryStorageAdapter.',
      completed: true,
      priority: 'medium',
      category: 'Storage',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `seed_3_${Date.now()}`,
      title: 'Setup CI/CD and AI Agent Development Workflow',
      description: 'Configure GitHub Actions and Claude Code / Codex integration bridges.',
      completed: false,
      priority: 'high',
      category: 'DevOps',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(DATA_FILE, JSON.stringify(seeds, null, 2), 'utf8');
}

function readTodos() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeTodos(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf8');
}

const TOOLS = [
  {
    name: 'list_todos',
    description: 'Query, search, filter and sort todos from persistence.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['all', 'active', 'completed'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'all'] },
        category: { type: 'string' },
        searchQuery: { type: 'string' }
      }
    }
  },
  {
    name: 'get_todo',
    description: 'Fetch details of a single todo item by unique ID.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id']
    }
  },
  {
    name: 'create_todo',
    description: 'Create a new todo item.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        category: { type: 'string' }
      },
      required: ['title']
    }
  },
  {
    name: 'update_todo',
    description: 'Update an existing todo item.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        completed: { type: 'boolean' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        category: { type: 'string' }
      },
      required: ['id']
    }
  },
  {
    name: 'toggle_todo',
    description: 'Toggle completion status of a todo item.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id']
    }
  },
  {
    name: 'delete_todo',
    description: 'Delete a todo item by ID.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id']
    }
  },
  {
    name: 'clear_completed',
    description: 'Remove all completed todos.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_todo_stats',
    description: 'Retrieve statistical overview of tasks.',
    inputSchema: { type: 'object', properties: {} }
  }
];

function handleToolCall(name, args = {}) {
  const todos = readTodos();

  switch (name) {
    case 'list_todos': {
      let filtered = [...todos];
      if (args.status && args.status !== 'all') {
        filtered = filtered.filter(t => t.completed === (args.status === 'completed'));
      }
      if (args.priority && args.priority !== 'all') {
        filtered = filtered.filter(t => t.priority === args.priority);
      }
      if (args.category && args.category !== 'all') {
        filtered = filtered.filter(t => (t.category || '').toLowerCase() === args.category.toLowerCase());
      }
      if (args.searchQuery) {
        const q = args.searchQuery.toLowerCase();
        filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
      }
      return filtered;
    }
    case 'get_todo': {
      const found = todos.find(t => t.id === args.id);
      if (!found) throw new Error(`Todo with ID ${args.id} not found.`);
      return found;
    }
    case 'create_todo': {
      if (!args.title || !args.title.trim()) throw new Error('Title is required');
      const now = new Date().toISOString();
      const newItem = {
        id: `todo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        title: args.title.trim(),
        description: args.description ? args.description.trim() : undefined,
        completed: false,
        priority: args.priority || 'medium',
        category: args.category || 'General',
        createdAt: now,
        updatedAt: now
      };
      todos.unshift(newItem);
      writeTodos(todos);
      return newItem;
    }
    case 'update_todo': {
      const idx = todos.findIndex(t => t.id === args.id);
      if (idx === -1) throw new Error(`Todo with ID ${args.id} not found.`);
      const current = todos[idx];
      const updated = {
        ...current,
        title: args.title !== undefined ? args.title.trim() : current.title,
        description: args.description !== undefined ? args.description : current.description,
        completed: args.completed !== undefined ? Boolean(args.completed) : current.completed,
        priority: args.priority || current.priority,
        category: args.category || current.category,
        updatedAt: new Date().toISOString()
      };
      todos[idx] = updated;
      writeTodos(todos);
      return updated;
    }
    case 'toggle_todo': {
      const idx = todos.findIndex(t => t.id === args.id);
      if (idx === -1) throw new Error(`Todo with ID ${args.id} not found.`);
      todos[idx].completed = !todos[idx].completed;
      todos[idx].updatedAt = new Date().toISOString();
      writeTodos(todos);
      return todos[idx];
    }
    case 'delete_todo': {
      const initLen = todos.length;
      const filtered = todos.filter(t => t.id !== args.id);
      writeTodos(filtered);
      return { deleted: filtered.length !== initLen, id: args.id };
    }
    case 'clear_completed': {
      const active = todos.filter(t => !t.completed);
      const removed = todos.length - active.length;
      writeTodos(active);
      return { removedCount: removed };
    }
    case 'get_todo_stats': {
      const total = todos.length;
      const completed = todos.filter(t => t.completed).length;
      return {
        total,
        completed,
        active: total - completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        byPriority: {
          low: todos.filter(t => t.priority === 'low').length,
          medium: todos.filter(t => t.priority === 'medium').length,
          high: todos.filter(t => t.priority === 'high').length
        }
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// JSON-RPC stdio handler
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', line => {
  if (!line.trim()) return;
  try {
    const msg = JSON.parse(line);
    handleMessage(msg);
  } catch (err) {
    sendError(null, -32700, 'Parse error', err.message);
  }
});

function handleMessage(msg) {
  const { id, method, params } = msg;

  switch (method) {
    case 'initialize':
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'taskflow-mcp-server',
          version: '1.0.0'
        }
      });
      break;

    case 'notifications/initialized':
      // Client ack
      break;

    case 'ping':
      sendResponse(id, {});
      break;

    case 'tools/list':
      sendResponse(id, { tools: TOOLS });
      break;

    case 'tools/call':
      try {
        const result = handleToolCall(params.name, params.arguments);
        sendResponse(id, {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        });
      } catch (err) {
        sendResponse(id, {
          isError: true,
          content: [{ type: 'text', text: err.message }]
        });
      }
      break;

    default:
      if (id !== undefined) {
        sendError(id, -32601, 'Method not found');
      }
  }
}

function sendResponse(id, result) {
  const payload = { jsonrpc: '2.0', id, result };
  process.stdout.write(JSON.stringify(payload) + '\n');
}

function sendError(id, code, message, data) {
  const payload = { jsonrpc: '2.0', id, error: { code, message, data } };
  process.stdout.write(JSON.stringify(payload) + '\n');
}

if (process.env.NODE_ENV !== 'test') {
  process.stderr.write('[TaskFlow MCP Server] Stdio server running and listening...\n');
}

export { handleToolCall, TOOLS };
