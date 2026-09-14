import React, { useState } from 'react';
import type { TodoItem, Priority } from '../types/todo';
import { useTodo } from '../context/TodoContext';
import { Check, Edit2, Trash2, CheckCircle2, Save, X, Calendar } from 'lucide-react';

interface TodoItemCardProps {
  todo: TodoItem;
}

export const TodoItemCard: React.FC<TodoItemCardProps> = ({ todo }) => {
  const { toggleTodo, deleteTodo, updateTodo } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [editCategory, setEditCategory] = useState(todo.category);

  const handleToggle = () => {
    toggleTodo(todo.id);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;

    updateTodo(todo.id, {
      title: trimmedTitle,
      description: editDescription.trim() || undefined,
      priority: editPriority,
      category: editCategory.trim() || 'General'
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority);
    setEditCategory(todo.category);
    setIsEditing(false);
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(todo.createdAt));

  return (
    <div
      className={`todo-card ${todo.completed ? 'completed' : ''}`}
      data-testid={`todo-card-${todo.id}`}
    >
      <div className="todo-checkbox-wrapper">
        <button
          type="button"
          className={`custom-checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={handleToggle}
          aria-label={todo.completed ? `Mark "${todo.title}" active` : `Mark "${todo.title}" completed`}
          role="checkbox"
          aria-checked={todo.completed}
        >
          {todo.completed && <Check size={14} strokeWidth={3} />}
        </button>
      </div>

      <div className="todo-content-area">
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="edit-form">
            <input
              type="text"
              className="edit-input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              required
              aria-label="Edit task title"
              autoFocus
            />
            <textarea
              className="description-textarea"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              placeholder="Description..."
              rows={2}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  className="sort-select"
                  value={editPriority}
                  onChange={e => setEditPriority(e.target.value as Priority)}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>

                <input
                  type="text"
                  className="sort-select"
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  placeholder="Category"
                  style={{ width: '120px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button type="button" onClick={handleCancelEdit} className="btn-pill" title="Cancel edit">
                  <X size={14} />
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn-pill primary" title="Save changes">
                  <Save size={14} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <div className="todo-title-row">
              <span className="todo-title">{todo.title}</span>
            </div>

            {todo.description && <p className="todo-description">{todo.description}</p>}

            <div className="todo-metadata-row">
              <span className={`badge-priority ${todo.priority}`}>
                {todo.priority}
              </span>

              <span className="badge-category">
                {todo.category}
              </span>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={12} />
                <span>{formattedDate}</span>
              </span>

              {todo.completed && (
                <span style={{ color: 'var(--priority-low)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                  <CheckCircle2 size={12} />
                  <span>Done</span>
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {!isEditing && (
        <div className="todo-actions">
          <button
            type="button"
            className="btn-action"
            onClick={() => setIsEditing(true)}
            title="Edit task"
            aria-label={`Edit "${todo.title}"`}
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="btn-action delete"
            onClick={() => deleteTodo(todo.id)}
            title="Delete task"
            aria-label={`Delete "${todo.title}"`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
};
