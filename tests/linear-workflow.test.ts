import { describe, it, expect } from 'vitest';
import { LinearWorkflowService, LinearIssue } from '../src/services/linear.service';
import { TodoItem } from '../src/types/todo';

describe('Linear Ticket Workflow Service', () => {
  it('translates TodoItem to LinearIssue format', () => {
    const todo: TodoItem = {
      id: 'task_1',
      title: 'Fix auth race condition',
      description: 'Occurs during session refresh',
      completed: false,
      priority: 'high',
      category: 'Security',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const linearIssue = LinearWorkflowService.toLinearIssue(todo, 101);
    expect(linearIssue.identifier).toBe('TASK-101');
    expect(linearIssue.title).toBe('Fix auth race condition');
    expect(linearIssue.state).toBe('Todo');
    expect(linearIssue.priority).toBe(1); // Urgent/High in Linear
    expect(linearIssue.labels).toContain('Security');
  });

  it('translates LinearIssue back to TodoItem schema', () => {
    const issue: LinearIssue = {
      id: 'linear_xyz_123',
      identifier: 'ENG-204',
      title: 'Implement Dark Mode tokens',
      description: 'Add contrast ratios for WCAG AA',
      state: 'Done',
      priority: 2,
      labels: ['Design System'],
      createdAt: '2026-09-14T10:00:00.000Z',
      updatedAt: '2026-09-14T12:00:00.000Z'
    };

    const todo = LinearWorkflowService.fromLinearIssue(issue);
    expect(todo.id).toBe('xyz_123');
    expect(todo.title).toBe('Implement Dark Mode tokens');
    expect(todo.completed).toBe(true);
    expect(todo.priority).toBe('high');
    expect(todo.category).toBe('Design System');
  });

  it('reconciles local todos with incoming Linear issues', () => {
    const localTodos: TodoItem[] = [
      {
        id: 't1',
        title: 'Local Task',
        completed: false,
        priority: 'medium',
        category: 'Core',
        createdAt: '2026-09-14T10:00:00Z',
        updatedAt: '2026-09-14T10:00:00Z'
      }
    ];

    const remoteIssues: LinearIssue[] = [
      {
        id: 'linear_t1',
        identifier: 'TASK-1',
        title: 'Local Task',
        state: 'Done',
        priority: 3,
        labels: ['Core'],
        createdAt: '2026-09-14T10:00:00Z',
        updatedAt: '2026-09-14T12:00:00Z'
      },
      {
        id: 'linear_t2',
        identifier: 'TASK-2',
        title: 'Remote Linear Task',
        state: 'Todo',
        priority: 4,
        labels: ['QA'],
        createdAt: '2026-09-14T11:00:00Z',
        updatedAt: '2026-09-14T11:00:00Z'
      }
    ];

    const reconciled = LinearWorkflowService.reconcile(localTodos, remoteIssues);
    expect(reconciled).toHaveLength(2);
    expect(reconciled.find(t => t.id === 't1')?.completed).toBe(true);
    expect(reconciled.find(t => t.id === 't2')?.title).toBe('Remote Linear Task');
  });
});
