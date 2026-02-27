import { useEffect } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

/**
 * Reusable confirmation modal (logout, delete, etc.).
 * @param {boolean} open
 * @param {function} onClose
 * @param {function} onConfirm
 * @param {string} title
 * @param {string} message
 * @param {string} confirmLabel
 * @param {string} cancelLabel
 * @param {string} variant - 'primary' | 'danger' | 'ghost'
 * @param {boolean} loading - confirm button loading state
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
  confirmDisabled = false,
  children,
}) {
  useEffect(() => {
    if (open) {
      const handleEscape = (e) => e.key === 'Escape' && onClose();
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  const btnClass = {
    primary: 'btn-primary bg-[#3B613A] border-[#3B613A] hover:bg-[#4a7549]',
    danger: 'btn-error',
    ghost: 'btn-ghost',
  }[variant] || 'btn-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-base-200 flex items-center justify-center">
            <FiAlertCircle className="w-6 h-6 text-[#3B613A]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-modal-title" className="text-lg font-semibold text-[#303030]">
              {title}
            </h3>
            <p id="confirm-modal-desc" className="mt-1 text-base-content/70 text-sm">
              {message}
            </p>
            {children && <div className="mt-4">{children}</div>}
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6 justify-end">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${btnClass}`}
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
