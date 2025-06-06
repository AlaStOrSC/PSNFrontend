import { useTranslation } from 'react-i18next';
import 'animate.css';
import BannerImg from '../assets/bannerimg.jpg';
import Logo1 from '../assets/LeroyMerlinLogo.png';
import Logo2 from '../assets/NOXLogo.png';
import Logo3 from '../assets/PepsiCoLogo.png';
import Logo4 from '../assets/WilsonLogo.png';
import Logo5 from '../assets/SegurosSantaLogo.png';
import Logo6 from '../assets/HeadLogo.png';
import Logo7 from '../assets/BabolatLogo.png';
import Logo8 from '../assets/AdidasLogo.png';
import Gatorade from '../assets/Gatorade.png';
import LeroySalon from '../assets/LeroyDecoracion.png';
import SantaLucia from '../assets/SantaLucia.jpeg';
import Head from '../assets/HeadRethink.jpg';

function Sponsors() {
  const { t } = useTranslation();

  const logos = [Logo1, Logo2, Logo3, Logo4, Logo5, Logo6, Logo7, Logo8];

  return (
    <div className="min-h-screen bg-neutral dark:bg-dark-bg">
      <div
  className="relative h-96 bg-cover bg-center"
  style={{ backgroundImage: `url(${BannerImg})` }}
>
  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <h1
      className="text-4xl md:text-5xl font-bold text-white text-center px-16 animate__animated animate__fadeInUp"
    >
      {t('sponsors.banner_text')}
    </h1>
  </div>
</div>

      <div className="py-12 bg-gradient-to-r from-neutral to-gray-100 dark:from-dark-bg-border dark:to-gray-700 overflow-hidden">
  <div className="max-w-7xl mx-auto px-4">
    <div className="relative">
      <div className="inline-flex animate-scroll hover:pause-scroll whitespace-nowrap">
        {[...logos, ...logos, ...logos].map((logo, index) => (
          <div key={index} className="flex-shrink-0 mx-4 flex items-center justify-center">
            <img
              src={logo}
              alt={`Sponsor Logo ${index % 8 + 1}`}
              className="max-h-20 object-contain transition-transform duration-300 hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center mb-12">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <img
              src={Gatorade}
              alt="Sponsor 1"
              className="w-contain h-80 object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-1/2 md:pl-8">
            <h1 className="text-3xl font-bold text-primaryText dark:text-dark-text-accent mb-4">
              {t('pepsico.title_card')}
            </h1>
            <h2 className="text-lg text-primaryText dark:text-dark-text-secondary">
               {t('gatorade.h2Text')}
            </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse items-center mb-12">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <img
              src={LeroySalon}
              alt="Sponsor 2"
              className="w-contain h-80 object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-1/2 md:pr-8">
            <h1 className="text-3xl font-bold text-primaryText dark:text-dark-text-accent mb-4">
              {t('Leroy.title_card')}
            </h1>
            <h2 className="text-lg text-primaryText dark:text-dark-text-secondary">
              {t('Leroy.h2Text')}
            </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center mb-12">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <img
              src={SantaLucia}
              alt="Sponsor 3"
              className="w-full h-80 object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-1/2 md:pl-8">
            <h1 className="text-3xl font-bold text-primaryText dark:text-dark-text-accent mb-4">
              {t('SantaLu.title_card')}
            </h1>
            <h2 className="text-lg text-primaryText dark:text-dark-text-secondary">
            {t('SantaLu.h2Text')}
            </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse items-center mb-12">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <img
              src={Head}
              alt="Sponsor 4"
              className="w-full h-80 object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-1/2 md:pr-8">
            <h1 className="text-3xl font-bold text-primaryText dark:text-dark-text-accent mb-4">
              {t('Head.title_card')}
            </h1>
            <h2 className="text-lg text-primaryText dark:text-dark-text-secondary">
            {t('Head.h2Text')}
            </h2>
          </div>
        </div>
      </div>

    <style jsx>{`
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-155.333%);
    }
  }
  .animate-scroll {
    animation: scroll 18s linear infinite;
  }
  .pause-scroll:hover {
    animation-play-state: paused;
  }
`}</style>
    </div>
  );
}

export default Sponsors;