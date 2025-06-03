import { useTranslation } from 'react-i18next';

function JoinMatchModal({ isOpen, onClose, onConfirm, title, message, showConfirm = true }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg dark:shadow-dark-shadow p-6 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-primaryText dark:text-dark-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="text-primaryText dark:text-dark-text-primary hover:text-gray-700 dark:hover:text-dark-text-accent"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-primaryText dark:text-dark-text-primary mb-6">{message}</p>
        <div className="flex justify-end space-x-2">
          {showConfirm && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white dark:bg-dark-bg-tertiary dark:text-dark-text-primary rounded-lg hover:bg-gray-600 dark:hover:bg-dark-bg transition-colors"
            >
              {t('home.join_confirm_no')}
            </button>
          )}
          <button
            onClick={showConfirm ? onConfirm : onClose}
            className="px-4 py-2 bg-secondary text-white dark:bg-dark-primary dark:text-dark-text-primary rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
          >
            {showConfirm ? t('home.join_confirm_yes') : t('home.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinMatchModal;