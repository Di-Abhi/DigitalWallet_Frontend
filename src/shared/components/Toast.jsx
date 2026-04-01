import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

let toastFn = null;

export function ToastProvider() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), toast.duration || 4000);
  }, []);

  useEffect(() => { toastFn = add; return () => { toastFn = null; }; }, [add]);

  const icons = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle };
  const styles = {
    success: 'border-l-4 border-emerald-500 bg-white dark:bg-slate-800',
    error: 'border-l-4 border-red-500 bg-white dark:bg-slate-800',
    info: 'border-l-4 border-cyan-500 bg-white dark:bg-slate-800',
    warning: 'border-l-4 border-yellow-500 bg-white dark:bg-slate-800',
  };
  const iconColors = { success: 'text-emerald-500', error: 'text-red-500', info: 'text-cyan-500', warning: 'text-yellow-500' };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80">
      {toasts.map((t) => {
        const Icon = icons[t.type] || Info;
        return (
          <div key={t.id} className={`${styles[t.type] || styles.info} shadow-lg rounded-xl p-4 flex items-start gap-3 animate-slide-in`}>
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColors[t.type]}`} />
            <div className="flex-1 min-w-0">
              {t.title && <p className="font-semibold text-sm text-[var(--text)]">{t.title}</p>}
              <p className="text-sm text-[var(--text-muted)]">{t.message}</p>
            </div>
            <button className="btn-ghost p-0.5 shrink-0" onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export const toast = {
  success: (message, title) => toastFn?.({ type: 'success', message, title }),
  error: (message, title) => toastFn?.({ type: 'error', message, title }),
  info: (message, title) => toastFn?.({ type: 'info', message, title }),
  warning: (message, title) => toastFn?.({ type: 'warning', message, title }),
};
