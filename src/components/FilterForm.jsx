import { useState } from 'react';
import FormContainer from './FormContainer';
import { useTranslation } from 'react-i18next';


function FilterForm({ isOpen, onClose, onApplyFilters }) {
  const { t } = useTranslation()
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'Todos',
    result: 'Todos',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      status: 'Todos',
      result: 'Todos',
    });
    onApplyFilters({ dateFrom: '', dateTo: '', status: 'Todos', result: 'Todos' });
    onClose();
  };

  return (
    <FormContainer
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleApplyFilters}
      onReset={handleResetFilters}
      title={t('matches.filtermatches')}
      submitLabel={t('matches.applyfilters')}
      resetLabel={t('matches.cleanfilters')}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          {t('matches.datefrom')}
        </label>
        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          {t('matches.dateto')}
        </label>
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          {t('matches.state')}
        </label>
        <select
          name="status"
          value={filters.status}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
        >
          <option value="Todos">{t('matches.allfilter')}</option>
          <option value="Finalizado">{t('matches.finishedfilter')}</option>
          <option value="Pendiente">{t('matches.pendingfilter')}</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          {t('matches.result')}
        </label>
        <select
          name="result"
          value={filters.result}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
        >
          <option value="Todos">{t('matches.allfilter')}</option>
          <option value="Ganados">{t('matches.won')}</option>
          <option value="Perdidos">{t('matches.lost')}</option>
          <option value="Empatados">{t('matches.drawn')}</option>
        </select>
      </div>
    </FormContainer>
  );
}

export default FilterForm;