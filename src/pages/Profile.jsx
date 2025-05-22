import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { setUser } from '../store/slices/authSlice';
import Modal from '../components/Modal';
import ProfileCard from '../components/ProfileCard';

function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);
  const { t } = useTranslation();
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
        setError(err.response?.data?.message || t('profile.error.load_profile'));
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
        setErrorFriends(err.response?.data?.message || t('profile.error.load_friends'));
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchUserProfile();
    fetchFriendshipData();
  }, [dispatch, t]);

  if (!user) {
    return <div className="text-center text-red-500 dark:text-dark-error">{t('profile.error.no_user')}</div>;
  }

  const defaultAvatar = `https://ui-avatars.com/api/?name=${user.username}&background=${
    theme === 'dark' ? '0f172a' : '05374d'
  }&color=fff&size=128`;

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
      setSuccess(t('profile.success.profile_updated'));
      setError(null);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || t('profile.error.update_profile');
      if (errorMessage.includes('The email is already in use')) {
        setModalMessage(t('profile.error.email_in_use'));
      } else if (errorMessage.includes('Usuario no autenticado')) {
        setModalMessage(t('profile.error.unauthenticated'));
      } else {
        setModalMessage(errorMessage);
      }
      setIsModalOpen(true);
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
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        throw new Error(t('profile.error.invalid_format'));
      }
      if (file.size > 5 * 1024 * 1024) { 
        throw new Error(t('profile.error.file_too_large'));
      }

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
      setSuccess(t('profile.success.profile_picture_updated'));
    } catch (error) {
      console.error('Error al subir la foto:', error);
      const errorMessage = error.response?.data?.error || error.message || t('profile.error.upload_picture');
      if (errorMessage.includes('Usuario no autenticado')) {
        setModalMessage(t('profile.error.unauthenticated'));
      } else {
        setModalMessage(errorMessage);
      }
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
      setErrorFriends(err.response?.data?.message || t('profile.error.load_friends'));
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
      setModalMessage(err.response?.data?.message || t('profile.error.accept_request'));
      setIsModalOpen(true);
    }
  };

  const handleRejectRequest = async (requesterId) => {
    try {
      await api.put(`/users/friends/reject/${requesterId}`);
      await refreshFriendshipData();
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
      setModalMessage(err.response?.data?.message || t('profile.error.reject_request'));
      setIsModalOpen(true);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await api.delete(`/users/friends/${friendId}`);
      await refreshFriendshipData();
    } catch (err) {
      console.error('Error al eliminar amigo:', err);
      setModalMessage(err.response?.data?.message || t('profile.error.remove_friend'));
      setIsModalOpen(true);
    }
  };

  const winPercentage = user.totalMatches > 0
    ? ((user.matchesWon / (user.totalMatches - user.matchesDrawn)) * 100).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen bg-neutral dark:bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary dark:text-dark-text-accent mb-6 text-center">{t('profile.title')}</h1>

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={t('profile.modal.error_title')}
          message={modalMessage}
        />

        <div className="mb-6 sm:flex sm:gap-6 sm:items-stretch sm:min-h-[400px]">
          <div className="max-w-md mx-auto sm:max-w-none sm:mx-0 sm:flex-1">
            <ProfileCard>
              <div className="flex flex-col items-center mb-4">
                <img
                  src={user.profilePicture || defaultAvatar}
                  alt={t('profile.alt.profile_picture')}
                  className="w-32 h-32 rounded-full object-cover mb-4"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png"
                  className="hidden"
                />
                <button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="text-primary dark:text-dark-text-accent hover:underline dark:hover:text-dark-secondary disabled:opacity-50"
                >
                  {isUploading
                    ? t('profile.uploading')
                    : user.profilePicture
                    ? t('profile.change_picture')
                    : t('profile.upload_picture')}
                </button>
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700 dark:text-dark-text-primary">{t('profile.username')}:</span>
                  <span className="text-gray-600 dark:text-dark-text-secondary">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700 dark:text-dark-text-primary">{t('profile.phone')}:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={editedData.phone}
                      onChange={handleInputChange}
                      className="border rounded-lg p-1 text-gray-600 dark:text-dark-text-secondary dark:bg-dark-bg-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                    />
                  ) : (
                    <span className="text-gray-600 dark:text-dark-text-secondary">{user.phone}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700 dark:text-dark-text-primary">{t('profile.email')}:</span>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedData.email}
                      onChange={handleInputChange}
                      className="border rounded-lg p-1 text-gray-600 dark:text-dark-text-secondary dark:bg-dark-bg-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                    />
                  ) : (
                    <span className="text-gray-600 dark:text-dark-text-secondary">{user.email}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700 dark:text-dark-text-primary">{t('profile.city')}:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={editedData.city}
                      onChange={handleInputChange}
                      className="border rounded-lg p-1 text-gray-600 dark:text-dark-text-secondary dark:bg-dark-bg-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                    />
                  ) : (
                    <span className="text-gray-600 dark:text-dark-text-secondary">{user.city}</span>
                  )}
                </div>
              </div>

              {success && <p className="text-green-500 dark:text-green-400 text-center mt-4">{success}</p>}

              <div className="flex justify-center mt-4 space-x-2">
                {isEditing ? (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary text-white dark:bg-dark-primary dark:text-dark-text-primary rounded-lg hover:bg-secondary dark:hover:bg-dark-secondary transition-colors"
                  >
                    {t('profile.save_changes')}
                  </button>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-primary text-white dark:bg-dark-primary dark:text-dark-text-primary rounded-lg hover:bg-secondary dark:hover:bg-dark-secondary transition-colors"
                  >
                    {t('profile.edit')}
                  </button>
                )}
              </div>
            </ProfileCard>
          </div>

          <div className="max-w-md mx-auto sm:max-w-none sm:mx-0 sm:flex-1">
            <ProfileCard>
              <h2 className="text-xl font-semibold text-primary dark:text-dark-text-accent mb-4 text-center">{t('profile.stats_title')}</h2>
              <div className="flex-1 flex items-center">
                <div className="space-y-2 w-full">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700 dark:text-dark-text-primary">{t('profile.score')}:</span>
                    <span className="text-gray-600 dark:text-dark-text-secondary">{(user.score ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700 dark:text-dark-text-primary">{t('profile.matches_won')}:</span>
                    <span className="text-gray-600 dark:text-dark-text-secondary">{user.matchesWon ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700 dark:text-dark-text-primary">{t('profile.matches_lost')}:</span>
                    <span className="text-gray-600 dark:text-dark-text-secondary">{user.matchesLost ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700 dark:text-dark-text-primary">{t('profile.matches_drawn')}:</span>
                    <span className="text-gray-600 dark:text-dark-text-secondary">{user.matchesDrawn ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700 dark:text-dark-text-primary">{t('profile.total_matches')}:</span>
                    <span className="text-gray-600 dark:text-dark-text-secondary">{user.totalMatches ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700 dark:text-dark-text-primary">{t('profile.win_percentage')}:</span>
                    <span className="text-gray-600 dark:text-dark-text-secondary">{winPercentage}%</span>
                  </div>
                </div>
              </div>
            </ProfileCard>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <ProfileCard>
            <h2 className="text-xl font-semibold text-primary dark:text-dark-text-accent mb-4 text-center">{t('profile.friend_requests_title')}</h2>
            {loadingFriends ? (
              <p className="text-center text-gray-600 dark:text-dark-text-secondary">{t('profile.loading_friends')}</p>
            ) : errorFriends ? (
              <p className="text-center text-red-500 dark:text-dark-error">{errorFriends}</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-2">{t('profile.sent_requests')}</h3>
                  {pendingRequests.sent.length > 0 ? (
                    <div className="space-y-2">
                      {pendingRequests.sent.map((request) => (
                        <div key={request.recipientId} className="bg-gray-100 dark:bg-dark-bg-tertiary p-3 rounded-lg flex items-center">
                          <img
                            src={
                              request.profilePicture ||
                              `https://ui-avatars.com/api/?name=${request.username}&background=${
                                theme === 'dark' ? '0f172a' : '05374d'
                              }&color=fff&size=40`
                            }
                            alt={request.username}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <span className="flex-1 text-gray-700 dark:text-dark-text-primary">
                            {t('profile.request_sent_to')} {request.username}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-dark-text-secondary">{t('profile.no_sent_requests')}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-2">{t('profile.received_requests')}</h3>
                  {pendingRequests.received.length > 0 ? (
                    <div className="space-y-2">
                      {pendingRequests.received.map((request) => (
                        <div key={request.requesterId} className="bg-gray-100 dark:bg-dark-bg-tertiary p-3 rounded-lg flex items-center">
                          <img
                            src={
                              request.profilePicture ||
                              `https://ui-avatars.com/api/?name=${request.username}&background=${
                                theme === 'dark' ? '0f172a' : '05374d'
                              }&color=fff&size=40`
                            }
                            alt={request.username}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <span className="flex-1 text-gray-700 dark:text-dark-text-primary">{request.username}</span>
                          <button
                            onClick={() => handleAcceptRequest(request.requesterId)}
                            className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white px-3 py-1 rounded-lg ml-2"
                          >
                            {t('profile.accept')}
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.requesterId)}
                            className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1 rounded-lg ml-2"
                          >
                            {t('profile.reject')}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-dark-text-secondary">{t('profile.no_received_requests')}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-2">{t('profile.friends')}</h3>
                  {friends.length > 0 ? (
                    <div className="space-y-2">
                      {friends.map((friend) => (
                        <div key={friend.id} className="bg-gray-100 dark:bg-dark-bg-tertiary p-3 rounded-lg flex items-center">
                          <img
                            src={
                              friend.profilePicture ||
                              `https://ui-avatars.com/api/?name=${friend.username}&background=${
                                theme === 'dark' ? '0f172a' : '05374d'
                              }&color=fff&size=40`
                            }
                            alt={friend.username}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <span className="flex-1 text-gray-700 dark:text-dark-text-primary">{friend.username}</span>
                          <button
                            onClick={() => handleRemoveFriend(friend.id)}
                            className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1 rounded-lg ml-2"
                          >
                            {t('profile.remove_friend')}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-dark-text-secondary">{t('profile.no_friends')}</p>
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