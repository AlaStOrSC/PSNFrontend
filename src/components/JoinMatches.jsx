import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import Slider from 'react-slick';
import api from '../services/api';
import MatchJoinCard from './MatchJoinCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const sliderSettings = {
  dots: true,
  infinite: false, // Evita bucles en el slider
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

  const { data: matches = [], isLoading, error } = useQuery({
    queryKey: ['joinableMatches'],
    queryFn: async () => {
      const response = await api.get('/matches/joinable');
      console.log('API /matches/joinable response:', response.data);
      return response.data;
    },
    enabled: true,
    retry: false, // Evita reintentos que puedan causar bucles
  });

  if (error) {
    console.error('Error fetching joinable matches:', error);
    return <p className="text-lg text-red-500 dark:text-dark-error">{t('join_matches.error_message')}</p>;
  }

  if (isLoading) {
    return <p className="text-lg text-primaryText dark:text-dark-text-secondary">{t('join_matches.loading')}</p>;
  }

  const joinableMatches = matches.filter((match) => {
    const hasFreeSlot = !match.player2 || !match.player3 || !match.player4;
    console.log('match:', match?._id, {
      hasFreeSlot,
      player1: match?.player1?._id?.toString() || 'undefined',
      player2: match?.player2?._id?.toString() || null,
      player3: match?.player3?._id?.toString() || null,
      player4: match?.player4?._id?.toString() || null,
    });
    return hasFreeSlot;
  });

  console.log('joinableMatches:', joinableMatches);

  if (joinableMatches.length === 0) {
    return (
      <div className="text-center">
        <p className="text-lg text-primaryText dark:text-dark-text-secondary">{t('join_matches.no_matches')}</p>
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