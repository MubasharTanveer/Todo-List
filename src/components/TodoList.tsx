import React from 'react';
import { useTodo } from '../context/TodoContext';
import { TodoItemCard } from './TodoItemCard';
import { ClipboardList, Sparkles } from 'lucide-react';

export const TodoList: React.FC = () => {
  const { todos, filter, resetFilter } = useTodo();

  if (todos.length === 0) {
    const isFiltered = filter.status !== 'all' || filter.priority !== 'all' || filter.category !== 'all' || Boolean(filter.searchQuery);

    return (
      <div className="empty-state" role="status">
        <div className="empty-icon-box">
          <ClipboardList size={32} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {isFiltered ? 'No matching tasks found' : 'All clear! No tasks on your plate'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isFiltered
              ? 'Try relaxing your search terms or filter criteria.'
              : 'Add a new mission task above to kickstart your pipeline.'}
          </p>
        </div>
        {isFiltered && (
          <button type="button" onClick={resetFilter} className="btn-pill primary">
            <Sparkles size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="todo-list-container" role="list" aria-label="Task items list">
      {todos.map(todo => (
        <TodoItemCard key={todo.id} todo={todo} />
      ))}
    </div>
  );
};
