import React, { useRef } from 'react';
import { useTodo } from '../context/TodoContext';
import { CheckSquare, Moon, Sun, Download, Upload } from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, toggleTheme, exportTodos, importTodos, showToast } = useTodo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = exportTodos();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskflow-todos-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported todos to JSON file', 'success');
    } catch {
      showToast('Failed to export todos', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        importTodos(text);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="header-bar" role="banner">
      <div className="brand-wrapper">
        <div className="brand-icon-box" aria-hidden="true">
          <CheckSquare size={24} strokeWidth={2.4} />
        </div>
        <div>
          <h1 className="brand-title">TaskFlow MCP</h1>
          <p className="brand-tagline">Autonomous Todo Engine &amp; Verification Protocol</p>
        </div>
      </div>

      <div className="header-actions">
        <button
          type="button"
          onClick={handleExport}
          className="btn-pill"
          title="Export todos to JSON"
          aria-label="Export todos"
        >
          <Download size={15} />
          <span>Export</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-pill"
          title="Import todos from JSON file"
          aria-label="Import todos"
        >
          <Upload size={15} />
          <span>Import</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/json"
          style={{ display: 'none' }}
          aria-label="Upload JSON file"
        />

        <button
          type="button"
          onClick={toggleTheme}
          className="btn-icon"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </div>
    </header>
  );
};
