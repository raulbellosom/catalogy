import { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";

const ToastContext = createContext(null);

/**
 * Hook para usar toasts en componentes
 *
 * IMPORTANTE: Este hook DEBE usarse en lugar de alert() nativo.
 * Los alerts nativos están PROHIBIDOS en todo el proyecto.
 *
 * @example
 * const toast = useToast();
 * toast.success("Operación exitosa");
 * toast.error("Algo salió mal");
 * toast.info("Información importante");
 * toast.warning("Ten cuidado");
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

const toastVariants = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.95 },
};

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: {
    bg: "bg-green-500/10 dark:bg-green-500/20",
    border: "border-green-500/30",
    text: "text-green-700 dark:text-green-400",
    icon: "text-green-600 dark:text-green-400",
  },
  error: {
    bg: "bg-red-500/10 dark:bg-red-500/20",
    border: "border-red-500/30",
    text: "text-red-700 dark:text-red-400",
    icon: "text-red-600 dark:text-red-400",
  },
  warning: {
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    border: "border-orange-500/30",
    text: "text-orange-700 dark:text-orange-400",
    icon: "text-orange-600 dark:text-orange-400",
  },
  info: {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    border: "border-blue-500/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: "text-blue-600 dark:text-blue-400",
  },
};

function Toast({ id, type, title, message, duration, onClose }) {
  const Icon = ICONS[type];
  const colors = COLORS[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg max-w-md w-full ${colors.bg} ${colors.border}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${colors.icon}`} />

      <div className="flex-1 min-w-0">
        {title && (
          <p className={`font-semibold text-sm ${colors.text}`}>{title}</p>
        )}
        {message && (
          <p className={`text-sm ${title ? "mt-1" : ""} ${colors.text}`}>
            {message}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className={`shrink-0 rounded-lg p-1 transition hover:bg-black/10 ${colors.text}`}
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

/**
 * ToastProvider - Debe envolver la aplicación
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ type, title, message, duration = 5000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toast = {
    success: (message, title = "Éxito") =>
      addToast({ type: "success", title, message }),
    error: (message, title = "Error") =>
      addToast({ type: "error", title, message }),
    warning: (message, title = "Advertencia") =>
      addToast({ type: "warning", title, message }),
    info: (message, title = "Información") =>
      addToast({ type: "info", title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-0 right-0 z-[200] p-4 pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <AnimatePresence>
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                {...toast}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
