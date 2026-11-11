import { useState, useCallback, useEffect, useRef } from 'react';
import { FeedbackContext } from './feedbackContext';

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const timersRef = useRef(new Map());
  const resolverRef = useRef(null);

  const dismissToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'info', duration = 3500) => {
      if (!message) return;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismissToast]
  );

  const confirm = useCallback((options) => {
    const normalized =
      typeof options === 'string' ? { message: options } : options || {};
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        title: normalized.title || 'Xác nhận thao tác',
        message: normalized.message || 'Bạn có chắc chắn muốn thực hiện thao tác này?',
        confirmLabel: normalized.confirmLabel || 'Xác nhận',
        cancelLabel: normalized.cancelLabel || 'Hủy',
        danger: Boolean(normalized.danger),
      });
    });
  }, []);

  const closeDialog = useCallback((result) => {
    setDialog(null);
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!dialog) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDialog(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog, closeDialog]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none"
        >
          {toasts.map((item) => {
            const style =
              item.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-800'
                : item.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
                : 'bg-zinc-900 text-zinc-100 border-zinc-700';

            return (
              <div
                key={item.id}
                role="status"
                className={`pointer-events-auto flex items-start justify-between gap-3 px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium shadow-lg ${style}`} /* taste-skill-ignore: floating toast overlay */
              >
                <span className="leading-snug">{item.message}</span>
                <button
                  type="button"
                  onClick={() => dismissToast(item.id)}
                  aria-label="Đóng thông báo"
                  className="text-current opacity-70 hover:opacity-100 shrink-0 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Dialog */}
      {dialog && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
          onClick={() => closeDialog(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-xl space-y-4" /* taste-skill-ignore: modal dialog overlay */
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2
                id="confirm-dialog-title"
                className="text-base font-bold text-zinc-900 dark:text-white"
              >
                {dialog.title}
              </h2>
              <p
                id="confirm-dialog-desc"
                className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed"
              >
                {dialog.message}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => closeDialog(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
              >
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => closeDialog(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer transition-colors ${
                  dialog.danger
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-emerald-700 hover:bg-emerald-600'
                }`}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}
