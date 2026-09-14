import React from 'react';
import { useTodo } from '../context/TodoContext';
import type { FilterStatus, Priority, SortOption } from '../types/todo';
import { Search, X, Trash2, ArrowUpDown } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const { filter, setFilter, categories, stats, clearCompleted } = useTodo();

  const handleStatusChange = (status: FilterStatus) => {
    setFilter({ status });
  };

  const handleCategoryChange = (category: string) => {
    setFilter({ category });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ priority: e.target.value as Priority | 'all' });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ sortBy: e.target.value as SortOption });
  };

  return (
    <div className="toolbar-card">
      <div className="toolbar-top">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, notes, or category..."
            value={filter.searchQuery || ''}
            onChange={e => setFilter({ searchQuery: e.target.value })}
            aria-label="Search tasks"
          />
          {filter.searchQuery && (
            <button
              type="button"
              onClick={() => setFilter({ searchQuery: '' })}
              style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="tabs-group" role="tablist" aria-label="Filter by status">
          <button
            type="button"
            className={`tab-btn ${filter.status === 'all' ? 'active' : ''}`}
            onClick={() => handleStatusChange('all')}
            role="tab"
            aria-selected={filter.status === 'all'}
          >
            All ({stats.total})
          </button>
          <button
            type="button"
            className={`tab-btn ${filter.status === 'active' ? 'active' : ''}`}
            onClick={() => handleStatusChange('active')}
            role="tab"
            aria-selected={filter.status === 'active'}
          >
            Active ({stats.active})
          </button>
          <button
            type="button"
            className={`tab-btn ${filter.status === 'completed' ? 'active' : ''}`}
            onClick={() => handleStatusChange('completed')}
            role="tab"
            aria-selected={filter.status === 'completed'}
          >
            Done ({stats.completed})
          </button>
        </div>
      </div>

      <div className="toolbar-bottom">
        <div className="category-chips" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={`chip ${filter.category === 'all' || !filter.category ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              type="button"
              key={cat}
              className={`chip ${filter.category === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="sort-select"
            value={filter.priority || 'all'}
            onChange={handlePriorityChange}
            aria-label="Filter by priority level"
          >
            <option value="all">Priority: All</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowUpDown size={14} color="var(--text-muted)" />
            <select
              className="sort-select"
              value={filter.sortBy || 'createdAt_desc'}
              onChange={handleSortChange}
              aria-label="Sort tasks"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="priority_desc">Priority (High to Low)</option>
              <option value="priority_asc">Priority (Low to High)</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
          </div>

          {stats.completed > 0 && (
            <button
              type="button"
              onClick={clearCompleted}
              className="btn-pill"
              style={{ color: 'var(--priority-high)', borderColor: 'var(--priority-high-border)' }}
              title="Clear all completed tasks"
              aria-label="Clear all completed tasks"
            >
              <Trash2 size={13} />
              <span>Clear Done</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
