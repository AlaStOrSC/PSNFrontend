import { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CalendarIcon, MapPinIcon, ClockIcon, SunIcon, CheckCircleIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import api from '../services/api';
import Modal from './Modal';

function MatchCard({ match, user, onUpdate, onDelete }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [formData, setFormData] = useState({
    date: match.date.split('T')[0],
    time: match.time,
    city: match.city,
    player2: match.player2?.username || '',
    player3: match.player3?.username || '',
    player4: match.player4?.username || '',
    results: match.results,
    comments: match.comments,
  });

  const matchDateTime = new Date(
    `${isEditing ? formData.date : match.date.split('T')[0]}T${isEditing ? formData.time : match.time}`
  );
  const now = new Date();
  const isFinalized = matchDateTime <= now || match.result !== 'pending';

  useEffect(() => {
    if (isFinalized && !match.isSaved) {
      setIsEditing(true);
    }
  }, [isFinalized, match.isSaved]);

  const getCardStyle = () => {
    const baseStyle = 'bg-white dark:bg-dark-bg-secondary';
    if (match.result === 'pending') return `${baseStyle}`;
    if (match.result === 'won') return `${baseStyle} border-4 border-green-600 dark:border-green-600`;
    if (match.result === 'lost') return `${baseStyle} border-4 border-red-600 dark:border-red-600`;
    if (match.result === 'draw') return `${baseStyle} border-4 border-blue-600 dark:border-blue-600`;
  };

  const updateMatchMutation = useMutation({
    mutationFn: async (updatedData) => {
      console.log('Guardando datos:', updatedData);
      const response = await api.put(`/matches/${match._id}`, updatedData);
      console.log('Partido actualizado:', response.data.match);
      return response.data.match;
    },
    onSuccess: (updatedMatch) => {
      onUpdate(updatedMatch);
      setIsEditing(false);
      queryClient.invalidateQueries(['matches']);
      queryClient.invalidateQueries(['ranking']);
    },
    onError: (error) => {
      console.error('Error al guardar:', error);
      setModalMessage(error.response?.data?.message || error.message);
      setIsModalOpen(true);
    },
  });

  const deleteMatchMutation = useMutation({
    mutationFn: async () => {
      console.log('Eliminando partido:', match._id);
      await api.delete(`/matches/${match._id}`);
      console.log('Partido eliminado');
    },
    onSuccess: () => {
      onDelete(match._id);
      queryClient.invalidateQueries(['matches']);
      queryClient.invalidateQueries(['ranking']);
    },
    onError: (error) => {
      console.error('Error al eliminar:', error);
      setModalMessage(error.response?.data?.message || error.message);
      setIsModalOpen(true);
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedData = {
      date: formData.date,
      time: formData.time,
      city: formData.city,
      player2: formData.player2,
      player3: formData.player3,
      player4: formData.player4,
      results: formData.results,
      comments: formData.comments,
      isSaved: isFinalized || match.isSaved,
    };

    updateMatchMutation.mutate(updatedData);
  };

  const handleDelete = () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este partido?')) return;
    deleteMatchMutation.mutate();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'date' && !isFinalized) {
      const selectedDate = new Date(value);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (selectedDate < now) {
        setModalMessage('No puedes cambiar la fecha de un partido si esta ya ha pasado');
        setIsModalOpen(true);
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResultChange = (set, side, value) => {
    setFormData((prev) => ({
      ...prev,
      results: {
        ...prev.results,
        [set]: {
          ...prev.results[set],
          [side]: parseInt(value) || 0,
        },
      },
    }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  const getUserTeam = () => {
    const userId = user._id;
    if (match.player1?._id === userId || match.player2?._id === userId) {
      return {
        team1: [match.player1?.username || t('matches.empty_slot'), match.player2?.username || t('matches.empty_slot')],
        team2: [match.player3?.username || t('matches.empty_slot'), match.player4?.username || t('matches.empty_slot')],
      };
    }
    return {
      team1: [match.player1?.username || t('matches.empty_slot'), match.player2?.username || t('matches.empty_slot')],
      team2: [match.player3?.username || t('matches.empty_slot'), match.player4?.username || t('matches.empty_slot')],
    };
  };

  const { team1, team2 } = getUserTeam();

  return (
    <div className={`rounded-lg shadow-lg dark:shadow-dark-shadow p-6 ${getCardStyle()} w-full`}>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={t('profile.modal.error_title')}
        message={modalMessage}
      />

      {isEditing && !isFinalized ? (
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className="text-2xl font-bold text-primaryText dark:text-dark-text-accent mb-4 w-full p-2 border border-gray-200 dark:border-dark-border rounded bg-white dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
        />
      ) : (
        <h2 className="text-2xl font-bold text-primaryText dark:text-dark-text-accent mb-4 flex items-center">
          <CalendarIcon className="h-6 w-6 mr-2 text-primaryText dark:text-dark-text-accent" />
          {new Date(match.date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </h2>
      )}

      <p className="text-lg text-primaryText dark:text-dark-text-primary mb-2">
        {isEditing ? (
          <>
            {team1[0]} /{' '}
            <input
              type="text"
              name="player2"
              value={formData.player2}
              onChange={handleInputChange}
              className="inline p-1 border border-gray-200 dark:border-dark-border rounded bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
              placeholder="Compañero"
            />
          </>
        ) : (
          `${team1[0]} / ${team1[1]}`
        )}
        {' vs '}
        {isEditing ? (
          <>
            <input
              type="text"
              name="player3"
              value={formData.player3}
              onChange={handleInputChange}
              className="inline p-1 border border-gray-200 dark:border-dark-border rounded bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
              placeholder="Rival 1"
            />
            {' / '}
            <input
              type="text"
              name="player4"
              value={formData.player4}
              onChange={handleInputChange}
              className="inline p-1 border border-gray-200 dark:border-dark-border rounded bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
              placeholder="Rival 2"
            />
          </>
        ) : (
          `${team2[0]} / ${team2[1]}`
        )}
      </p>

      <p className="text-primaryText dark:text-dark-text-secondary flex items-center mb-2">
        <MapPinIcon className="h-5 w-5 mr-2 text-primaryText dark:text-dark-text-secondary" />
        {isEditing ? (
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="p-1 border border-gray-200 dark:border-dark-border rounded w-full bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
            placeholder="Ciudad"
          />
        ) : (
          match.city
        )}
      </p>

      <p className="text-primaryText dark:text-dark-text-secondary flex items-center mb-2">
        <ClockIcon className="h-5 w-5 mr-2 text-primaryText dark:text-dark-text-secondary" />
        {isEditing && !isFinalized ? (
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            className="p-1 border border-gray-200 dark:border-dark-border rounded w-full bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
          />
        ) : (
          match.time
        )}
      </p>

      <div className="mb-2">
        <p className="text-primaryText dark:text-dark-text-secondary flex items-center">
          <SunIcon className="h-5 w-5 mr-2 text-primaryText dark:text-dark-text-secondary" />
          {match.weather || 'Clima no disponible'}
        </p>
        {match.rainWarning && (
          <p className="text-primaryText dark:text-yellow-400 flex items-center mt-1 text-sm">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-primaryText dark:text-yellow-400" />
            Posibilidad de lluvia, recomendado reservar en cubierto
          </p>
        )}
      </div>

      <p className="text-primaryText dark:text-dark-text-secondary mb-4">
        Estado: <span className="font-semibold">{isFinalized ? 'Finalizado' : 'Pendiente'}</span>
      </p>

      {isFinalized && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-primaryText dark:text-dark-text-accent mb-2">Resultado</h3>
          <table className="w-full text-center border-collapse border-2 border-gray-200 dark:border-dark-border">
            <thead>
              <tr>
                <th className="border-2 border-gray-200 dark:border-dark-border p-2 text-primaryText dark:text-dark-text-primary">Equipo 1</th>
                <th className="border-2 border-gray-200 dark:border-dark-border p-2 text-primaryText dark:text-dark-text-primary">Equipo 2</th>
              </tr>
            </thead>
            <tbody>
              {['set1', 'set2', 'set3'].map((set) => (
                <tr key={set}>
                  <td className="border-2 border-gray-200 dark:border-dark-border p-2 text-primaryText dark:text-white">
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.results[set].left}
                        onChange={(e) => handleResultChange(set, 'left', e.target.value)}
                        className="w-16 p-1 border border-gray-200 dark:border-dark-border rounded text-center bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                        min="0"
                        max="7"
                      />
                    ) : (
                      formData.results[set].left
                    )}
                  </td>
                  <td className="border-2 border-gray-200 dark:border-dark-border p-2 text-primaryText dark:text-white">
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.results[set].right}
                        onChange={(e) => handleResultChange(set, 'right', e.target.value)}
                        className="w-16 p-1 border border-gray-200 dark:border-dark-border rounded text-center bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                        min="0"
                        max="7"
                      />
                    ) : (
                      formData.results[set].right
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFinalized && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-primaryText dark:text-dark-text-accent mb-2">Comentarios</h3>
          {isEditing ? (
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-200 dark:border-dark-border rounded bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
              rows="4"
              placeholder="Describe el partido..."
            />
          ) : (
            <p className="text-primaryText dark:text-dark-text-secondary">{formData.comments || 'Sin comentarios'}</p>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-2">
        {isEditing && (
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-save text-white dark:bg-save dark:text-dark-text-primary rounded-lg hover:bg-saveHover dark:hover:bg-saveHover transition-colors"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Guardar
          </button>
        )}
        <button
          onClick={handleEdit}
          className="flex items-center px-4 py-2 bg-secondary text-white dark:bg-dark-primary dark:text-dark-text-primary rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
        >
          <PencilIcon className="h-5 w-5 mr-2" />
          Editar
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center px-4 py-2 bg-red-500 text-white dark:bg-red-600 dark:text-dark-text-primary rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
        >
          <TrashIcon className="h-5 w-5 mr-2" />
          Borrar
        </button>
      </div>
    </div>
  );
}

export default MatchCard;