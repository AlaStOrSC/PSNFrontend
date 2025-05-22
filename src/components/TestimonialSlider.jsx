import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import TestimonialCard from './TestimonialCard';
import { useTranslation } from 'react-i18next';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const testimonials = [
  {
    image: 'https://picsum.photos/150?random=1',
    nameKey: 'conocenos.testimonials.ceo.name',
    roleKey: 'conocenos.testimonials.ceo.role',
    commentKey: 'conocenos.testimonials.ceo.comment',
  },
  {
    image: 'https://picsum.photos/150?random=2',
    nameKey: 'conocenos.testimonials.user1.name',
    roleKey: 'conocenos.testimonials.user1.role',
    commentKey: 'conocenos.testimonials.user1.comment',
  },
  {
    image: 'https://picsum.photos/150?random=3',
    nameKey: 'conocenos.testimonials.user2.name',
    roleKey: 'conocenos.testimonials.user2.role',
    commentKey: 'conocenos.testimonials.user2.comment',
  },
  {
    image: 'https://picsum.photos/150?random=4',
    nameKey: 'conocenos.testimonials.user3.name',
    roleKey: 'conocenos.testimonials.user3.role',
    commentKey: 'conocenos.testimonials.user3.comment',
  },
  {
    image: 'https://picsum.photos/150?random=5',
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
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="max-w-7xl mx-auto"
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
    </div>
  );
}

export default TestimonialSlider;