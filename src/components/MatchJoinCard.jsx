import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import Slider from 'react-slick';
import api from '../services/api';
import MatchJoinCard from './MatchJoinCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const sliderSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  arrows: true,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } },
  ],
};

function JoinMatches({ locale }) {
  const { t } = useTranslation();

  const { data: friendshipData, isLoading: friendshipLoading, error: friendshipError } = useQuery({
    queryKey: ['friendship'],
    queryFn: async () => {
      const [requestsResponse, friendsResponse] = await Promise.all([
        api.get('/users/friends/requests'),
        api.get('/users/friends'),
      ]);
      return { pendingRequests: requestsResponse.data || { sent: [], received: [] }, friends: friendsResponse.data || [] };
    },
    enabled: true,
  });

  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ['joinableMatches'],
    queryFn: async () => {
      const response = await api.get('/matches/joinable');
      return response.data;
    },
    enabled: true,
  });

  if (friendshipError || matchesError) {
    return <p className="text-lg text-red-500 dark:text-dark-error">{t('join_matches.error_message')}</p>;
  }

  if (friendshipLoading || matchesLoading) {
    return <p className="text-lg text-primaryText dark:text-dark-text-secondary">{t('join_matches.loading')}</p>;
  }

  const userId = '6824ee52d8582a33c2bc568c';
  const friendIds = Array.isArray(friendshipData?.friends)
    ? friendshipData.friends.filter(friend => friend?.id).map(friend => friend.id.toString())
    : [];

  const joinableMatches = matches.filter((match) => {
    const hasFreeSlot = !match.player2 || !match.player3 || !match.player4;
    const matchPlayerIds = [
      match.player1?._id?.toString(),
      match.player2?._id?.toString(),
      match.player3?._id?.toString(),
      match.player4?._id?.toString(),
    ].filter(id => id);
    const userNotInvolved = !matchPlayerIds.includes(userId);
    console.log('match:', match._id, { hasFreeSlot, matchPlayerIds, friendIds, userNotInvolved });
    return hasFreeSlot && userNotInvolved;
  });

  console.log('friendIds:', friendIds);
  console.log('joinableMatches:', joinableMatches);

  if (joinableMatches.length === 0) {
    return (
      <div className="text-center">
        <p className="text-lg text-primaryText dark-text-secondary">{t('join_matches.no_matches')}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mb-8">
      <h2 className="text-2xl font-bold text-primaryText dark:text-dark-text-accent mb-4 text-center">
        {t('join_matches.title')}
      </h2>
      <Slider {...sliderSettings}>
        {joinableMatches.map((match) => (
          <div key={match._id} className="px-2">
            <MatchJoinCard match={match} locale={locale} />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default JoinMatches;