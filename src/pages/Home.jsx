import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Banner from '../components/Banner';
import NewsCards from '../components/NewsCards';
import Calendar from '../components/Calendar';

function Home() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { t, i18n } = useTranslation();

  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const response = await api.get('/matches');
      return response.data;
    },
    refetchOnMount: 'always',
    onError: (err) => {
      console.error('Error al obtener partidos:', err);
    },
  });

  return (
    <div className="min-h-screen bg-neutral dark:bg-dark-bg flex flex-col">
      <Banner className="mb-24" />
      <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl font-bold text-primaryText dark:text-dark-text-accent mb-4">
          {t('home.welcome')} {user?.username ? user.username : " "}!
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
        {matchesLoading ? (
          <p className="text-lg text-primaryText dark:text-dark-text-secondary">Cargando calendario...</p>
        ) : matchesError ? (
          <p className="text-lg text-red-500 dark:text-dark-error">Error al cargar los partidos</p>
        ) : (
          <Calendar matches={matches} locale={i18n.language} />
        )}
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
    </div>
  );
}

export default Home;