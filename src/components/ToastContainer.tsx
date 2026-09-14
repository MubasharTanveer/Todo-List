import React from 'react';
import { useTodo } from '../context/TodoContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useTodo();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`} role="alert">
          {toast.type === 'success' && <CheckCircle2 size={16} color="#10b981" />}
          {toast.type === 'error' && <AlertCircle size={16} color="#f43f5e" />}
          {toast.type === 'warning' && <AlertCircle size={16} color="#f59e0b" />}
          {toast.type === 'info' && <Info size={16} color="var(--accent-primary)" />}

          <span>{toast.message}</span>

          {toast.undoAction && (
            <button
              type="button"
              className="toast-undo-btn"
              onClick={() => {
                toast.undoAction?.();
                dismissToast(toast.id);
              }}
            >
              Undo
            </button>
          )}

          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            style={{ marginLeft: 'auto', display: 'flex', color: 'var(--text-muted)' }}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
