import { useState } from 'react';
import FormContainer from './FormContainer';

function FilterForm({ isOpen, onClose, onApplyFilters }) {
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
      title="Filtrar partidos"
      submitLabel="Aplicar filtros"
      resetLabel="Limpiar filtros"
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          Fecha desde
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
          Fecha hasta
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
          Estado
        </label>
        <select
          name="status"
          value={filters.status}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
        >
          <option value="Todos">Todos</option>
          <option value="Finalizado">Finalizado</option>
          <option value="Pendiente">Pendiente</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          Resultado
        </label>
        <select
          name="result"
          value={filters.result}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
        >
          <option value="Todos">Todos</option>
          <option value="Ganados">Ganados</option>
          <option value="Perdidos">Perdidos</option>
          <option value="Empatados">Empatados</option>
        </select>
      </div>
    </FormContainer>
  );
}

export default FilterForm;