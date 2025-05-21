import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import CreateMatchForm from '../components/CreateMatchForm';
import FilterForm from '../components/FilterForm';
import MatchCard from '../components/MatchCard';

function Matches() {
  const { user } = useSelector((state) => state.auth);
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilterForm, setShowFilterForm] = useState(false);

  const fetchMatches = async () => {
    try {
      console.log('Solicitando partidos...');
      const response = await api.get('/matches');
      console.log('Partidos recibidos:', response.data);
      setMatches(response.data);
      setFilteredMatches(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener partidos:', err);
      setError(err.response?.data?.message || 'Error al cargar los partidos');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Ejecutando useEffect para fetchMatches...');
    fetchMatches();
    return () => console.log('Limpiando useEffect de Matches');
  }, []);

  const handleCreate = () => {
    fetchMatches();
    setShowCreateForm(false);
  };

  const handleUpdate = (updatedMatch) => {
    setMatches((prevMatches) =>
      prevMatches.map((match) =>
        match._id === updatedMatch._id ? updatedMatch : match
      )
    );
    setFilteredMatches((prevMatches) =>
      prevMatches.map((match) =>
        match._id === updatedMatch._id ? updatedMatch : match
      )
    );
  };

  const handleDelete = (matchId) => {
    setMatches((prevMatches) =>
      prevMatches.filter((match) => match._id !== matchId)
    );
    setFilteredMatches((prevMatches) =>
      prevMatches.filter((match) => match._id !== matchId)
    );
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
      <div className="min-h-screen bg-neutral py-8 text-center">
        <p className="text-lg text-gray-700">Cargando partidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral py-8 text-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">Tus partidos</h1>
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary transition-colors"
          >
            {showCreateForm ? 'Cerrar formulario' : 'Crear partido'}
          </button>
          <button
            onClick={() => setShowFilterForm(!showFilterForm)}
            className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-500 transition-colors"
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
        <div className="space-y-6">   {/* grid grid-cols-1 sm:grid-cols-2 gap-4*/}
          {filteredMatches.length === 0 ? (
            <p className="text-center text-gray-600">No tienes partidos que coincidan con los filtros.</p>
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