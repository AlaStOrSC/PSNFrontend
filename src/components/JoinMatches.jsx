import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import MatchJoinCard from './MatchJoinCard';

function JoinMatches({ locale }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { user } = useSelector((state) => state.auth);
  const userId = user?.id || user?.userId;

  const { data: friendshipData, isLoading: friendshipLoading, error: friendshipError } = useQuery({
    queryKey: ['friendship'],
    queryFn: async () => {
      const [requestsResponse, friendsResponse] = await Promise.all([
        api.get('/users/friends/requests'),
        api.get('/users/friends'),
      ]);
      console.log('friendshipData response:', { requests: requestsResponse.data, friends: friendsResponse.data });
      return { pendingRequests: requestsResponse.data || { sent: [], received: [] }, friends: friendsResponse.data || [] };
    },
    enabled: true,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ['joinableMatches'],
    queryFn: async () => {
      const response = await api.get('/matches/joinable');
      console.log('API /matches/joinable response:', response.data);
      return response.data;
    },
    enabled: true,
    refetchOnWindowFocus: false,
    retry: false,
  });

  if (friendshipError || matchesError) {
    console.error('Error fetching data:', { friendshipError, matchesError });
    return <p className="text-lg text-red-500 dark:text-dark-error">{t('join_matches.error_message')}</p>;
  }

  if (friendshipLoading || matchesLoading) {
    return <p className="text-lg text-primaryText dark:text-dark-text-secondary">{t('join_matches.loading')}</p>;
  }

  if (!userId) {
    console.error('No userId found in auth state');
    return <p className="text-lg text-red-500 dark:text-dark-error">User not authenticated</p>;
  }

  const friendIds = Array.isArray(friendshipData?.friends)
    ? friendshipData.friends.filter(friend => friend?.id).map(friend => {
        console.log('friend:', friend);
        return friend.id.toString();
      })
    : [];

  const joinableMatches = matches.filter((match) => {
    const hasFreeSlot = !match?.player2 || !match?.player3 || !match?.player4;
    const matchPlayerIds = [
      match?.player1?._id?.toString(),
      match?.player2?._id?.toString(),
      match?.player3?._id?.toString(),
      match?.player4?._id?.toString(),
    ].filter(id => id);
    const userNotInvolved = !matchPlayerIds.includes(userId);
    const hasFriend = matchPlayerIds.some(id => friendIds.includes(id));
    console.log('match:', match?._id, {
      hasFreeSlot,
      matchPlayerIds,
      friendIds,
      userNotInvolved,
      hasFriend,
    });
    return hasFreeSlot && userNotInvolved && hasFriend;
  });

  console.log('friendIds:', friendIds);
  console.log('joinableMatches:', joinableMatches);

  if (joinableMatches.length === 0) {
    return (
      <div className="text-center">
        <p className="text-lg text-primaryText dark:text-dark-text-secondary">{t('join_matches.no_matches')}</p>
      </div>
    );
  }

  const slidesToShow = Math.min(3, joinableMatches.length);
  const totalSlides = Math.ceil(joinableMatches.length / slidesToShow);
  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < totalSlides - 1;

  const handlePrev = () => {
    if (canGoLeft) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoRight) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const startIndex = currentIndex * slidesToShow;
  const visibleMatches = joinableMatches.slice(startIndex, startIndex + slidesToShow);

  return (
    <div className="w-full max-w-7xl mx-auto mb-8 px-4">
      <h2 className="text-2xl font-bold text-primaryText dark:text-dark-text-accent mb-4 text-center">
        {t('join_matches.title')}
      </h2>
      <div className="relative flex items-center">
        <button
          onClick={handlePrev}
          disabled={!canGoLeft}
          className={`p-2 mr-4 bg-gray-300 dark:bg-dark-bg-secondary rounded-full ${
            canGoLeft ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <svg className="w-6 h-6 text-primaryText dark:text-dark-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex gap-4 overflow-hidden flex-1">
          {visibleMatches.map((match) => (
            <div key={match._id} className="flex-none w-full sm:w-1/2 lg:w-1/3 px-2">
              <MatchJoinCard match={match} locale={locale} />
            </div>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!canGoRight}
          className={`p-2 ml-4 bg-gray-300 dark:bg-dark-bg-secondary rounded-full ${
            canGoRight ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <svg className="w-6 h-6 text-primaryText dark:text-dark-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default JoinMatches;