import React from 'react';
import { useTodo } from '../context/TodoContext';
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

export const StatsOverview: React.FC = () => {
  const { stats } = useTodo();

  return (
    <section className="stats-grid" aria-label="Todo Statistics">
      <div className="stat-card">
        <div className="stat-header">
          <span>Total Tasks</span>
          <Layers size={16} color="var(--accent-primary)" />
        </div>
        <div className="stat-value">{stats.total}</div>
        <div className="stat-progress-bar">
          <div className="stat-progress-fill" style={{ width: `${stats.completionRate}%` }} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span>Pending</span>
          <Clock size={16} color="var(--priority-medium)" />
        </div>
        <div className="stat-value">{stats.active}</div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {stats.byPriority.high} high priority
        </span>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span>Completed</span>
          <CheckCircle2 size={16} color="var(--priority-low)" />
        </div>
        <div className="stat-value">{stats.completed}</div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {stats.completionRate}% efficiency
        </span>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span>Priorities</span>
          <AlertTriangle size={16} color="var(--priority-high)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
          <span className="badge-priority high" title="High Priority Tasks">
            {stats.byPriority.high} High
          </span>
          <span className="badge-priority medium" title="Medium Priority Tasks">
            {stats.byPriority.medium} Med
          </span>
          <span className="badge-priority low" title="Low Priority Tasks">
            {stats.byPriority.low} Low
          </span>
        </div>
      </div>
    </section>
  );
};
