import BannerM from '../components/BannerM';
import ValueCard from '../components/ValueCard';
import EnvironmentalImpactChart from '../components/EnvironmentalImpactChart';
import TestimonialSlider from '../components/TestimonialSlider';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import bannerImage from '../assets/MedioAmbiente.jpg';
import sostenibilidad from '../assets/sostenibilidad.jpg';
import calidad from '../assets/calidad.jpg'
import comunidad from '../assets/comunidad.jpg'

const valueCards = [
  {
    image: calidad,
    titleKey: 'conocenos.cards.calidad.title',
    descriptionKey: 'conocenos.cards.calidad.description',
  },
  {
    image: comunidad,
    titleKey: 'conocenos.cards.comunidad.title',
    descriptionKey: 'conocenos.cards.comunidad.description',
  },
  {
    image: sostenibilidad,
    titleKey: 'conocenos.cards.sostenibilidad.title',
    descriptionKey: 'conocenos.cards.sostenibilidad.description',
  },
];

function Conocenos() {
  const { t } = useTranslation();
  const cardsRef = useRef(null);
  const isCardsInView = useInView(cardsRef, { once: true, margin: '0px 0px -100px 0px' });

  return (
    <div className="min-h-screen bg-neutral dark:bg-dark-bg">
      <BannerM
        image={bannerImage}
        title={t('conocenos.title')}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-primary dark:text-dark-text-accent text-center mb-6">
          {t('conocenos.values_title')}
        </h2>
        <p className="text-lg text-gray-700 dark:text-dark-text-secondary text-center mb-12 max-w-3xl mx-auto">
          {t('conocenos.description')}
        </p>
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {valueCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isCardsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <ValueCard
                image={card.image}
                title={t(card.titleKey)}
                description={t(card.descriptionKey)}
              />
            </motion.div>
          ))}
        </div>
        <EnvironmentalImpactChart />
        <TestimonialSlider />
      </div>
    </div>
  );
}

export default Conocenos;