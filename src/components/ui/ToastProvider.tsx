import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type Toast = ToastInput & { id: string };

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function variantClasses(variant: ToastVariant) {
  if (variant === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-950';
  if (variant === 'warning') return 'border-amber-200 bg-amber-50 text-amber-950';
  if (variant === 'error') return 'border-red-200 bg-red-50 text-red-950';
  return 'border-slate-200 bg-white text-slate-950';
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((input: ToastInput) => {
    const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const next: Toast = {
      id,
      variant: input.variant || 'info',
      durationMs: input.durationMs ?? 3500,
      title: input.title,
      description: input.description
    };
    setToasts((prev) => [next, ...prev].slice(0, 4));

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, next.durationMs);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border p-3 shadow-card ${variantClasses(t.variant || 'info')}`}
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold leading-snug">{t.title}</p>
            {t.description && <p className="mt-1 text-xs text-slate-700">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

