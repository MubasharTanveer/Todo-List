export type Priority = 'low' | 'medium' | 'high';

export interface TodoItem {
  id: string; // UUID or timestamp-based unique ID
  title: string; // Non-empty string
  description?: string; // Optional detailed notes
  completed: boolean; // Status flag
  priority: Priority; // Categorization
  category: string; // Default: "General" or custom tags
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface CreateTodoDTO {
  title: string;
  description?: string;
  priority?: Priority;
  category?: string;
}

export interface UpdateTodoDTO {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  category?: string;
}

export type FilterStatus = 'all' | 'active' | 'completed';
export type SortOption = 'createdAt_desc' | 'createdAt_asc' | 'priority_desc' | 'priority_asc' | 'title_asc';

export interface TodoFilter {
  status?: FilterStatus;
  priority?: Priority | 'all';
  category?: string | 'all';
  searchQuery?: string;
  sortBy?: SortOption;
}

export interface TodoStats {
  total: number;
  completed: number;
  active: number;
  completionRate: number; // 0 to 100
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
  byCategory: Record<string, number>;
}
