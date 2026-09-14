# Linear Ticket Workflow

This guide details the two-way integration and ticket reconciliation between **TaskFlow MCP** and **Linear**.

## Data Model Translation

| TaskFlow Field | Linear Issue Field | Conversion Logic |
| :--- | :--- | :--- |
| `id` | `id` | Prefixed with `linear_` |
| `title` | `title` | 1-to-1 string mapping |
| `description` | `description` | Markdown / details |
| `completed` | `state` | `true` -> `'Done'`, `false` -> `'Todo'` |
| `priority: 'high'` | `priority: 1` | Urgent / High |
| `priority: 'medium'` | `priority: 3` | Normal / Medium |
| `priority: 'low'` | `priority: 4` | Low |
| `category` | `labels[0]` | Direct label mapping |

## Sync Execution

You can use `LinearWorkflowService`:

```typescript
import { LinearWorkflowService } from './src/services/linear.service';

// Convert local task to Linear ticket format
const linearTicket = LinearWorkflowService.toLinearIssue(localTodo, 101);

// Ingest remote updates from Linear
const updatedTodos = LinearWorkflowService.reconcile(currentTodos, incomingLinearTickets);
```
