import { DataGrid } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import useWindowSize from '../hooks/useWindowSize';
import Modal from '../components/Modal';
import { UserPlusIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';



function Ranking() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const { isMobile } = useWindowSize();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);

  const queryClient = useQueryClient();

  const addFriendMutation = useMutation({
    mutationFn: async (recipientId) => {
      await api.post(`/users/friends/request/${recipientId}`);
    },
    onSuccess: () => {
      setModalMessage('✅ Solicitud de amistad enviada exitosamente');
      setIsModalOpen(true);
      queryClient.invalidateQueries(['friendship']);
    },
    onError: (err) => {
      console.error('Error al enviar solicitud de amistad:', err);
      const errorMessage = err.response?.data?.error || 'Error al enviar solicitud de amistad';
      if (errorMessage === 'Ya hay una solicitud de amistad pendiente') {
        setModalMessage('Ya has enviado una solicitud a este usuario');
      } else {
        setModalMessage(errorMessage);
      }
      setIsModalOpen(true);
    },
  });

  const handleAddFriend = (recipientId) => {
    if (!user) {
      setModalMessage('Debes iniciar sesión para enviar solicitudes de amistad');
      setIsModalOpen(true);
      return;
    }

    if (user.userId === recipientId) {
      setModalMessage('No puedes enviarte una solicitud de amistad a ti mismo');
      setIsModalOpen(true);
      return;
    }

    addFriendMutation.mutate(recipientId);
  };

  const { data: users = [], isLoading: loading, error } = useQuery({
    queryKey: ['ranking'],
    queryFn: async () => {
      const response = await api.get('/users');
      return [...response.data].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    },
    onError: (err) => {
      console.error('Error al cargar el ranking:', err);
    },
  });

  const handleChat = (userId) => {
    console.log(`Abrir chat con usuario ${userId}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  const columns = [
    {
      field: 'position',
      headerName: t('ranking.rank'),
      flex: 0.1,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'user',
      headerName: t('ranking.user'),
      flex: 0.3,
      minWidth: 200,
      headerAlign: 'center',
      renderCell: (params) => (
        <div className="flex items-center">
          <img
            src={
              params.row.profilePicture ||
              `https://ui-avatars.com/api/?name=${params.row.username}&background=${
                theme === 'dark' ? '0f172a' : '05374d'
              }&color=fff&size=40`
            }
            alt={params.row.username}
            className="w-8 h-8 rounded-full mr-2"
          />
          <span>{params.row.username}</span>
          {params.row.position === 1 && (
            <TrophyIcon className="ml-2 w-5 h-5 text-yellow-500" title="Primer puesto" />
          )}
          {params.row.position === 2 && (
            <span className="ml-2 text-gray-400 font-semibold" title="Segundo puesto">2nd</span>
          )}
          {params.row.position === 3 && (
            <span className="ml-2 text-amber-700 font-semibold" title="Tercer puesto">3rd</span>
          )}
        </div>
      ),
    },
    {
      field: 'city',
      headerName: t('ranking.city'),
      flex: 0.2,
      minWidth: 150,
      headerAlign: 'center',
    },
    {
      field: 'score',
      headerName: t('ranking.score'),
      flex: 0.2,
      minWidth: 150,
      sortComparator: (v1, v2) => v2 - v1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'actions',
      headerName: t('ranking.action'),
      flex: 0.2,
      minWidth: 150,
      headerAlign: 'center',
      renderCell: (params) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleAddFriend(params.row.userId)}
            className="text-primary hover:text-secondary transition-colors duration-200 dark:text-dark-text-accent dark:hover:text-dark-secondary"
            title="Añadir amigo"
          >
            <UserPlusIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4 bg-neutral dark:bg-dark-bg">
      <h1 className="text-3xl font-bold mb-6 text-center text-primaryText dark:text-dark-text-accent">
        {t('ranking.title')}
      </h1>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalMessage.includes('Error') || modalMessage.includes('Ya has enviado') ? 'Error' : 'Éxito'}
        message={modalMessage}
        className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
      />
      {loading ? (
        <p className="text-center text-gray-600 dark:text-dark-text-secondary">Cargando ranking...</p>
      ) : error ? (
        <p className="text-center text-red-500 dark:text-dark-error">{error.message || 'Error al cargar el ranking'}</p>
      ) : (
        <div className="bg-neutral rounded-lg shadow-xl p-6 overflow-x-auto dark:bg-dark-bg-secondary dark:shadow-dark-shadow">
          <div style={{ height: 600, width: '100%' }}>
<DataGrid
  rows={users.map((rankedUser, index) => ({
    id: rankedUser.userId,
    position: index + 1,
    user: rankedUser.username,
    username: rankedUser.username,
    profilePicture: rankedUser.profilePicture,
    city: rankedUser.city,
    score: rankedUser.score,
    userId: rankedUser.userId,
  }))}
  columns={columns}
  initialState={{
    sorting: {
      sortModel: [{ field: 'score', sort: 'asc' }],
    },
    pagination: { paginationModel: { pageSize: 10 } },
  }}
  pageSizeOptions={[10, 25, 50]}
  disableRowSelectionOnClick
  columnVisibilityModel={{
    city: !isMobile,
    actions: !isMobile,
  }}
  getRowClassName={(params) =>
    params.row.userId === user?.userId ? 'bg-blue-100' : ''
  }
  sx={{
    '& .MuiDataGrid-root': {
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      width: isMobile ? '100%' : '100vw',
      maxWidth: '100%',
    },
    '& .MuiDataGrid-columnHeaders': {
      background: 'linear-gradient(to bottom, #05374d, #075e7a)',
      color: '#000000',
      fontWeight: 800,
      textTransform: 'uppercase',
      borderBottom: '3px solid #1f2937',
      fontSize: '1.15rem',
    },
    '& .MuiDataGrid-menuIcon': {
      color: '#000000',
      '& .MuiSvgIcon-root': {
        color: '#000000',
      },
    },
    '.dark & .MuiDataGrid-menuIcon': {
      color: '#f3f4f6',
      '& .MuiSvgIcon-root': {
        color: '#f3f4f6',
      },
    },
    '& .MuiDataGrid-columnHeader': {
      borderRight: '1px solid #d1d5db',
      padding: '0 12px',
      '&:last-child': {
        borderRight: 'none',
      },
    },
    '& .MuiDataGrid-cell': {
      color: '#000000',
      borderRight: '1px solid #d1d5db',
      padding: '0 12px',
      '&:last-child': {
        borderRight: 'none',
      },
    },
    '& .MuiDataGrid-row': {
      backgroundColor: '#ffffff',
      '&:nth-of-type(even)': {
        backgroundColor: '#f9fafb',
      },
      '&:hover': {
        backgroundColor: '#e0f2fe',
        transition: 'background-color 0.2s ease',
      },
    },
    '& .MuiDataGrid-footerContainer': {
      backgroundColor: '#f3f4f6',
      borderTop: '1px solid #d1d5db',
    },
    '& .MuiDataGrid-toolbarContainer': {
      padding: '8px',
    },
    '& .bg-blue-100': {
      backgroundColor: '#93c5fd',
      '&:hover': {
        backgroundColor: '#7bafe6',
      },
    },
    '.dark & .MuiDataGrid-root': {
      border: '1px solid #4b5563',
      backgroundColor: '#1e293b',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    '.dark & .MuiDataGrid-columnHeaders': {
      background: 'linear-gradient(to bottom, #1e40af, #3b82f6)',
      color: 'white',
      borderBottom: '3px solid #4b5563',
    },
    '.dark & .MuiDataGrid-columnHeader': {
      background: '#0f172a',
      borderRight: '1px solid #4b5563',
      '&:last-child': {
        borderRight: 'none',
      },
    },
    '.dark & .MuiDataGrid-cell': {
      color: '#d1d5db',
      borderRight: '1px solid #4b5563',
      '&:last-child': {
        borderRight: 'none',
      },
    },
    '.dark & .MuiDataGrid-row': {
      backgroundColor: '#1e293b',
      '&:nth-of-type(even)': {
        backgroundColor: '#334155',
      },
      '&:hover': {
        backgroundColor: '#4b5563',
        transition: 'background-color 0.2s ease',
      },
    },
    '.dark & .MuiDataGrid-footerContainer': {
      backgroundColor: '#334155',
      borderTop: '1px solid #4b5563',
      color: '#f3f4f6',
    },
    '.dark & .bg-blue-100': {
      backgroundColor: '#4b5563',
      '&:hover': {
        backgroundColor: '#6b7280',
      },
    },
    '.dark & .MuiTablePagination-root': {
      color: '#f3f4f6',
    },
    '.dark & .MuiTablePagination-selectLabel': {
      color: '#f3f4f6',
    },
    '.dark & .MuiTablePagination-displayedRows': {
      color: '#f3f4f6',
    },
    '.dark & .MuiDataGrid-footerContainer .MuiSvgIcon-root': {
      color: '#f3f4f6',
    },
  }}
/>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ranking;