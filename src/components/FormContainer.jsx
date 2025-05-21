import { XMarkIcon } from '@heroicons/react/24/solid';

function FormContainer({ isOpen, onClose, onSubmit, onReset, title, submitLabel = 'Guardar', resetLabel = 'Limpiar', children }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-primary text-center">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        {children}
        <div className="flex justify-end space-x-2 mt-6">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              {resetLabel}
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormContainer;