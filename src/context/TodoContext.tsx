import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { TodoItem, CreateTodoDTO, UpdateTodoDTO, TodoFilter, TodoStats } from '../types/todo';
import { TodoRepository } from '../services/todo.repository';
import { MCPBridge } from '../services/mcp-bridge';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  undoAction?: () => void;
}

interface TodoContextValue {
  todos: TodoItem[];
  allTodos: TodoItem[];
  stats: TodoStats;
  categories: string[];
  filter: TodoFilter;
  setFilter: (updates: Partial<TodoFilter>) => void;
  resetFilter: () => void;
  createTodo: (dto: CreateTodoDTO) => TodoItem;
  updateTodo: (id: string, updates: UpdateTodoDTO) => TodoItem;
  toggleTodo: (id: string) => TodoItem;
  deleteTodo: (id: string) => boolean;
  clearCompleted: () => number;
  importTodos: (json: string) => { success: boolean; count: number; error?: string };
  exportTodos: () => string;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type'], undoAction?: () => void) => void;
  dismissToast: (id: string) => void;
  repository: TodoRepository;
  mcpBridge: MCPBridge;
}

const TodoContext = createContext<TodoContextValue | null>(null);

const DEFAULT_FILTER: TodoFilter = {
  status: 'all',
  priority: 'all',
  category: 'all',
  searchQuery: '',
  sortBy: 'createdAt_desc'
};

interface TodoProviderProps {
  children: ReactNode;
  repository?: TodoRepository;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children, repository: customRepo }) => {
  const repository = useMemo(() => customRepo || new TodoRepository(), [customRepo]);
  const mcpBridge = useMemo(() => new MCPBridge(repository), [repository]);

  // Version counter to trigger re-renders when data updates
  const [version, setVersion] = useState(0);
  const [filter, setFilterState] = useState<TodoFilter>(DEFAULT_FILTER);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('todo_theme_mode');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
    }
    return 'dark';
  });

  const refresh = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  // Expose MCP bridge globally and listen to external changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__TODO_MCP_BRIDGE__ = mcpBridge;
    }
    const unsubscribe = mcpBridge.subscribe(() => {
      refresh();
    });
    return () => {
      unsubscribe();
    };
  }, [mcpBridge, refresh]);

  // Apply theme class to document root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('todo_theme_mode', theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info', undoAction?: () => void) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastMessage = { id, message, type, undoAction };
    setToasts(prev => [...prev.slice(-3), newToast]); // keep max 4 toasts
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const setFilter = useCallback((updates: Partial<TodoFilter>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilterState(DEFAULT_FILTER);
  }, []);

  const createTodo = useCallback((dto: CreateTodoDTO) => {
    const created = repository.create(dto);
    refresh();
    showToast(`Task "${created.title}" added`, 'success');
    return created;
  }, [repository, refresh, showToast]);

  const updateTodo = useCallback((id: string, updates: UpdateTodoDTO) => {
    const updated = repository.update(id, updates);
    refresh();
    showToast(`Task updated`, 'info');
    return updated;
  }, [repository, refresh, showToast]);

  const toggleTodo = useCallback((id: string) => {
    const updated = repository.toggle(id);
    refresh();
    showToast(
      updated.completed ? `Completed: "${updated.title}"` : `Marked active: "${updated.title}"`,
      'info'
    );
    return updated;
  }, [repository, refresh, showToast]);

  const deleteTodo = useCallback((id: string) => {
    const itemToDelete = repository.getById(id);
    if (!itemToDelete) return false;

    const deleted = repository.delete(id);
    if (deleted) {
      refresh();
      showToast(`Deleted "${itemToDelete.title}"`, 'warning', () => {
        // Undo action: restore the item
        repository.create({
          title: itemToDelete.title,
          description: itemToDelete.description,
          priority: itemToDelete.priority,
          category: itemToDelete.category
        });
        refresh();
        showToast('Restored task', 'success');
      });
    }
    return deleted;
  }, [repository, refresh, showToast]);

  const clearCompleted = useCallback(() => {
    const count = repository.clearCompleted();
    if (count > 0) {
      refresh();
      showToast(`Cleared ${count} completed task${count > 1 ? 's' : ''}`, 'info');
    }
    return count;
  }, [repository, refresh, showToast]);

  const importTodos = useCallback((json: string) => {
    const res = repository.importJSON(json);
    if (res.success) {
      refresh();
      showToast(`Imported ${res.count} tasks successfully`, 'success');
    } else {
      showToast(res.error || 'Failed to import tasks', 'error');
    }
    return res;
  }, [repository, refresh, showToast]);

  const exportTodos = useCallback(() => {
    return repository.exportJSON();
  }, [repository]);

  // Derived computed data
  const todos = useMemo(() => {
    // depend on version to recompute
    void version;
    return repository.filter(filter);
  }, [repository, filter, version]);

  const allTodos = useMemo(() => {
    void version;
    return repository.getAll();
  }, [repository, version]);

  const stats = useMemo(() => {
    void version;
    return repository.getStats();
  }, [repository, version]);

  const categories = useMemo(() => {
    void version;
    return repository.getCategories();
  }, [repository, version]);

  const value: TodoContextValue = {
    todos,
    allTodos,
    stats,
    categories,
    filter,
    setFilter,
    resetFilter,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    importTodos,
    exportTodos,
    theme,
    toggleTheme,
    toasts,
    showToast,
    dismissToast,
    repository,
    mcpBridge
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useTodo = (): TodoContextValue => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};
