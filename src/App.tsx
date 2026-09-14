import React from 'react';
import { TodoProvider } from './context/TodoContext';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { TodoInput } from './components/TodoInput';
import { FilterBar } from './components/FilterBar';
import { TodoList } from './components/TodoList';
import { MCPInspector } from './components/MCPInspector';
import { ToastContainer } from './components/ToastContainer';

export const AppContent: React.FC = () => {
  return (
    <main className="app-container">
      <Header />
      <StatsOverview />
      <TodoInput />
      <FilterBar />
      <TodoList />
      <MCPInspector />
      <ToastContainer />
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <TodoProvider>
      <AppContent />
    </TodoProvider>
  );
};

export default App;
