import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import CreateMatchForm from '../components/CreateMatchForm';
import FilterForm from '../components/FilterForm';
import MatchCard from '../components/MatchCard';

function Matches() {
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilterForm, setShowFilterForm] = useState(false);

  useEffect(() => {
  setFilteredMatches(matches);
}, [matches]);

  const { data: matches = [], isLoading: loading, error } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      console.log('Solicitando partidos...');
      const response = await api.get('/matches');
      console.log('Partidos recibidos:', response.data);
      return response.data;
    },
    refetchOnMount: 'always',
    onError: (err) => {
      console.error('Error al obtener partidos:', err);
    },
  });

  const handleCreate = () => {
    queryClient.invalidateQueries(['matches']);
    setShowCreateForm(false);
  };

  const handleUpdate = (updatedMatch) => {
    queryClient.setQueryData(['matches'], (oldMatches) =>
      oldMatches.map((match) =>
        match._id === updatedMatch._id ? updatedMatch : match
      )
    );
    setFilteredMatches((prevMatches) =>
      prevMatches.map((match) =>
        match._id === updatedMatch._id ? updatedMatch : match
      )
    );
    queryClient.invalidateQueries(['matches']);
    queryClient.invalidateQueries(['ranking']);
  };

  const handleDelete = (matchId) => {
    queryClient.setQueryData(['matches'], (oldMatches) =>
      oldMatches.filter((match) => match._id !== matchId)
    );
    setFilteredMatches((prevMatches) =>
      prevMatches.filter((match) => match._id !== matchId)
    );
    queryClient.invalidateQueries(['matches']);
    queryClient.invalidateQueries(['ranking']);
  };

  const handleApplyFilters = (filters) => {
    let filtered = [...matches];

    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      filtered = filtered.filter((match) => {
        const matchDate = new Date(match.date);
        return matchDate >= dateFrom;
      });
    }
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      filtered = filtered.filter((match) => {
        const matchDate = new Date(match.date);
        return matchDate <= dateTo;
      });
    }

    if (filters.status !== 'Todos') {
      filtered = filtered.filter((match) => {
        const matchDateTime = new Date(`${match.date.split('T')[0]}T${match.time}`);
        const now = new Date();
        const isFinalized = matchDateTime <= now || match.result !== 'pending';
        return filters.status === 'Finalizado' ? isFinalized : !isFinalized;
      });
    }

    if (filters.result !== 'Todos') {
      filtered = filtered.filter((match) => {
        if (filters.result === 'Ganados') return match.result === 'won';
        if (filters.result === 'Perdidos') return match.result === 'lost';
        if (filters.result === 'Empatados') return match.result === 'draw';
        return true;
      });
    }

    setFilteredMatches(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral dark:bg-dark-bg py-8 text-center">
        <p className="text-lg text-gray-700 dark:text-dark-text-secondary">Cargando partidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral dark:bg-dark-bg py-8 text-center">
        <p className="text-lg text-red-500 dark:text-dark-error">{error.message || 'Error al cargar los partidos'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral dark:bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary dark:text-dark-text-accent mb-6 text-center">Tus partidos</h1>
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary text-white dark:bg-dark-primary dark:text-dark-text-primary px-6 py-3 rounded-lg font-medium hover:bg-secondary dark:hover:bg-dark-secondary transition-colors"
          >
            {showCreateForm ? 'Cerrar formulario' : 'Crear partido'}
          </button>
          <button
            onClick={() => setShowFilterForm(!showFilterForm)}
            className="bg-accent text-white dark:bg-dark-text-accent dark:text-dark-text-primary px-6 py-3 rounded-lg font-medium hover:bg-orange-500 dark:hover:bg-yellow-600 transition-colors"
          >
            {showFilterForm ? 'Cerrar filtros' : 'Filtros'}
          </button>
        </div>
        {showCreateForm && <CreateMatchForm onCreate={handleCreate} />}
        {showFilterForm && (
          <FilterForm
            isOpen={showFilterForm}
            onClose={() => setShowFilterForm(false)}
            onApplyFilters={handleApplyFilters}
          />
        )}
        <div className="space-y-6">
          {filteredMatches.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-dark-text-secondary">No tienes partidos que coincidan con los filtros.</p>
          ) : (
            filteredMatches.map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                user={user}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Matches;