import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TodoProvider } from '../src/context/TodoContext';
import { TodoRepository } from '../src/services/todo.repository';
import { MemoryStorageAdapter } from '../src/storage/memory-storage.adapter';
import { AppContent } from '../src/App';

describe('Todo Application Integration Flows', () => {
  let memoryStorage: MemoryStorageAdapter<any>;
  let customRepo: TodoRepository;

  beforeEach(() => {
    memoryStorage = new MemoryStorageAdapter();
    memoryStorage.setItem('items', []); // empty initial state
    customRepo = new TodoRepository(memoryStorage);
  });

  const renderWithCustomRepo = () => {
    return render(
      <TodoProvider repository={customRepo}>
        <AppContent />
      </TodoProvider>
    );
  };

  it('renders application header, stats, and empty state', () => {
    renderWithCustomRepo();
    expect(screen.getByText(/TaskFlow MCP/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/All clear!/i)).toBeInTheDocument();
  });

  it('allows user to add a new task with title', async () => {
    const user = userEvent.setup();
    renderWithCustomRepo();

    const input = screen.getByPlaceholderText(/Add a new task.../i);
    const addButton = screen.getByRole('button', { name: /Submit task/i });

    await user.type(input, 'Autonomous Mission Verification');
    await user.click(addButton);

    // Verify task is displayed
    expect(screen.getByText('Autonomous Mission Verification')).toBeInTheDocument();
    // Verify toast notification appears
    expect(screen.getByText(/added/i)).toBeInTheDocument();
  });

  it('toggles task completion status when checkbox is clicked', async () => {
    const user = userEvent.setup();
    renderWithCustomRepo();

    const input = screen.getByPlaceholderText(/Add a new task.../i);
    await user.type(input, 'Checkbox Test Task{enter}');

    expect(screen.getByText('Checkbox Test Task')).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    await user.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(/Completed:/i)).toBeInTheDocument();
  });

  it('filters tasks by Active and Done tabs', async () => {
    const user = userEvent.setup();
    renderWithCustomRepo();

    const input = screen.getByPlaceholderText(/Add a new task.../i);
    await user.type(input, 'Task One{enter}');
    await user.type(input, 'Task Two{enter}');

    // Complete Task Two using its exact accessible label
    const checkboxTaskTwo = screen.getByLabelText(/Mark "Task Two" completed/i);
    await user.click(checkboxTaskTwo);

    // Click Active tab
    const activeTab = screen.getByRole('tab', { name: /Active/i });
    await user.click(activeTab);

    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(screen.queryByText('Task Two')).not.toBeInTheDocument();

    // Click Done tab
    const doneTab = screen.getByRole('tab', { name: /Done/i });
    await user.click(doneTab);

    expect(screen.queryByText('Task One')).not.toBeInTheDocument();
    expect(screen.getByText('Task Two')).toBeInTheDocument();
  });

  it('deletes a task and supports undoing the deletion', async () => {
    const user = userEvent.setup();
    renderWithCustomRepo();

    const input = screen.getByPlaceholderText(/Add a new task.../i);
    await user.type(input, 'Task To Delete{enter}');

    expect(screen.getByText('Task To Delete')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: /Delete "Task To Delete"/i });
    await user.click(deleteBtn);

    // Should be removed from list
    expect(screen.queryByText('Task To Delete')).not.toBeInTheDocument();

    // Undo button in toast
    const undoButton = screen.getByText(/Undo/i);
    await user.click(undoButton);

    // Should be restored
    await waitFor(() => {
      expect(screen.getByText('Task To Delete')).toBeInTheDocument();
    });
  });

  it('renders and expands MCP introspection drawer', async () => {
    const user = userEvent.setup();
    renderWithCustomRepo();

    const mcpToggle = screen.getByText(/Model Context Protocol \(MCP\) Introspection Bridge/i);
    await user.click(mcpToggle);

    expect(screen.getByText(/Registered MCP Tools/i)).toBeInTheDocument();
    expect(screen.getByText('list_todos')).toBeInTheDocument();
    expect(screen.getByText('create_todo')).toBeInTheDocument();
  });
});
