import Confetti from 'react-confetti';

const ModalP = ({ isOpen, onClose, title, message, className = '', confetti = false, children, zIndex = 50 }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex }}>
      <div className={`bg-white rounded-lg p-6 max-w-md w-full ${className}`}>
        {confetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={200}
            recycle={false}
            colors={['#FFFF00', '#FF0000', '#FF69B4', '#00BFFF', '#FF00FF', '#00FF00', '#FFA500']}
          />
        )}
        <h2 className="text-xl font-semibold text-gray-700 dark:text-dark-text-primary mb-4">{title}</h2>
        {message && <p className="text-gray-600 dark:text-dark-text-secondary mb-6">{message}</p>}
        {children && <div className="mb-6">{children}</div>}
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
};

export default ModalP;