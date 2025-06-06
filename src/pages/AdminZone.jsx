import { DataGrid } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import useWindowSize from '../hooks/useWindowSize';
import Modal from '../components/Modal';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function AdminZone() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteUserId, setDeleteUserId] = useState(null);
  const { isMobile } = useWindowSize();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: loading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return [...response.data].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    },
    onError: (err) => {
      console.error('Error al cargar usuarios:', err.response?.data || err.message);
      setModalTitle(t('profile.modal.error_title'));
      setModalMessage(err.response?.data?.message || t('profile.error.load_profile'));
      setIsModalOpen(true);
    },
  });

  const editUserMutation = useMutation({
    mutationFn: async (updatedUser) => {
      console.log('Datos enviados para PUT:', updatedUser);
      if (!updatedUser.userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('ID de usuario inválido');
      }
      const response = await api.put(`/admin/users/${updatedUser.userId}`, {
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        city: updatedUser.city,
        points: updatedUser.points,
        score: updatedUser.score,
      });
      return response.data;
    },
    onSuccess: () => {
      setModalTitle(t('profile.success.profile_updated'));
      setModalMessage(t('profile.success.profile_updated'));
      setIsModalOpen(true);
      setEditUser(null);
      queryClient.invalidateQueries(['profile']);
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => {
      console.error('Error al actualizar usuario:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || t('profile.error.update_profile');
      setModalTitle(t('profile.modal.error_title'));
      setModalMessage(errorMessage === 'Email already in use' 
        ? t('profile.error.email_in_use') 
        : errorMessage);
      setIsModalOpen(true);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      console.log('Intentando eliminar usuario con ID:', userId);
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('ID de usuario inválido');
      }
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      setModalTitle(t('redeem.success_title'));
      setModalMessage('Usuario eliminado con éxito');
      setIsModalOpen(true);
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => {
      console.error('Error al eliminar usuario:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar usuario';
      setModalTitle(t('profile.modal.error_title'));
      setModalMessage(errorMessage);
      setIsModalOpen(true);
    },
  });

  const handleEdit = (userData) => {
    setEditUser(userData);
  };

  const handleSaveEdit = () => {
    if (!editUser) return;
    editUserMutation.mutate({
      userId: editUser.userId,
      username: editUser.username || '',
      email: editUser.email || '',
      phone: editUser.phone || '',
      city: editUser.city || '',
      points: editUser.points || 0,
      score: editUser.score || 0,
    });
  };

  const handleDelete = (userId) => {
    if (!user) {
      setModalTitle(t('profile.modal.error_title'));
      setModalMessage(t('profile.error.unauthenticated'));
      setIsModalOpen(true);
      return;
    }
    setDeleteUserId(userId);
    setModalTitle(t('admin.delete_confirm_title'));
    setModalMessage(t('admin.delete_confirm_message'));
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate(deleteUserId);
      setDeleteUserId(null);
    }
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
    setModalTitle('');
    setDeleteUserId(null);
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      field: 'username',
      headerName: t('profile.username'),
      flex: 0.2,
      minWidth: 150,
      headerAlign: 'center',
      align: 'center',
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
          {editUser?.userId === params.row.userId ? (
            <input
              type="text"
              value={editUser.username}
              onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
              className="border border-gray-300 dark:border-dark-border rounded p-1 text-primaryText dark:text-dark-text-primary bg-white dark:bg-dark-bg-tertiary"
            />
          ) : (
            <span>{params.row.username}</span>
          )}
        </div>
      ),
    },
    {
      field: 'email',
      headerName: t('profile.email'),
      flex: 0.2,
      minWidth: 200,
      headerAlign: 'center',
      renderCell: (params) =>
        editUser?.userId === params.row.userId ? (
          <input
            type="email"
            value={editUser.email}
            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
            className="border border-gray-300 dark:border-dark-border rounded p-1 text-primaryText dark:text-dark-text-primary bg-white dark:bg-dark-bg-tertiary"
          />
        ) : (
          params.row.email
        ),
    },
    {
      field: 'phone',
      headerName: t('profile.phone'),
      flex: 0.15,
      minWidth: 150,
      headerAlign: 'center',
      renderCell: (params) =>
        editUser?.userId === params.row.userId ? (
          <input
            type="text"
            value={editUser.phone}
            onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
            className="border border-gray-300 dark:border-dark-border rounded p-1 text-primaryText dark:text-dark-text-primary bg-white dark:bg-dark-bg-tertiary"
          />
        ) : (
          params.row.phone
        ),
    },
    {
      field: 'city',
      headerName: t('profile.city'),
      flex: 0.15,
      minWidth: 150,
      headerAlign: 'center',
      renderCell: (params) =>
        editUser?.userId === params.row.userId ? (
          <input
            type="text"
            value={editUser.city}
            onChange={(e) => setEditUser({ ...editUser, city: e.target.value })}
            className="border border-gray-300 dark:border-dark-border rounded p-1 text-primaryText dark:text-dark-text-primary bg-white dark:bg-dark-bg-tertiary"
          />
        ) : (
          params.row.city
        ),
    },
    {
      field: 'points',
      headerName: t('profile.points'),
      flex: 0.15,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) =>
        editUser?.userId === params.row.userId ? (
          <input
            type="number"
            value={editUser.points}
            onChange={(e) => setEditUser({ ...editUser, points: parseInt(e.target.value) || 0 })}
            className="border border-gray-300 dark:border-dark-border rounded p-1 text-primaryText dark:text-dark-text-primary bg-white dark:bg-dark-bg-tertiary"
          />
        ) : (
          params.row.points
        ),
    },
    {
      field: 'score',
      headerName: t('profile.score'),
      flex: 0.15,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) =>
        editUser?.userId === params.row.userId ? (
          <input
            type="number"
            value={editUser.score}
            onChange={(e) => setEditUser({ ...editUser, score: parseInt(e.target.value) || 0 })}
            className="border border-gray-300 dark:border-dark-border rounded p-1 text-primaryText dark:text-dark-text-primary bg-white dark:bg-dark-bg-tertiary"
          />
        ) : (
          params.row.score
        ),
    },
    {
      field: 'actions',
      headerName: t('ranking.action'),
      flex: 0.2,
      minWidth: 150,
      headerAlign: 'center',
      renderCell: (params) => (
        <div className="flex space-x-1 items-center">
          {!isMobile && editUser?.userId === params.row.userId ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="text-save hover:text-saveHover transition-colors duration-200 dark:text-save dark:hover:text-saveHover"
                title={t('profile.save_changes')}
              >
                <CheckIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditUser(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 dark:text-gray-400 dark:hover:text-gray-300"
                title="Cancelar"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </>
          ) : (
            !isMobile && (
              <button
                onClick={() => handleEdit(params.row)}
                className="text-primary hover:text-secondary transition-colors duration-200 dark:text-dark-primary dark:hover:text-dark-secondary"
                title="Editar usuario"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
            )
          )}
          <button
            onClick={() => handleDelete(params.row.userId)}
            className="text-red-500 hover:text-red-700 transition-colors duration-200 dark:text-dark-error dark:hover:text-red-400"
            title="Eliminar usuario"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4 bg-neutral dark:bg-dark-bg">
      <h1 className="text-3xl font-bold mb-6 text-center text-primaryText dark:text-dark-text-accent">
        {t('admin.title')}
      </h1>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        message={modalMessage}
        showButtons={!!deleteUserId}
        onConfirm={confirmDelete}
        confirmLabel={t('admin.delete_confirm_button')}
        cancelLabel={t('admin.delete_cancel_button')}
        className="dark:bg-dark-bg-secondary dark:text-dark-text-primary"
      />
      <div className="mb-6">
        <input
          type="text"
          placeholder={t('admin.userfilter')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md mx-auto p-2 border border-gray-300 dark:border-dark-border rounded-lg text-primaryText dark:text-dark-text-primary bg-white dark:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-dark-secondary"
        />
      </div>
      {loading ? (
        <p className="text-center text-gray-600 dark:text-dark-text-secondary">{t('loading')}</p>
      ) : error ? (
        <p className="text-center text-red-500 dark:text-dark-error">{error.message || t('profile.error.load_profile')}</p>
      ) : (
        <div className="bg-neutral rounded-lg shadow-xl p-6 overflow-x-auto dark:bg-dark-bg-secondary dark:shadow-dark-shadow">
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredUsers.map((userData) => ({
                id: userData.userId,
                username: userData.username,
                email: userData.email,
                phone: userData.phone,
                city: userData.city,
                points: userData.points,
                score: userData.score,
                userId: userData.userId,
                profilePicture: userData.profilePicture,
              }))}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              columnVisibilityModel={{
                email: !isMobile,
                phone: !isMobile,
                city: !isMobile,
                points: !isMobile,
                score: !isMobile,
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

export default AdminZone;