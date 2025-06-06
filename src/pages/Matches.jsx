import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, parse } from 'date-fns';
import api from '../services/api';
import CreateMatchForm from '../components/CreateMatchForm';
import FilterForm from '../components/FilterForm';
import MatchCard from '../components/MatchCard';
import { useTranslation } from 'react-i18next';


function Matches() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilterForm, setShowFilterForm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { data: matches = [], isLoading: loading, error } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const response = await api.get('/matches');
      return response.data;
    },
    refetchOnMount: 'always',
    onError: (err) => {
      console.error('Error al obtener partidos:', err);
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dateFilter = params.get('date');

    if (dateFilter) {
      const selectedDate = parse(dateFilter, 'yyyy-MM-dd', new Date());
      const filtered = matches.filter((match) => {
        const matchDate = new Date(match.date);
        return (
          format(matchDate, 'yyyy-MM-dd') === dateFilter &&
          match.result === 'pending'
        );
      });
      setFilteredMatches(filtered);
    } else {
      setFilteredMatches(matches);
    }
  }, [matches, location.search]);

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

  const handleClearFilter = () => {
    navigate('/matches', { replace: true });
    setFilteredMatches(matches);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral dark:bg-dark-bg py-8 text-center">
        <p className="text-lg text-gray-700 dark:text-dark-text-secondary">{t('matches.loadingmatches')}</p>
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
        <h1 className="text-3xl font-bold text-primary dark:text-dark-text-accent mb-6 text-center">{t('matches.yourmatches')}</h1>
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-secondary text-white dark:bg-dark-primary dark:text-dark-text-primary px-6 py-3 rounded-lg font-medium hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
          >
            {showCreateForm ? t('matches.closeform') : t('matches.creatematch')}
          </button>
          <button
            onClick={() => setShowFilterForm(!showFilterForm)}
            className="bg-secondary text-white dark:bg-buttons dark:text-dark-text-primary px-6 py-3 rounded-lg font-medium hover:bg-buttonsHover dark:hover:bg-buttonsHover transition-colors"
          >
            {showFilterForm ? t('matches.closefilter') : t('matches.filter')}
          </button>
          {location.search.includes('date') && (
            <button
              onClick={handleClearFilter}
              className="bg-red-500 text-white dark:bg-red-600 dark:text-dark-text-primary px-6 py-3 rounded-lg font-medium hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
            >
              {t('matches.cleandate')}
            </button>
          )}
        </div>
        {showCreateForm && <CreateMatchForm onCreate={handleCreate} />}
        {showFilterForm && (
          <FilterForm
            isOpen={showFilterForm}
            onClose={() => setShowFilterForm(false)}
            onApplyFilters={handleApplyFilters}
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!filteredMatches || filteredMatches.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-dark-text-secondary col-span-full">{t('matches.nofilter')}</p>
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