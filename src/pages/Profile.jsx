import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { setUser } from '../store/slices/authSlice';
import ModalP from '../components/ModalP';
import ProfileCard from '../components/ProfileCard';
import LuckyWheel from '../components/LuckyWheel';
import Spinner from '../components/Spinner';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/solid';

function Profile() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    phone: user?.phone || '',
    email: user?.email || '',
    city: user?.city || '',
  });
  const [success, setSuccess] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [prize, setPrize] = useState('');
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState(null);
  const fileInputRef = useRef(null);

  const { data: friendshipData, isLoading: isFriendshipLoading, error: friendshipError } = useQuery({
    queryKey: ['friendship'],
    queryFn: async () => {
      const [requestsResponse, friendsResponse] = await Promise.all([
        api.get('/users/friends/requests'),
        api.get('/users/friends'),
      ]);
      return { requests: requestsResponse.data, friends: friendsResponse.data };
    },
    enabled: !!user,
    onError: (err) => {
      console.error('Error al obtener datos de amistad:', err);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/users/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setUser(data));
      setIsEditing(false);
      setSuccess(t('profile.success.profile_updated'));
    },
    onError: (error) => {
      console.error('Error updating profile:', error.response?.data, error.message);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || t('profile.error.update_profile');
      if (errorMessage.toLowerCase().includes('email is already in use')) {
        setModalMessage(t('profile.error.email_in_use'));
      } else if (errorMessage.includes('Usuario no autenticado')) {
        setModalMessage(t('profile.error.unauthenticated'));
      } else {
        setModalMessage(t('profile.error.update_profile'));
      }
      setIsModalOpen(true);
      setSuccess(null);
    },
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async ({ file }) => {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const uploadResponse = await api.post('/files/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { profilePicture: url } = uploadResponse.data;
      const updateResponse = await api.put('/users/profile', { profilePicture: url });
      return updateResponse.data;
    },
    onSuccess: (data) => {
      dispatch(setUser(data));
      setSuccess(t('profile.success.profile_picture_updated'));
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.message || t('profile.error.upload_picture');
      if (errorMessage.includes('Usuario no autenticado')) {
        setModalMessage(t('profile.error.unauthenticated'));
      } else {
        setModalMessage(errorMessage);
      }
      setIsModalOpen(true);
      setSuccess(null);
    },
    onSettled: () => {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  });

  const redeemPointsMutation = useMutation({
    mutationFn: async ({ option, points }) => {
      const response = await api.post('/users/redeem-points', { option, points });
      return response.data.result;
    },
    onSuccess: (result, { option }) => {
      dispatch(setUser(result.user));
      if (option === 'luckyWheel') {
        setPrize(result.prize);
        setIsRedeemModalOpen(false);
        setIsWheelModalOpen(true);
      } else {
        let message = '';
        if (option === 'customGrip') {
          message = t('redeem.custom_grip_success');
        } else if (option === 'coachingSessions') {
          message = t('redeem.coaching_sessions_success');
        } else if (option === 'psnPack') {
          message = t('redeem.psn_pack_success');
        } else if (option === 'highPerformancePaddle') {
          message = t('redeem.high_performance_paddle_success');
        }
        setModalMessage(message);
        setIsModalOpen(true);
        setIsRedeemModalOpen(false);
        setIsConfettiActive(true);
      }
    },
    onError: (error) => {
      setModalMessage(error.response?.data?.error || t('redeem.error'));
      setIsModalOpen(true);
      setIsConfettiActive(false);
    },
  });

  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (requesterId) => {
      await api.put(`/users/friends/accept/${requesterId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friendship']);
    },
    onError: (err) => {
      setModalMessage(err.response?.data?.message || t('profile.error.accept_request'));
      setIsModalOpen(true);
    },
  });

  const rejectFriendRequestMutation = useMutation({
    mutationFn: async (requesterId) => {
      await api.put(`/users/friends/reject/${requesterId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friendship']);
    },
    onError: (err) => {
      setModalMessage(err.response?.data?.message || t('profile.error.reject_request'));
      setIsModalOpen(true);
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendId) => {
      await api.delete(`/users/friends/${friendId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friendship']);
    },
    onError: (err) => {
      setModalMessage(err.response?.data?.message || t('profile.error.remove_friend'));
      setIsModalOpen(true);
    },
  });

  if (!user) {
    return <div className="text-center text-primaryText dark:text-dark-error">{t('profile.error.no_user')}</div>;
  }

  const defaultAvatar = `https://ui-avatars.com/api/?name=${user.username}&background=${
    theme === 'dark' ? '0f172a' : '05374d'
  }&color=fff&size=128`;

  const handleEdit = () => {
    setIsEditing(true);
    setSuccess(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editedData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setModalMessage(t('profile.error.invalid_format'));
      setIsModalOpen(true);
      setIsUploading(false);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setModalMessage(t('profile.error.file_too_large'));
      setIsModalOpen(true);
      setIsUploading(false);
      return;
    }

    uploadProfilePictureMutation.mutate({ file });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
    setIsConfettiActive(false);
  };

  const closeRedeemModal = () => {
    setIsRedeemModalOpen(false);
  };

  const closeWheelModal = () => {
    setIsWheelModalOpen(false);
  };

  const closePrizeModal = () => {
    setIsPrizeModalOpen(false);
    setPrize('');
    setIsConfettiActive(false);
  };

  const closeFriendsModal = () => {
    setIsFriendsModalOpen(false);
    setModalSection(null);
  };

  const handleOpenFriendsModal = (section) => {
    setModalSection(section);
    setIsFriendsModalOpen(true);
  };

  const handleRedeemPoints = () => {
    setIsRedeemModalOpen(true);
  };

  const handleRedeemOption = (option, points) => {
    redeemPointsMutation.mutate({ option, points });
  };

  const handleWheelSpinFinish = (winner) => {
    setPrize(winner);
    setIsWheelModalOpen(false);
    setIsPrizeModalOpen(true);
    setIsConfettiActive(winner !== t('redeem.prizes.next_time'));
  };

  const handleAcceptRequest = (requesterId) => {
    acceptFriendRequestMutation.mutate(requesterId);
  };

  const handleRejectRequest = (requesterId) => {
    rejectFriendRequestMutation.mutate(requesterId);
  };

  const handleRemoveFriend = (friendId) => {
    removeFriendMutation.mutate(friendId);
  };

  const winPercentage = user.totalMatches > 0
    ? ((user.matchesWon / (user.totalMatches - user.matchesDrawn)) * 100).toFixed(2)
    : 0;

  const wheelOptions = [
    t('redeem.prizes.overgrip'),
    t('redeem.prizes.ball_pack'),
    t('redeem.prizes.towel'),
    t('redeem.prizes.cap'),
    t('redeem.prizes.next_time'),
    t('redeem.prizes.laces'),
    t('redeem.prizes.protector'),
  ];

  return (
    <div className="min-h-screen bg-neutral dark:bg-dark-bg flex flex-col justify-center py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primaryText dark:text-dark-text-accent mb-6 text-center">{t('profile.title')}</h1>

        <ModalP
          isOpen={isModalOpen}
          onClose={closeModal}
          title={modalMessage.includes('insuficientes') ? t('redeem.error_title') : modalMessage.includes('Error') ? t('profile.modal.error_title') : t('redeem.success_title')}
          message={modalMessage}
          className="text-primaryText dark:bg-dark-bg-secondary dark:text-dark-text-primary"
          confetti={isConfettiActive}
          zIndex={60}
        />

        <ModalP
          isOpen={isRedeemModalOpen}
          onClose={closeRedeemModal}
          title={t('redeem.title')}
          className="text-primaryText dark:bg-dark-bg-secondary dark:text-dark-text-primary"
          zIndex={50}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-primaryText dark:text-dark-text-primary mb-2">{t('redeem.100_points')}</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleRedeemOption('luckyWheel', 100)}
                  className="w-full px-4 py-2 bg-secondary text-neutral dark:bg-dark-primary dark:text-dark-text-primary rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
                >
                  {t('redeem.lucky_wheel')}
                </button>
                <button
                  onClick={() => handleRedeemOption('customGrip', 100)}
                  className="w-full px-4 py-2 bg-secondary text-neutral dark:bg-dark-primary dark:text-dark-text-primary rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
                >
                  {t('redeem.custom_grip')}
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primaryText dark:text-dark-text-primary mb-2">{t('redeem.500_points')}</h3>
              <button
                onClick={() => handleRedeemOption('coachingSessions', 500)}
                className="w-full px-4 py-2 bg-secondary text-neutral dark:bg-dark-primary dark:text-dark-text-primary rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
              >
                {t('redeem.coaching_sessions')}
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primaryText dark:text-dark-text-primary mb-2">{t('redeem.1000_points')}</h3>
              <button
                onClick={() => handleRedeemOption('psnPack', 1000)}
                className="w-full px-4 py-2 bg-secondary text-neutral dark:bg-dark-primary dark:text-dark-text-primary rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
              >
                {t('redeem.psn_pack')}
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primaryText dark:text-dark-text-primary mb-2">{t('redeem.5000_points')}</h3>
              <button
                onClick={() => handleRedeemOption('highPerformancePaddle', 5000)}
                className="w-full px-4 py-2 bg-secondary text-neutral dark:bg-dark-primary dark:text-dark-text-primary rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
              >
                {t('redeem.high_performance_paddle')}
              </button>
            </div>
          </div>
        </ModalP>

        <ModalP
          isOpen={isWheelModalOpen}
          onClose={closeWheelModal}
          title={t('redeem.lucky_wheel')}
          className="text-primaryText dark:bg-dark-bg-secondary dark:text-dark-text-primary"
          zIndex={50}
        >
          <LuckyWheel
            options={wheelOptions}
            onFinish={handleWheelSpinFinish}
            primaryColor={theme === 'dark' ? '#0f172a' : '#05374d'}
            textColor="#fff"
          />
        </ModalP>

        <ModalP
          isOpen={isPrizeModalOpen}
          onClose={closePrizeModal}
          title={prize === t('redeem.prizes.next_time') ? t('redeem.no_prize_title') : t('redeem.prize_title')}
          message={prize === t('redeem.prizes.next_time') ? t('redeem.no_prize_message') : `${t('redeem.prize_message').replace('{prize}', prize)} `}
          className="text-primaryText dark:bg-dark-bg-secondary dark:text-dark-text-primary"
          confetti={isConfettiActive}
          zIndex={60}
        />

        <ModalP
          isOpen={isFriendsModalOpen}
          onClose={closeFriendsModal}
          title={
            modalSection === 'sent'
              ? t('profile.sent_requests')
              : modalSection === 'received'
              ? t('profile.received_requests')
              : t('profile.friends')
          }
          className="text-primaryText dark:bg-dark-bg-secondary dark:text-dark-text-primary"
          zIndex={70}
        >
          <div className="space-y-4 p-4">
            {modalSection === 'sent' && friendshipData?.requests.sent.length > 0 ? (
              friendshipData.requests.sent.map((request) => (
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
                  <span className="flex-1 text-primaryText dark:text-dark-text-primary">
                    {t('profile.request_sent_to')} {request.username}
                  </span>
                </div>
              ))
            ) : modalSection === 'sent' ? (
              <p className="text-primaryText dark:text-dark-text-secondary">{t('profile.no_sent_requests')}</p>
            ) : null}

            {modalSection === 'received' && friendshipData?.requests.received.length > 0 ? (
              friendshipData.requests.received.map((request) => (
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
                  <span className="flex-1 text-primaryText dark:text-dark-text-primary">{request.username}</span>
                  <button
                    onClick={() => handleAcceptRequest(request.requesterId)}
                    className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-neutral dark:text-white px-3 py-1 rounded-lg ml-2"
                  >
                    {t('profile.accept')}
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.requesterId)}
                    className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-neutral dark:text-white px-3 py-1 rounded-lg ml-2"
                  >
                    {t('profile.reject')}
                  </button>
                </div>
              ))
            ) : modalSection === 'received' ? (
              <p className="text-primaryText dark:text-dark-text-secondary">{t('profile.no_received_requests')}</p>
            ) : null}

            {modalSection === 'friends' && friendshipData?.friends.length > 0 ? (
              friendshipData.friends.map((friend) => (
                <div key={friend.userId} className="bg-gray-100 dark:bg-dark-bg-tertiary p-3 rounded-lg flex items-center">
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
                  <span className="flex-1 text-primaryText dark:text-dark-text-primary">{friend.username}</span>
                  <button
                    onClick={() => handleRemoveFriend(friend.userId)}
                    className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-neutral dark:text-white px-3 py-1 rounded-lg ml-2"
                  >
                    {t('profile.remove_friend')}
                  </button>
                </div>
              ))
            ) : modalSection === 'friends' ? (
              <p className="text-primaryText dark:text-dark-text-secondary">{t('profile.no_friends')}</p>
            ) : null}
          </div>
        </ModalP>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="w-full min-w-[24.8rem] mx-auto h-[520px]">
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
                  className="text-primaryText dark:text-dark-text-accent hover:underline dark:hover:text-dark-secondary disabled:opacity-50"
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
                  <span className="font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.username')}:</span>
                  <span className="text-primaryText dark:text-dark-text-secondary">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.phone')}:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={editedData.phone}
                      onChange={handleInputChange}
                      className="border rounded-lg p-1 text-primaryText dark:text-dark-text-secondary dark:bg-dark-bg-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                    />
                  ) : (
                    <span className="text-primaryText dark:text-dark-text-secondary">{user.phone}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.email')}:</span>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedData.email}
                      onChange={handleInputChange}
                      className="border rounded-lg p-1 text-primaryText dark:text-dark-text-secondary dark:bg-dark-bg-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                    />
                  ) : (
                    <span className="text-primaryText dark:text-dark-text-secondary">{user.email}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.city')}:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={editedData.city}
                      onChange={handleInputChange}
                      className="border rounded-lg p-1 text-primaryText dark:text-dark-text-secondary dark:bg-dark-bg-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                    />
                  ) : (
                    <span className="text-primaryText dark:text-dark-text-secondary">{user.city}</span>
                  )}
                </div>
              </div>

              {success && <p className="text-green-500 dark:text-green-400 text-center mt-4">{success}</p>}

              <div className="flex justify-center mt-4 space-x-2">
                {isEditing ? (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-secondary text-neutral dark:bg-dark-primary dark:text-dark-text-primary rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
                  >
                    {t('profile.save_changes')}
                  </button>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-secondary text-neutral dark:bg-dark-primary dark:text-dark-text-primary rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
                  >
                    {t('profile.edit')}
                  </button>
                )}
              </div>
            </ProfileCard>
          </div>

          <div className="w-full min-w-[24.8rem] mx-auto h-[520px]">
            <ProfileCard>
              <h2 className="text-xl font-semibold text-primaryText dark:text-dark-text-accent mb-4 text-center">{t('profile.stats_title')}</h2>
              <div className="flex-1 flex items-center">
                <div className="space-y-2 w-full">
                  <div className="flex justify-between">
                    <span className="font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.score')}:</span>
                    <span className="text-primaryText dark:text-dark-text-secondary">{(user.score ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.matches_won')}:</span>
                    <span className="text-primaryText dark:text-dark-text-secondary">{user.matchesWon ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.matches_lost')}:</span>
                    <span className="text-primaryText dark:text-dark-text-secondary">{user.matchesLost ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.matches_drawn')}:</span>
                    <span className="text-primaryText dark:text-dark-text-secondary">{user.matchesDrawn ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.total_matches')}:</span>
                    <span className="text-primaryText dark:text-dark-text-secondary">{user.totalMatches ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.win_percentage')}:</span>
                    <span className="text-primaryText dark:text-dark-text-secondary">{winPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.points')}:</span>
                    <span className="text-primaryText dark:text-dark-text-secondary">{user.points ?? 0}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleRedeemPoints}
                  className="px-4 py-2 text-neutral font-semibold rounded-lg shadow-md transition-all duration-300
                    bg-secondary hover:bg-buttonsHover
                    dark:bg-dark-primary dark:hover:bg-buttonsHover dark:text-dark-text-primary"
                >
                  {t('profile.redeem_points')}
                </button>
              </div>
            </ProfileCard>
          </div>

          <div className="w-full min-w-[24.8rem] mx-auto h-[520px]">
            <ProfileCard>
              <h2 className="text-xl font-semibold text-primaryText dark:text-dark-text-accent mb-4 text-center">{t('profile.friend_requests_title')}</h2>
              {isFriendshipLoading ? (
                <Spinner />
              ) : friendshipError ? (
                <p className="text-center text-primaryText dark:text-dark-error">{friendshipError.message || t('profile.error.load_friends')}</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.sent_requests')}</h3>
                      <button
                        onClick={() => handleOpenFriendsModal('sent')}
                        className="text-primaryText dark:text-dark-text-accent hover:text-secondary dark:hover:text-dark-secondary"
                      >
                        <ArrowsPointingOutIcon className="h-5 w-5" />
                      </button>
                    </div>
                    {friendshipData?.requests.sent.length > 0 ? (
                      <div className="space-y-2 max-h-[120px] overflow-y-auto">
                        {friendshipData.requests.sent.map((request) => (
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
                            <span className="flex-1 text-primaryText dark:text-dark-text-primary">
                              {t('profile.request_sent_to')} {request.username}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-primaryText dark:text-dark-text-secondary">{t('profile.no_sent_requests')}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.received_requests')}</h3>
                      <button
                        onClick={() => handleOpenFriendsModal('received')}
                        className="text-primaryText dark:text-dark-text-accent hover:text-secondary dark:hover:text-dark-secondary"
                      >
                        <ArrowsPointingOutIcon className="h-5 w-5" />
                      </button>
                    </div>
                    {friendshipData?.requests.received.length > 0 ? (
                      <div className="space-y-2 max-h-[120px] overflow-y-auto">
                        {friendshipData.requests.received.map((request) => (
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
                            <span className="flex-1 text-primaryText dark:text-dark-text-primary">{request.username}</span>
                            <button
                              onClick={() => handleAcceptRequest(request.requesterId)}
                              className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-neutral dark:text-white px-3 py-1 rounded-lg ml-2"
                            >
                              {t('profile.accept')}
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.requesterId)}
                              className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-neutral dark:text-white px-3 py-1 rounded-lg ml-2"
                            >
                              {t('profile.reject')}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-primaryText dark:text-dark-text-secondary">{t('profile.no_received_requests')}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-primaryText dark:text-dark-text-primary">{t('profile.friends')}</h3>
                      <button
                        onClick={() => handleOpenFriendsModal('friends')}
                        className="text-primaryText dark:text-dark-text-accent hover:text-secondary dark:hover:text-dark-secondary"
                      >
                        <ArrowsPointingOutIcon className="h-5 w-5" />
                      </button>
                    </div>
                    {friendshipData?.friends.length > 0 ? (
                      <div className="space-y-2 max-h-[120px] overflow-y-auto">
                        {friendshipData.friends.map((friend) => (
                          <div key={friend.userId} className="bg-gray-100 dark:bg-dark-bg-tertiary p-3 rounded-lg flex items-center">
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
                            <span className="flex-1 text-primaryText dark:text-dark-text-primary">{friend.username}</span>
                            <button
                              onClick={() => handleRemoveFriend(friend.userId)}
                              className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-neutral dark:text-white px-3 py-1 rounded-lg ml-2"
                            >
                              {t('profile.remove_friend')}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-primaryText dark:text-dark-text-secondary">{t('profile.no_friends')}</p>
                    )}
                  </div>
                </div>
              )}
            </ProfileCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;