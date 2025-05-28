import { useState } from 'react';
import { StarIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';

function ProductCard({ product, onPurchase }) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

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
        <span className="ml-1 text-sm text-gray-600 dark:text-dark-text-secondary">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-dark-bg-secondary shadow-md dark:shadow-dark-shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary">{product.name}</h3>
      <div className="relative w-full h-48 mt-2 bg-white dark:bg-dark-bg-secondary rounded-lg overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
      <p className="text-xl font-bold mt-2 text-gray-900 dark:text-dark-text-primary">€{product.price.toFixed(2)}</p>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-primary text-white dark:bg-dark-primary dark:text-dark-text-primary px-4 py-2 rounded-lg mt-2 hover:bg-secondary dark:hover:bg-dark-secondary transition-colors"
      >
        {showDetails ? t('product_card.hide_details') : t('product_card.show_details')}
      </button>

      {showDetails && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{t('product_card.description')}: {product.description}</p>
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
              {t('product_card.seller')}: {product.seller.username}
            </p>
            <div className="group relative">
              {renderStars(product.seller.averageRating || 0)}
              <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 dark:bg-dark-bg-tertiary text-white dark:text-dark-text-primary text-xs rounded py-1 px-2">
                {product.seller.averageRating?.toFixed(1) || 0}
              </span>
            </div>
          </div>
          <button
            onClick={onPurchase}
            className="bg-green-500 text-white dark:bg-green-600 dark:text-dark-text-primary px-4 py-2 rounded-lg mt-2 hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
          >
            {t('product_card.purchase')}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductCard;