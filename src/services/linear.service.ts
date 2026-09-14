import type { TodoItem, Priority } from '../types/todo';

export interface LinearIssue {
  id: string;
  identifier: string; // e.g. "ENG-42"
  title: string;
  description?: string;
  state: 'Backlog' | 'Todo' | 'In Progress' | 'Done' | 'Canceled';
  priority: 0 | 1 | 2 | 3 | 4; // 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export class LinearWorkflowService {
  /**
   * Translates a TaskFlow Todo item to a Linear Issue payload
   */
  public static toLinearIssue(todo: TodoItem, ticketNumber: number = 100): LinearIssue {
    const priorityMap: Record<Priority, 1 | 2 | 3 | 4> = {
      high: 1,
      medium: 3,
      low: 4
    };

    return {
      id: `linear_${todo.id}`,
      identifier: `TASK-${ticketNumber}`,
      title: todo.title,
      description: todo.description,
      state: todo.completed ? 'Done' : 'Todo',
      priority: priorityMap[todo.priority] || 3,
      labels: [todo.category],
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    };
  }

  /**
   * Translates a Linear Issue to a TaskFlow Todo item
   */
  public static fromLinearIssue(issue: LinearIssue): TodoItem {
    let priority: Priority = 'medium';
    if (issue.priority === 1 || issue.priority === 2) {
      priority = 'high';
    } else if (issue.priority === 4) {
      priority = 'low';
    }

    return {
      id: issue.id.replace('linear_', ''),
      title: issue.title,
      description: issue.description,
      completed: issue.state === 'Done',
      priority,
      category: issue.labels[0] || 'Linear',
      createdAt: issue.createdAt || new Date().toISOString(),
      updatedAt: issue.updatedAt || new Date().toISOString()
    };
  }

  /**
   * Synchronizes an array of todos with Linear issues
   */
  public static reconcile(todos: TodoItem[], issues: LinearIssue[]): TodoItem[] {
    const todoMap = new Map(todos.map(t => [t.id, t]));

    issues.forEach(issue => {
      const existingId = issue.id.replace('linear_', '');
      if (todoMap.has(existingId)) {
        const existing = todoMap.get(existingId)!;
        existing.completed = issue.state === 'Done';
        existing.updatedAt = new Date().toISOString();
      } else {
        todoMap.set(existingId, LinearWorkflowService.fromLinearIssue(issue));
      }
    });

    return Array.from(todoMap.values());
  }
}
