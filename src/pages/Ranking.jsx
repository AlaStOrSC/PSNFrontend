import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import api from '../services/api';
import useWindowSize from '../hooks/useWindowSize';
import Modal from '../components/Modal';
import { UserPlusIcon, ChatBubbleLeftIcon, TrophyIcon } from '@heroicons/react/24/solid';

function Ranking() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const { isMobile } = useWindowSize();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users');
        const sortedUsers = [...response.data].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        setUsers(sortedUsers);
        setError(null);
      } catch (err) {
        console.error('Error al cargar el ranking:', err);
        setError(err.response?.data?.message || 'Error al cargar el ranking');
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const handleAddFriend = async (recipientId) => {
    if (!user) {
      setModalMessage('Debes iniciar sesión para enviar solicitudes de amistad');
      setIsModalOpen(true);
      return;
    }

    if (user.id === recipientId) {
      setModalMessage('No puedes enviarte una solicitud de amistad a ti mismo');
      setIsModalOpen(true);
      return;
    }

    try {
      await api.post(`/users/friends/request/${recipientId}`);
      setModalMessage('✅ Solicitud de amistad enviada exitosamente');
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error al enviar solicitud de amistad:', err);
      const errorMessage = err.response?.data?.error || 'Error al enviar solicitud de amistad';
      if (errorMessage === 'Ya hay una solicitud de amistad pendiente') {
        setModalMessage('Ya has enviado una solicitud a este usuario');
      } else {
        setModalMessage(errorMessage);
      }
      setIsModalOpen(true);
    }
  };

  const handleChat = (userId) => {
    // Implementar lógica para abrir el chat (pendiente)
    console.log(`Abrir chat con usuario ${userId}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  const columns = [
    {
      field: 'position',
      headerName: 'Puesto',
      flex: 0.1,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'user',
      headerName: 'Usuario',
      flex: 0.3,
      minWidth: 200,
      renderCell: (params) => (
        <div className="flex items-center">
          <img
            src={params.row.profilePicture || `https://ui-avatars.com/api/?name=${params.row.username}&background=05374d&color=fff&size=40`}
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
      headerName: 'Ciudad',
      flex: 0.2,
      minWidth: 150,
    },
    {
      field: 'score',
      headerName: 'Puntuación',
      flex: 0.2,
      minWidth: 150,
      sortComparator: (v1, v2) => v2 - v1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'actions',
      headerName: 'Acción',
      flex: 0.2,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleAddFriend(params.row.id)}
            className="text-primary hover:text-secondary transition-colors duration-200"
            title="Añadir amigo"
          >
            <UserPlusIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleChat(params.row.id)}
            className="text-primary hover:text-secondary transition-colors duration-200"
            title="Abrir chat"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">
        Ranking de Jugadores
      </h1>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalMessage.includes('Error') ||
          modalMessage.includes('Ya has enviado')
            ? 'Error'
            : 'Éxito'
        }
        message={modalMessage}
      />
      {loading ? (
        <p className="text-center text-gray-600">Cargando ranking...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="bg-white rounded-lg shadow-xl p-6 overflow-x-auto">
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={users.map((rankedUser, index) => ({
                id: rankedUser.id,
                position: index + 1,
                user: rankedUser.username,
                username: rankedUser.username,
                profilePicture: rankedUser.profilePicture,
                city: rankedUser.city,
                score: rankedUser.score,
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
                params.row.id === user?.id ? 'bg-blue-100' : ''
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
                  color: '#05374d',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  borderBottom: '3px solid #1f2937',
                  fontSize: '1.15rem',
                },
                '& .MuiDataGrid-columnHeader': {
                  borderRight: '1px solid #d1d5db',
                  padding: '0 12px',
                  '&:last-child': {
                    borderRight: 'none',
                  },
                },
                '& .MuiDataGrid-cell': {
                  color: '#1f2937',
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
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Ranking;