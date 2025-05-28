import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Banner from '../components/Banner';
import NewsCards from '../components/NewsCards';

function Home() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-neutral dark:bg-dark-bg flex flex-col">
      <Banner className="mb-24" />
      <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl font-bold text-primary dark:text-dark-text-accent mb-4">
          {t('home.welcome')} {user?.username ? user.username : " "}!
        </h1>
        {isAuthenticated && user && user.username ? (
          <p className="text-lg text-gray-700 dark:text-dark-text-secondary mb-6">
            {t('home.authenticated_message')} 
          </p>
        ) : (
          <p className="text-lg text-gray-700 dark:text-dark-text-secondary mb-6">
            {t('home.unauthenticated_message')}
          </p>
        )}
        <div className="space-x-4 mb-12">
          {!isAuthenticated && (
            <>
              <a
                href="/auth"
                className="inline-block bg-primary text-white dark:bg-dark-primary dark:text-dark-text-primary px-6 py-3 rounded-lg font-medium hover:bg-secondary dark:hover:bg-dark-secondary transition-colors"
              >
                {t('home.login')}
              </a>
              <a
                href="/auth"
                className="inline-block bg-accent text-white dark:bg-dark-text-accent dark:text-dark-text-primary px-6 py-3 rounded-lg font-medium hover:bg-orange-500 dark:hover:bg-yellow-600 transition-colors"
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