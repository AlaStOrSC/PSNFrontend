import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import api from '../services/api';
import Banner from '../components/Banner';
import NewsCards from '../components/NewsCards';
import Calendar from '../components/Calendar';
import JoinableMatchCard from '../components/JoinableMatchCard';
import JoinMatchModal from '../components/JoinMatchModal';
import { useState } from 'react';

function Home() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const response = await api.get('/matches');
      return response.data;
    },
    refetchOnMount: 'always',
    enabled: isAuthenticated,
    onError: (err) => {
      console.error('Error al obtener partidos:', err);
    },
  });

  const { data: joinableMatches = [], isLoading: joinableLoading, error: joinableError } = useQuery({
    queryKey: ['joinableMatches'],
    queryFn: async () => {
      const response = await api.get('/matches/joinable');
      return response.data;
    },
    enabled: isAuthenticated,
    onError: (err) => {
      console.error('Error al obtener partidos joinable:', err);
    },
  });

  const { data: friendshipData, isLoading: friendshipLoading } = useQuery({
    queryKey: ['friendship'],
    queryFn: async () => {
      const [requestsResponse, friendsResponse] = await Promise.all([
        api.get('/users/friends/requests'),
        api.get('/users/friends'),
      ]);
      return { requests: requestsResponse.data, friends: friendsResponse.data };
    },
    enabled: isAuthenticated,
    onError: (err) => {
      console.error('Error al obtener datos de amistad:', err);
    },
  });

  const joinMatchMutation = useMutation({
    mutationFn: async (matchId) => {
      const response = await api.put(`/matches/join/${matchId}`);
      return response.data.match;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['joinableMatches']);
      queryClient.invalidateQueries(['matches']);
      setIsJoinModalOpen(false);
      setIsSuccessModalOpen(true);
    },
    onError: (error) => {
      console.error('Error al unirse al partido:', error);
      alert('Error al unirse al partido: ' + (error.response?.data?.message || error.message));
    },
  });

  const handleJoinClick = (matchId) => {
    setSelectedMatchId(matchId);
    setIsJoinModalOpen(true);
  };

  const handleJoinConfirm = () => {
    joinMatchMutation.mutate(selectedMatchId);
  };

  const filteredJoinableMatches = joinableMatches.filter((match) =>
    [match.player1, match.player2, match.player3, match.player4]
      .filter(Boolean)
      .some((player) =>
        friendshipData?.friends.some((friend) => friend.id === player._id)
      )
  );

  return (
    <div className="min-h-screen bg-neutral dark:bg-dark-bg flex flex-col">
      <Banner className="mb-24" />
      <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl font-bold text-primaryText dark:text-dark-text-accent mb-4">
          {t('home.welcome')} {user?.username ? user.username : ' '}!
        </h1>
        {isAuthenticated && user && user.username ? (
          <p className="text-lg text-primaryText dark:text-dark-text-secondary mb-6">
            {t('home.authenticated_message')}
          </p>
        ) : (
          <p className="text-lg text-primaryText dark:text-dark-text-secondary mb-6">
            {t('home.unauthenticated_message')}
          </p>
        )}
        {isAuthenticated ? (
          <>
            <div className="w-full max-w-full px-4 mb-12">
              <h2 className="text-2xl font-bold text-primaryText dark:text-dark-text-accent mb-6">
                {t('home.joinable_title')}
              </h2>
              {joinableLoading || friendshipLoading ? (
                <p className="text-lg text-primaryText dark:text-dark-text-secondary">
                  {t('loading')}
                </p>
              ) : joinableError ? (
                <p className="text-lg text-red-500 dark:text-dark-error">
                  {t('home.no_joinable_matches')}
                </p>
              ) : filteredJoinableMatches.length === 0 ? (
                <p className="text-lg text-primaryText dark:text-dark-text-secondary">
                  {t('home.no_joinable_matches')}
                </p>
              ) : (
                <div className="relative w-full">
                  <Swiper
                    modules={[Navigation]}
                    spaceBetween={30}
                    slidesPerView={1}
                    breakpoints={{
                      640: { slidesPerView: 1 },
                      768: { slidesPerView: 2 },
                      1024: { slidesPerView: 3 },
                      1280: { slidesPerView: 3 },
                      1536: { slidesPerView: 4 },
                    }}
                    navigation={{
                      nextEl: '.swiper-button-next',
                      prevEl: '.swiper-button-prev',
                    }}
                    className="mySwiper"
                  >
                    {filteredJoinableMatches.map((match) => (
                      <SwiperSlide key={match._id}>
                        <JoinableMatchCard
                          match={match}
                          friends={friendshipData?.friends}
                          onJoin={handleJoinClick}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <div className="swiper-button-prev absolute -left-16 top-1/2 transform -translate-y-1/2 text-primaryText dark:text-dark-text-primary">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <div className="swiper-button-next absolute -right-16 top-1/2 transform -translate-y-1/2 text-primaryText dark:text-dark-text-primary">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            {matchesLoading ? (
              <p className="text-lg text-primaryText dark:text-dark-text-secondary">{t('loading')}</p>
            ) : matchesError ? (
              <p className="text-lg text-red-500 dark:text-dark-error">{t('home.error_matches')}</p>
            ) : (
              <Calendar matches={matches} locale={i18n.language} />
            )}
          </>
        ) : null}
        <div className="space-x-4 mb-12">
          {!isAuthenticated && (
            <>
              <a
                href="/auth"
                className="inline-block bg-secondary text-neutral dark:bg-dark-primary dark:text-dark-text-primary px-6 py-3 rounded-lg font-medium hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
              >
                {t('home.login')}
              </a>
              <a
                href="/auth"
                className="inline-block bg-secondary text-neutral dark:bg-dark-primary dark:text-dark-text-primary px-6 py-3 rounded-lg font-medium hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
              >
                {t('home.register')}
              </a>
            </>
          )}
        </div>
        <NewsCards />
      </div>
      <JoinMatchModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onConfirm={handleJoinConfirm}
        title={t('home.join_confirm_title')}
        message={t('home.join_confirm_message')}
      />
      <JoinMatchModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={t('home.join_success_title')}
        message={t('home.join_success_message')}
        showConfirm={false}
      />
    </div>
  );
}

export default Home;