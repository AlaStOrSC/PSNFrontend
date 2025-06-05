import bannerImage from '../assets/b4.jpg';
import { useTranslation } from 'react-i18next';

function Banner({ className = '' }) {
   const { t } = useTranslation();
  return (
    <div
      className={`relative bg-cover bg-center h-[420px] flex items-center justify-center bg-fixed ${className}`}
      style={{ backgroundImage: `url(${bannerImage})`, backgroundPosition: '50% 150%' }}
    >
      <div className="absolute inset-0 bg-primary dark:bg-dark-bg-secondary opacity-50"></div>
      <div className="relative z-10 text-center text-white dark:text-dark-text-primary px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          {t('banner.texth1')}
        </h1>
        <h2 className="text-xl md:text-2xl font-medium drop-shadow-lg">
          {t('banner.texth2')}
        </h2>
      </div>
    </div>
  );
}

export default Banner;