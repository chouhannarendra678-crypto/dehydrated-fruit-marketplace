import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible Modal dialog component
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest-dark/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`w-full ${maxWidth} transform overflow-hidden rounded-xl bg-oat-light p-6 text-left align-middle shadow-elevated transition-all border border-forest/20 relative`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-center justify-between pb-3 border-b border-forest/15">
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-forest tracking-tight font-display">
                  {title}
                </h3>
              )}
              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md p-1 text-ink-muted hover:text-forest hover:bg-oat-dark/50 transition-colors"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close modal</span>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

