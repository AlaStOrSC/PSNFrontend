import { useTranslation } from 'react-i18next';
import { StarIcon } from '@heroicons/react/20/solid';

function ProductCard({ product, onPurchase, onCardClick }) {
  const { t } = useTranslation();

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} className="w-5 h-5 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <StarIcon className="w-5 h-5 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <StarIcon key={`empty-${i}`} className="w-5 h-5 text-gray-300 dark:text-gray-600" />
        ))}
        <span className="ml-1 text-sm text-primaryText dark:text-neutral">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div
      className="bg-white dark:bg-dark-bg-secondary shadow-md dark:shadow-dark-shadow rounded-lg p-4 cursor-pointer transform transition-all duration-300 animate-fadeIn"
      onClick={onCardClick}
    >
      <h3 className="text-lg font-semibold text-primaryText dark:text-neutral">{product.name}</h3>
      <div className="relative w-full h-48 mt-2 bg-white dark:bg-dark-bg-secondary rounded-lg overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
      <p className="text-xl font-bold mt-2 text-primaryText dark:text-neutral">€{product.price.toFixed(2)}</p>
      <p className="text-sm text-primaryText dark:text-neutral mt-2">
        {t('product_card.seller')}: {product.seller.username}
      </p>
      <div className="group relative mt-2">
        {renderStars(product.seller.averageRating || 0)}
        <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral text-xs rounded py-1 px-2">
          {product.seller.averageRating?.toFixed(1) || 0}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPurchase();
        }}
        className="bg-green-600 text-neutral dark:bg-green-600 dark:text-neutral px-4 py-2 rounded-lg mt-4 w-full hover:bg-green-700 dark:hover:bg-green-700 transition-colors"
      >
        {t('product_card.purchase')}
      </button>
    </div>
  );
}

export default ProductCard;