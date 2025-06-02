import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Modal from './Modal';

function MatchJoinCard({ match, locale }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [shouldInvalidate, setShouldInvalidate] = useState(false);

  const joinMatchMutation = useMutation({
    mutationFn: async () => {
      const response = await api.put(`/matches/join/${match._id}`);
      return response.data.match;
    },
    onSuccess: () => {
      setModalMessage(t('join_matches.success_message'));
      setModalAction('success');
      setIsModalOpen(true);
      setShouldInvalidate(true);
    },
    onError: (error) => {
      setModalMessage(error.response?.data?.message || t('join_matches.error_message'));
      setModalAction('error');
      setIsModalOpen(true);
      setShouldInvalidate(true);
    },
  });

  const handleJoinClick = () => {
    console.log('handleJoinClick triggered: Opening modal for join action');
    setModalMessage(t('join_matches.join_prompt'));
    setModalAction('join');
    setIsModalOpen(true);
  };

  const handleConfirmJoin = () => {
    console.log('handleConfirmJoin triggered: Attempting to join match', match._id);
    joinMatchMutation.mutate();
  };

  const closeModal = () => {
    console.log('closeModal triggered: Closing modal');
    setIsModalOpen(false);
    setModalMessage('');
    setModalAction('');
    if (shouldInvalidate) {
      queryClient.invalidateQueries(['matches']);
      queryClient.invalidateQueries(['joinableMatches']);
      setShouldInvalidate(false);
    }
  };

  const renderPlayer = (player, position) => {
    if (!player) {
      return (
        <div className="flex items-center">
          <button
            onClick={handleJoinClick}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-primary dark:bg-dark-primary text-white dark:text-dark-text-primary hover:bg-secondary dark:hover:text-dark-secondary transition-colors"
            disabled={joinMatchMutation.isLoading}
          >
            <span className="text-lg">+</span>
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center">
        <img
          src={player?.profilePicture || `https://ui-avatars.com/api/?name=${player?.username || 'unknown'}&background=05374d&color=fff&size=24`}
          alt={player?.username || 'unknown'}
          className="w-6 h-6 rounded-full mr-2"
        />
        <span className="text-primaryText dark:text-neutral truncate max-w-[80px]">{player?.username || 'N/A'}</span>
        <span className="ml-2 text-gray-600 dark:text-dark-text-secondary">({player?.score?.toFixed(2) || '0.00'})</span>
      </div>
    );
  };

  // Formatear la fecha y hora para el título
  const formatDateTime = () => {
    if (!match?.date || !match?.time || !match?.city) return 'N/A';
    const date = new Date(match.date);
    const options = { day: 'numeric', month: 'long' };
    const formattedDate = date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', options);
    return `${formattedDate}, ${match.time}, ${match.city}`;
  };

  console.log('Modal state:', { isModalOpen, modalMessage, modalAction, showButtons: modalAction === 'join' });

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg dark:shadow-dark-shadow p-6 w-full max-w-sm mx-auto">
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalAction === 'success'
            ? t('join_matches.success_title')
            : modalAction === 'error'
            ? t('join_matches.error_title')
            : t('join_matches.join_title')
        }
        message={modalMessage}
        showButtons={modalAction === 'join'}
        onConfirm={modalAction === 'join' ? handleConfirmJoin : undefined}
        confirmLabel={t('join_matches.yes')}
        cancelLabel={t('join_matches.no')}
      />

      {/* Título con fecha, hora y ciudad */}
      <h3 className="text-lg font-semibold text-primaryText dark:text-dark-text-accent mb-4 text-center">
        {formatDateTime()}
      </h3>

      {/* Columnas para los equipos con línea de separación */}
      <div className="grid grid-cols-2 gap-4 relative">
        {/* Equipo 1 */}
        <div className="flex flex-col space-y-2 pr-2">
          {renderPlayer(match?.player1, 'player1')}
          {renderPlayer(match?.player2, 'player2')}
        </div>
        {/* Línea de separación */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 dark:bg-dark-border transform -translate-x-1/2" />
        {/* Equipo 2 */}
        <div className="flex flex-col space-y-2 pl-2">
          {renderPlayer(match?.player3, 'player3')}
          {renderPlayer(match?.player4, 'player4')}
        </div>
      </div>
    </div>
  );
}

export default MatchJoinCard;