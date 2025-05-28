import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import FormContainer from './FormContainer';

function CreateMatchForm({ onCreate }) {
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    player2: '',
    player3: '',
    player4: '',
    date: '',
    time: '',
    city: user?.city || '',
  });

  const { data: users = [], isLoading: loadingUsers, error: errorUsers } = useQuery({
    queryKey: ['ranking'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
    onError: (error) => {
      console.error('Error al obtener usuarios:', error);
    },
  });

  const createMatchMutation = useMutation({
    mutationFn: async (newMatchData) => {
      console.log('Creando partido:', newMatchData);
      const response = await api.post('/matches', newMatchData);
      console.log('Partido creado:', response.data.match);
      return response.data.match;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['matches']);
      queryClient.invalidateQueries(['ranking']);
      onCreate();
      setFormData({
        player2: '',
        player3: '',
        player4: '',
        date: '',
        time: '',
        city: user?.city || '',
      });
    },
    onError: (error) => {
      console.error('Error al crear partido:', error);
      alert('Error al crear el partido: ' + (error.response?.data?.message || error.message));
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const selectedPlayers = [formData.player2, formData.player3, formData.player4].filter(Boolean);
    const uniquePlayers = new Set(selectedPlayers);
    if (uniquePlayers.size !== selectedPlayers.length) {
      alert('No puedes seleccionar el mismo jugador más de una vez.');
      return;
    }

    const newMatchData = {
      player2Username: formData.player2,
      player3Username: formData.player3,
      player4Username: formData.player4,
      date: formData.date,
      time: formData.time,
      city: formData.city,
    };

    createMatchMutation.mutate(newMatchData);
  };

  if (loadingUsers) {
    return <div className="text-center text-gray-700 dark:text-dark-text-secondary">Cargando usuarios...</div>;
  }

  if (errorUsers) {
    return <div className="text-center text-red-500 dark:text-dark-error">{errorUsers.message || 'Error al cargar usuarios'}</div>;
  }

  const availableUsers = users.filter((u) => u.username !== user?.username);

  const availableForPlayer2 = availableUsers.filter(
    (u) => !formData.player3 && !formData.player4 ? true : ![formData.player3, formData.player4].includes(u.username)
  );

  const availableForPlayer3 = availableUsers.filter(
    (u) => !formData.player2 && !formData.player4 ? true : ![formData.player2, formData.player4].includes(u.username)
  );

  const availableForPlayer4 = availableUsers.filter(
    (u) => !formData.player2 && !formData.player3 ? true : ![formData.player2, formData.player3].includes(u.username)
  );

  return (
    <FormContainer
      isOpen={true}
      onClose={() => onCreate()}
      onSubmit={handleSubmit}
      title="Crea tu partido"
      submitLabel="Crear partido"
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          Tu compañero (Jugador 2)
        </label>
        <select
          name="player2"
          value={formData.player2}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
          required
        >
          <option value="" disabled>Selecciona un compañero</option>
          {availableForPlayer2.map((user) => (
            <option key={user._id} value={user.username}>
              {user.username}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          Rival 1 (Jugador 3)
        </label>
        <select
          name="player3"
          value={formData.player3}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
          required
        >
          <option value="" disabled>Selecciona un rival</option>
          {availableForPlayer3.map((user) => (
            <option key={user._id} value={user.username}>
              {user.username}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          Rival 2 (Jugador 4)
        </label>
        <select
          name="player4"
          value={formData.player4}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
          required
        >
          <option value="" disabled>Selecciona un rival</option>
          {availableForPlayer4.map((user) => (
            <option key={user._id} value={user.username}>
              {user.username}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          Fecha
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          Hora
        </label>
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
          required
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
          Ciudad
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
          placeholder="Ciudad"
          required
        />
      </div>
    </FormContainer>
  );
}

export default CreateMatchForm;