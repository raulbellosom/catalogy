import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

/**
 * Modal component with smooth animations
 *
 * IMPORTANTE: Este componente DEBE usarse en lugar de alert(), confirm() o prompt() nativos.
 * Los dialogs nativos están PROHIBIDOS en todo el proyecto.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Callback when modal should close
 * @param {string} [props.title] - Modal title
 * @param {string} [props.description] - Modal description
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} [props.footer] - Modal footer with action buttons
 * @param {string} [props.size='md'] - Modal size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {boolean} [props.dismissible=true] - Whether clicking outside or pressing Escape closes the modal
 * @param {boolean} [props.showClose=true] - Whether to show close button
 * @param {string} [props.className] - Additional classes for the modal content
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
  showClose = true,
  className = "",
}) {
  // Close on Escape key
  useEffect(() => {
    if (!dismissible) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && open) onClose?.();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose, dismissible]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  const handleOverlayClick = () => {
    if (dismissible) {
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={handleOverlayClick}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] ${sizeClasses[size]} ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            {(title || description) && (
              <div className="shrink-0 px-6 pt-6 pb-4 border-b border-[var(--color-border)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {title && (
                      <h2 className="text-xl font-bold text-[var(--color-fg)] tracking-tight">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-1.5 text-sm text-[var(--color-fg-secondary)]">
                        {description}
                      </p>
                    )}
                  </div>

                  {/* Close button */}
                  {showClose && dismissible && (
                    <button
                      onClick={onClose}
                      className="shrink-0 rounded-lg p-1.5 text-[var(--color-fg-muted)] transition hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)]"
                      aria-label="Cerrar"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
              {children}
            </div>

            {/* Footer - Fixed (Optional) */}
            {footer && (
              <div className="shrink-0 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-card)] rounded-b-xl">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Modal footer for action buttons
 */
export function ModalFooter({ children, className = "" }) {
  return (
    <div
      className={`flex flex-col-reverse gap-2 sm:flex-row sm:justify-end ${className}`}
    >
      {children}
    </div>
  );
}
