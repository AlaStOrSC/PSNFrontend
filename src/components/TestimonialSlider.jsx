import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import TestimonialCard from './TestimonialCard';
import { useTranslation } from 'react-i18next';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import EnriqueMacias from '../assets/CEO.jpg';
import AnaGarcia from '../assets/AnaGarcia.jpg';
import Laura from '../assets/Laura.jpeg';
import Miguel from '../assets/Miguel.jpeg';
import CarlosMartinez from '../assets/CarlosMartinez.jpg';

const testimonials = [
  {
    image: EnriqueMacias,
    nameKey: 'conocenos.testimonials.ceo.name',
    roleKey: 'conocenos.testimonials.ceo.role',
    commentKey: 'conocenos.testimonials.ceo.comment',
  },
  {
    image: AnaGarcia,
    nameKey: 'conocenos.testimonials.user1.name',
    roleKey: 'conocenos.testimonials.user1.role',
    commentKey: 'conocenos.testimonials.user1.comment',
  },
  {
    image: CarlosMartinez,
    nameKey: 'conocenos.testimonials.user2.name',
    roleKey: 'conocenos.testimonials.user2.role',
    commentKey: 'conocenos.testimonials.user2.comment',
  },
  {
    image: Laura,
    nameKey: 'conocenos.testimonials.user3.name',
    roleKey: 'conocenos.testimonials.user3.role',
    commentKey: 'conocenos.testimonials.user3.comment',
  },
  {
    image: Miguel,
    nameKey: 'conocenos.testimonials.user4.name',
    roleKey: 'conocenos.testimonials.user4.role',
    commentKey: 'conocenos.testimonials.user4.comment',
  },
];

function TestimonialSlider() {
  const { t } = useTranslation();

  return (
    <div className="bg-neutral dark:bg-dark-bg py-12">
      <h2 className="text-3xl font-bold text-primary dark:text-dark-text-accent text-center mb-6">
        {t('conocenos.testimonials.title')}
      </h2>
      <div className="relative max-w-7xl mx-auto px-12">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          navigation={{
            nextEl: '.custom-swiper-button-next',
            prevEl: '.custom-swiper-button-prev',
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="max-w-full"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <TestimonialCard
                image={testimonial.image}
                name={t(testimonial.nameKey)}
                role={t(testimonial.roleKey)}
                comment={t(testimonial.commentKey)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Botones personalizados de navegación */}
        <div className="custom-swiper-button-prev absolute top-1/2 -left-10 transform -translate-y-1/2 cursor-pointer text-primary dark:text-dark-text-accent">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="custom-swiper-button-next absolute top-1/2 -right-10 transform -translate-y-1/2 cursor-pointer text-primary dark:text-dark-text-accent">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default TestimonialSlider;