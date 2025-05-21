import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/20/solid';

function ProductCard({ product, onPurchase }) {
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
          <StarIcon key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
        ))}
        <span className="ml-1 text-sm">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded-lg mt-2"
      />
      <p className="text-xl font-bold mt-2">€{product.price.toFixed(2)}</p>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-primary text-white px-4 py-2 rounded-lg mt-2 hover:bg-secondary transition-colors"
      >
        {showDetails ? 'Ocultar detalle' : 'Ver detalle'}
      </button>

      {showDetails && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Descripción: {product.description}</p>
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Vendedor: {product.seller.username}
            </p>
            <div className="group relative">
              {renderStars(product.seller.averageRating || 0)}
              <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                {product.seller.averageRating?.toFixed(1) || 0}
              </span>
            </div>
          </div>
          <button
            onClick={onPurchase}
            className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-green-600 transition-colors"
          >
            Comprar
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductCard;