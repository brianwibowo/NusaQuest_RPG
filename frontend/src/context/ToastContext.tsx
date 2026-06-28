import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((message: string) => showToast(message, "success"), [showToast]);
  const error = useCallback((message: string) => showToast(message, "error"), [showToast]);
  const info = useCallback((message: string) => showToast(message, "info"), [showToast]);

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          container: "bg-emerald-50 border-emerald-200 text-emerald-900",
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        };
      case "error":
        return {
          container: "bg-red-50 border-red-200 text-red-900",
          icon: <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
        };
      case "info":
      default:
        return {
          container: "bg-blue-50 border-blue-200 text-blue-900",
          icon: <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}

      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm px-4 md:px-0 pointer-events-none">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md pointer-events-auto transition-all duration-300 animate-in slide-in-from-top-4 ${styles.container}`}
              role="alert"
            >
              <div className="flex gap-2.5 items-start">
                <div className="mt-0.5">{styles.icon}</div>
                <p className="text-xs font-bold leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0 p-0.5 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
