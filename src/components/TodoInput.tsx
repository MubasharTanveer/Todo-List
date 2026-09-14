import React, { useState } from 'react';
import { useTodo } from '../context/TodoContext';
import type { Priority } from '../types/todo';
import { Plus, ChevronDown, ChevronUp, Tag, FileText } from 'lucide-react';

export const TodoInput: React.FC = () => {
  const { createTodo, categories } = useTodo();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    createTodo({
      title: trimmedTitle,
      description: description.trim() || undefined,
      priority,
      category: category.trim() || 'General'
    });

    // Reset input
    setTitle('');
    setDescription('');
    setCategory('');
    setPriority('medium');
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="create-card">
      <form onSubmit={handleSubmit}>
        <div className="input-main-row">
          <input
            type="text"
            className="title-input"
            placeholder="Add a new task... (Press Enter or fill details)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="New task title"
            autoFocus
          />

          <button
            type="button"
            className="btn-icon"
            onClick={() => setIsExpanded(prev => !prev)}
            title={isExpanded ? 'Collapse options' : 'Add details & priority'}
            aria-label="Toggle task options"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <button
            type="submit"
            className="btn-create-submit"
            disabled={!title.trim()}
            aria-label="Submit task"
          >
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>

        {isExpanded && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              <FileText size={15} />
              <span>Description / Notes:</span>
            </div>
            <textarea
              className="description-textarea"
              placeholder="Add optional notes, links, or task specifications..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />

            <div className="create-options-row">
              <div className="options-left">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Priority:</span>
                <div className="priority-selector" role="radiogroup" aria-label="Task Priority">
                  <button
                    type="button"
                    className={`priority-btn ${priority === 'low' ? 'active low' : ''}`}
                    onClick={() => setPriority('low')}
                    role="radio"
                    aria-checked={priority === 'low'}
                  >
                    Low
                  </button>
                  <button
                    type="button"
                    className={`priority-btn ${priority === 'medium' ? 'active medium' : ''}`}
                    onClick={() => setPriority('medium')}
                    role="radio"
                    aria-checked={priority === 'medium'}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    className={`priority-btn ${priority === 'high' ? 'active high' : ''}`}
                    onClick={() => setPriority('high')}
                    role="radio"
                    aria-checked={priority === 'high'}
                  >
                    High
                  </button>
                </div>

                <div className="category-input-wrapper">
                  <Tag size={13} color="var(--text-muted)" />
                  <input
                    type="text"
                    className="category-input"
                    placeholder="Category (e.g. Work)"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    list="category-suggestions"
                  />
                  <datalist id="category-suggestions">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
