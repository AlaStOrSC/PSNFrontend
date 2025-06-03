import { useEffect } from 'react';

function Modal({ isOpen, onClose, title, message, showButtons = false, onConfirm, confirmLabel, cancelLabel }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
        {title && (
          <h2 className="text-lg font-semibold text-primaryText dark:text-dark-text-primary mb-4">{title}</h2>
        )}
        {message && (
          <p className="text-primaryText dark:text-dark-text-secondary mb-6">{message}</p>
        )}
        <div className="flex justify-end space-x-4">
          {showButtons ? (
            <>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-primary dark:bg-dark-primary text-white dark:text-dark-text-primary rounded-lg hover:bg-secondary dark:hover:bg-dark-secondary transition-colors"
              >
                {confirmLabel || 'Confirmar'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 dark:bg-dark-bg-tertiary text-primaryText dark:text-dark-text-secondary rounded-lg hover:bg-gray-400 dark:hover:bg-dark-border transition-colors"
              >
                {cancelLabel || 'Cancelar'}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-dark-bg-tertiary text-primaryText dark:text-dark-text-secondary rounded-lg hover:bg-gray-400 dark:hover:bg-dark-border transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;