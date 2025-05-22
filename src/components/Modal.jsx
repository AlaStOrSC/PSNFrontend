import { XMarkIcon } from '@heroicons/react/24/solid';

function Modal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg dark:shadow-dark-shadow p-6 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-primary dark:text-dark-text-accent">{title}</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <p className="text-gray-700 dark:text-dark-text-secondary mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white dark:bg-dark-primary dark:text-dark-text-primary rounded-lg hover:bg-secondary dark:hover:bg-dark-secondary transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;