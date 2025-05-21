import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { setUser } from '../store/slices/authSlice';
import Modal from '../components/Modal';
import ProfileCard from '../components/ProfileCard';

function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    phone: user?.phone || '',
    email: user?.email || '',
    city: user?.city || '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const fileInputRef = useRef(null);

  const [pendingRequests, setPendingRequests] = useState({ received: [], sent: [] });
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [errorFriends, setErrorFriends] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        dispatch(setUser(response.data));
      } catch (err) {
        console.error('Error al cargar el perfil del usuario:', err);
        setError(err.response?.data?.message || 'Error al cargar el perfil');
      }
    };

    const fetchFriendshipData = async () => {
      try {
        setLoadingFriends(true);
        const [requestsResponse, friendsResponse] = await Promise.all([
          api.get('/users/friends/requests'),
          api.get('/users/friends'),
        ]);
        setPendingRequests(requestsResponse.data);
        setFriends(friendsResponse.data);
        setErrorFriends(null);
      } catch (err) {
        console.error('Error al cargar datos de amistad:', err);
        setErrorFriends(err.response?.data?.message || 'Error al cargar datos de amistad');
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchUserProfile();
    fetchFriendshipData();
  }, [dispatch]);

  if (!user) {
    return <div className="text-center text-red-500">Error: No se encontró el usuario.</div>;
  }

  const defaultAvatar = `https://ui-avatars.com/api/?name=${user.username}&background=05374d&color=fff&size=128`;

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/users/profile', editedData);
      dispatch(setUser(response.data));
      setIsEditing(false);
      setSuccess('Perfil actualizado exitosamente');
      setError(null);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      console.log('Respuesta completa del error:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error al actualizar el perfil';
      if (errorMessage.includes('El email ya está en uso')) {
        setModalMessage('Este email ya está en uso, por favor elige otro');
        setIsModalOpen(true);
      } else {
        setModalMessage(errorMessage);
        setIsModalOpen(true);
      }
      setSuccess(null);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const uploadResponse = await api.post('/files/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { profilePicture: url } = uploadResponse.data;

      const updateResponse = await api.put('/users/profile', { profilePicture: url });
      dispatch(setUser(updateResponse.data));
      setSuccess('Foto de perfil actualizada exitosamente');
    } catch (error) {
      console.error('Error al subir la foto:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error al subir la foto';
      setModalMessage(errorMessage);
      setIsModalOpen(true);
      setSuccess(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  const refreshFriendshipData = async () => {
    try {
      setLoadingFriends(true);
      const [requestsResponse, friendsResponse] = await Promise.all([
        api.get('/users/friends/requests'),
        api.get('/users/friends'),
      ]);
      setPendingRequests(requestsResponse.data);
      setFriends(friendsResponse.data);
      setErrorFriends(null);
    } catch (err) {
      console.error('Error al recargar datos de amistad:', err);
      setErrorFriends(err.response?.data?.message || 'Error al recargar datos de amistad');
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleAcceptRequest = async (requesterId) => {
    try {
      await api.put(`/users/friends/accept/${requesterId}`);
      await refreshFriendshipData();
    } catch (err) {
      console.error('Error al aceptar solicitud:', err);
      setModalMessage(err.response?.data?.message || 'Error al aceptar solicitud');
      setIsModalOpen(true);
    }
  };

  const handleRejectRequest = async (requesterId) => {
    try {
      await api.put(`/users/friends/reject/${requesterId}`);
      await refreshFriendshipData();
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
      setModalMessage(err.response?.data?.message || 'Error al rechazar solicitud');
      setIsModalOpen(true);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await api.delete(`/users/friends/${friendId}`);
      await refreshFriendshipData();
    } catch (err) {
      console.error('Error al eliminar amigo:', err);
      setModalMessage(err.response?.data?.message || 'Error al eliminar amigo');
      setIsModalOpen(true);
    }
  };

  const winPercentage = user.totalMatches > 0
    ? ((user.matchesWon / (user.totalMatches - user.matchesDrawn)) * 100).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen bg-neutral py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">Mi Perfil</h1>

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Error"
          message={modalMessage}
        />

        <div className="mb-6 sm:flex sm:gap-6 sm:items-stretch sm:min-h-[400px]">
          <div className="max-w-md mx-auto sm:max-w-none sm:mx-0 sm:flex-1">
            <ProfileCard>
              <div className="flex flex-col items-center mb-4">
                <img
                  src={user.profilePicture || defaultAvatar}
                  alt="Foto de perfil"
                  className="w-32 h-32 rounded-full object-cover mb-4"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  {isUploading ? 'Subiendo...' : user.profilePicture ? 'Cambiar foto' : 'Subir foto'}
                </button>
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Nombre:</span>
                  <span className="text-gray-600">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Teléfono:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={editedData.phone}
                      onChange={handleInputChange}
                      className="border rounded-lg p-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <span className="text-gray-600">{user.phone}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Email:</span>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedData.email}
                      onChange={handleInputChange}
                      className="border rounded-lg p-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <span className="text-gray-600">{user.email}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Ciudad:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={editedData.city}
                      onChange={handleInputChange}
                      className="border rounded-lg p-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <span className="text-gray-600">{user.city}</span>
                  )}
                </div>
              </div>

              {success && <p className="text-green-500 text-center mt-4">{success}</p>}

              <div className="flex justify-center mt-4 space-x-2">
                {isEditing ? (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                  >
                    Guardar cambios
                  </button>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                  >
                    Editar
                  </button>
                )}
              </div>
            </ProfileCard>
          </div>

          <div className="max-w-md mx-auto sm:max-w-none sm:mx-0 sm:flex-1">
            <ProfileCard>
              <h2 className="text-xl font-semibold text-primary mb-4 text-center">Estadísticas</h2>
              <div className="flex-1 flex items-center">
                <div className="space-y-2 w-full">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Puntuación:</span>
                    <span className="text-gray-600">{(user.score ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Partidos ganados:</span>
                    <span className="text-gray-600">{user.matchesWon ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Partidos perdidos:</span>
                    <span className="text-gray-600">{user.matchesLost ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Partidos empatados:</span>
                    <span className="text-gray-600">{user.matchesDrawn ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Partidos totales:</span>
                    <span className="text-gray-600">{user.totalMatches ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Porcentaje de victoria:</span>
                    <span className="text-gray-600">{winPercentage}%</span>
                  </div>
                </div>
              </div>
            </ProfileCard>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <ProfileCard>
            <h2 className="text-xl font-semibold text-primary mb-4 text-center">Solicitudes de amistad</h2>
            {loadingFriends ? (
              <p className="text-center text-gray-600">Cargando datos de amistad...</p>
            ) : errorFriends ? (
              <p className="text-center text-red-500">{errorFriends}</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Solicitudes de amistad enviadas</h3>
                  {pendingRequests.sent.length > 0 ? (
                    <div className="space-y-2">
                      {pendingRequests.sent.map((request) => (
                        <div key={request.recipientId} className="bg-gray-100 p-3 rounded-lg flex items-center">
                          <img
                            src={request.profilePicture || `https://ui-avatars.com/api/?name=${request.username}&background=05374d&color=fff&size=40`}
                            alt={request.username}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <span className="flex-1 text-gray-700">
                            Solicitud enviada a {request.username}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No hay solicitudes enviadas.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Solicitudes de amistad recibidas</h3>
                  {pendingRequests.received.length > 0 ? (
                    <div className="space-y-2">
                      {pendingRequests.received.map((request) => (
                        <div key={request.requesterId} className="bg-gray-100 p-3 rounded-lg flex items-center">
                          <img
                            src={request.profilePicture || `https://ui-avatars.com/api/?name=${request.username}&background=05374d&color=fff&size=40`}
                            alt={request.username}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <span className="flex-1 text-gray-700">{request.username}</span>
                          <button
                            onClick={() => handleAcceptRequest(request.requesterId)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg ml-2"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.requesterId)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg ml-2"
                          >
                            Rechazar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No hay solicitudes recibidas.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Amigos</h3>
                  {friends.length > 0 ? (
                    <div className="space-y-2">
                      {friends.map((friend) => (
                        <div key={friend.id} className="bg-gray-100 p-3 rounded-lg flex items-center">
                          <img
                            src={friend.profilePicture || `https://ui-avatars.com/api/?name=${friend.username}&background=05374d&color=fff&size=40`}
                            alt={friend.username}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <span className="flex-1 text-gray-700">{friend.username}</span>
                          <button
                            onClick={() => handleRemoveFriend(friend.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg ml-2"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No tienes amigos todavía.</p>
                  )}
                </div>
              </div>
            )}
          </ProfileCard>
        </div>
      </div>
    </div>
  );
}

export default Profile;