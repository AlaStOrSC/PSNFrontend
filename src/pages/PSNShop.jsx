import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Modal from '../components/Modal';
import LebronImage from '../assets/Lebron.webp';
import TapiaImage from '../assets/Tapia.webp';
import CoelloImage from '../assets/Coello.webp';
import BullpadelImage from '../assets/Bullpadel.webp';
import PackBolasImage from '../assets/PackBolas.webp';

function PSNShop() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(window.innerWidth < 640 ? 5 : 15);
  const [showSellForm, setShowSellForm] = useState(false);
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [filters, setFilters] = useState({
    minRating: '',
    minPrice: '',
    maxPrice: '',
    category: '',
    sellerUsername: '',
    name: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: null,
  });
  const [purchaseData, setPurchaseData] = useState({
    productId: '',
    name: '',
    lastName: '',
    phone: '',
    city: '',
    address: '',
    creditCard: '',
  });
  const [ratingData, setRatingData] = useState({
    productId: '',
    rating: 0,
    comment: '',
  });
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { image: LebronImage, name: 'Lebron', seller: 'PSN' },
    { image: TapiaImage, name: 'Tapia', seller: 'PSN' },
    { image: CoelloImage, name: 'Coello', seller: 'PSN' },
    { image: BullpadelImage, name: 'Bullpadel', seller: 'PSN' },
    { image: PackBolasImage, name: 'Bolas', seller: 'PSN' },
  ];

  useEffect(() => {
    const handleResize = () => {
      setLimit(window.innerWidth < 640 ? 5 : 15);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', page, limit, appliedFilters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      if (appliedFilters.minRating && appliedFilters.minRating >= 1 && appliedFilters.minRating <= 5) {
        queryParams.append('minRating', appliedFilters.minRating);
      }
      if (appliedFilters.minPrice && appliedFilters.minPrice >= 0) {
        queryParams.append('minPrice', appliedFilters.minPrice);
      }
      if (appliedFilters.maxPrice && appliedFilters.maxPrice >= 0) {
        queryParams.append('maxPrice', appliedFilters.maxPrice);
      }
      if (appliedFilters.category) {
        queryParams.append('category', appliedFilters.category);
      }
      if (appliedFilters.sellerUsername) {
        queryParams.append('sellerUsername', appliedFilters.sellerUsername);
      }
      if (appliedFilters.name && appliedFilters.name.trim()) {
        queryParams.append('name', appliedFilters.name.trim());
      }

      const queryString = queryParams.toString();
      console.log('Query URL:', `/products?${queryString}`);
      console.log('Applied Filters:', appliedFilters);

      const response = await api.get(`/products?${queryString}`);
      console.log('API Response:', response.data);
      setTotalPages(response.data.totalPages);
      return response.data.products;
    },
    onError: (error) => {
      console.error('Error al cargar productos:', error);
    },
  });

  const products = productsData || [];

  const sellMutation = useMutation({
    mutationFn: async (form) => {
      const response = await api.post('/products', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      setModalMessage(t('shop.success.sell_product'));
      setShowModal(true);
      setShowSellForm(false);
      setFormData({ name: '', price: '', description: '', category: '', image: null });
      queryClient.invalidateQueries(['products']);
    },
    onError: (error) => {
      console.error('Error al crear producto:', error);
      setModalMessage(t('shop.error.sell_product'));
      setShowModal(true);
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId) => {
      await api.post(`/products/purchase/${productId}`);
    },
    onSuccess: () => {
      setModalMessage(t('shop.success.purchase_product'));
      setShowModal(true);
      setShowPurchaseForm(false);
      setShowRatingForm(true);
      queryClient.invalidateQueries(['products']);
    },
    onError: (error) => {
      console.error('Error al procesar la compra:', error);
      setModalMessage(t('shop.error.purchase_product'));
      setShowModal(true);
    },
  });

  const rateMutation = useMutation({
    mutationFn: async ({ productId, rating, comment }) => {
      await api.post(`/products/rate/${productId}`, { rating, comment });
    },
    onSuccess: () => {
      setModalMessage(t('shop.success.rate_product'));
      setShowModal(true);
      setShowRatingForm(false);
      setRatingData({ productId: '', rating: 0, comment: '' });
      queryClient.invalidateQueries(['products']);
    },
    onError: (error) => {
      console.error('Error al enviar la valoración:', error);
      setModalMessage(t('shop.error.rate_product'));
      setShowModal(true);
    },
  });

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    console.log('Filters submitted:', filters);
    setAppliedFilters({ ...filters });
    setPage(1);
    setShowFilterForm(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      minRating: '',
      minPrice: '',
      maxPrice: '',
      category: '',
      sellerUsername: '',
      name: '',
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setPage(1);
    setShowFilterForm(false);
  };

  const handleSellSubmit = (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', formData.name);
    form.append('price', formData.price);
    form.append('description', formData.description);
    form.append('category', formData.category);
    form.append('image', formData.image);

    sellMutation.mutate(form);
  };

  const handlePurchaseSubmit = (e) => {
    e.preventDefault();
    const { name, lastName, phone, city, address, creditCard, productId } = purchaseData;
    if (!name || !lastName || !phone || !city || !address || !creditCard) {
      setModalMessage(t('shop.error.purchase_form_incomplete'));
      setShowModal(true);
      return;
    }

    purchaseMutation.mutate(productId);
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (ratingData.rating < 1 || ratingData.rating > 5) {
      setModalMessage(t('shop.error.invalid_rating'));
      setShowModal(true);
      return;
    }

    rateMutation.mutate({
      productId: ratingData.productId,
      rating: ratingData.rating,
      comment: ratingData.comment,
    });
  };

  const handleSlideClick = (slide) => {
    const newFilters = {
      minRating: '',
      minPrice: '',
      maxPrice: '',
      category: '',
      sellerUsername: slide.seller,
      name: slide.name,
    };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    setPage(1);
  };

  const openPurchaseForm = (productId) => {
    setPurchaseData({ ...purchaseData, productId });
    setShowPurchaseForm(true);
  };

  const openDescriptionModal = (product) => {
    setSelectedProduct(product);
    setShowDescriptionModal(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 bg-neutral dark:bg-dark-bg text-center">
        <p className="text-lg text-primaryText dark:text-neutral">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 bg-neutral dark:bg-dark-bg text-center">
        <p className="text-lg text-red-500 dark:text-dark-error">{t('shop.error.load_products')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-neutral dark:bg-dark-bg">
      <div className="relative w-full h-[425px] mb-6 rounded-xl overflow-hidden shadow-lg">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${
              currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={() => handleSlideClick(slide)}
          />
        ))}
        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
          }
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/40 text-white p-4 rounded-full hover:bg-black/70 transition-colors z-20"
          aria-label="Previous slide"
        >
          ◀
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/40 text-white p-4 rounded-full hover:bg-black/70 transition-colors z-20"
          aria-label="Next slide"
        >
          ▶
        </button>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/30 p-2 rounded-full z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                currentSlide === index ? 'bg-blue-500' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-4 text-center text-primaryText dark:text-neutral">{t('navbar.tienda')}</h1>

      <div className="flex justify-between mb-4">
        {user && (
          <button
            onClick={() => setShowSellForm((prev) => !prev)}
            className="bg-secondary text-neutral dark:bg-dark-primary dark:text-neutral px-4 py-2 rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
          >
            {t('shop.sell')}
          </button>
        )}
        <button
          onClick={() => setShowFilterForm((prev) => !prev)}
          className="bg-secondary text-neutral dark:bg-gray-600 dark:text-neutral px-4 py-2 rounded-lg hover:bg-buttonsHover dark:hover:bg-gray-700 transition-colors"
        >
          {t('shop.filter')}
        </button>
      </div>

      {showFilterForm && (
        <div className="bg-gray-100 dark:bg-dark-bg-tertiary p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-4 text-primaryText dark:text-neutral">{t('shop.filters_title')}</h2>
          <form onSubmit={handleFilterSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.product_name_label')}</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.min_rating_label')}</label>
              <input
                type="number"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                min="1"
                max="5"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.min_price_label')}</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                min="0"
                step="0.01"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.max_price_label')}</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                min="0"
                step="0.01"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.category_label')}</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
              >
                <option value="">{t('shop.category_all')}</option>
                <option value="Palas">{t('shop.category_palas')}</option>
                <option value="Bolas">{t('shop.category_bolas')}</option>
                <option value="Ropa">{t('shop.category_ropa')}</option>
                <option value="Calzado">{t('shop.category_calzado')}</option>
                <option value="Accesorios">{t('shop.category_accesorios')}</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.seller_label')}</label>
              <input
                type="text"
                value={filters.sellerUsername}
                onChange={(e) => setFilters({ ...filters, sellerUsername: e.target.value })}
                className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
              />
            </div>
            <button
              type="submit"
              className="bg-secondary text-neutral dark:bg-dark-primary dark:text-neutral px-4 py-2 rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
            >
              {t('shop.apply_filters')}
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="ml-2 bg-secondary text-neutral dark:bg-gray-600 dark:text-neutral px-4 py-2 rounded-lg hover:bg-buttonsHover dark:hover:bg-gray-700 transition-colors"
            >
              {t('shop.clear_filters')}
            </button>
            <button
              type="button"
              onClick={() => setShowFilterForm(false)}
              className="ml-2 bg-secondary text-neutral dark:bg-gray-600 dark:text-neutral px-4 py-2 rounded-lg hover:bg-buttonsHover dark:hover:bg-gray-700 transition-colors"
            >
              {t('shop.cancel')}
            </button>
          </form>
        </div>
      )}

      {showSellForm && (
        <div className="bg-gray-100 dark:bg-dark-bg-tertiary p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-4 text-primaryText dark:text-neutral">{t('shop.sell_product_title')}</h2>
          <form onSubmit={handleSellSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.product_name_label')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.product_image_label')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.price_label')}</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.description_label')}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                maxLength="100"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.category_label')}</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                required
              >
                <option value="">{t('shop.category_select')}</option>
                <option value="Palas">{t('shop.category_palas')}</option>
                <option value="Bolas">{t('shop.category_bolas')}</option>
                <option value="Ropa">{t('shop.category_ropa')}</option>
                <option value="Calzado">{t('shop.category_calzado')}</option>
                <option value="Accesorios">{t('shop.category_accesorios')}</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-secondary text-neutral dark:bg-dark-primary dark:text-neutral px-4 py-2 rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
            >
              {t('shop.submit')}
            </button>
            <button
              type="button"
              onClick={() => setShowSellForm(false)}
              className="ml-2 bg-secondary text-neutral dark:bg-gray-600 dark:text-neutral px-4 py-2 rounded-lg hover:bg-buttonsHover dark:hover:bg-gray-700 transition-colors"
            >
              {t('shop.cancel')}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onPurchase={() => openPurchaseForm(product._id)}
            onCardClick={() => openDescriptionModal(product)}
          />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="bg-secondary text-neutral dark:bg-dark-primary dark:text-neutral px-4 py-2 rounded-lg mr-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 hover:bg-buttonsHover dark:hover:bg-dark-secondary"
        >
          {t('shop.previous')}
        </button>
        <span className="self-center text-primaryText dark:text-neutral">Página {page} de {totalPages}</span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="bg-secondary text-neutral dark:bg-dark-primary dark:text-neutral px-4 py-2 rounded-lg ml-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 hover:bg-buttonsHover dark:hover:bg-dark-secondary"
        >
          {t('shop.next')}
        </button>
      </div>

      {showPurchaseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center">
          <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-primaryText dark:text-neutral">{t('shop.payment_form_title')}</h2>
            <form onSubmit={handlePurchaseSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.payment_first_name_label')}</label>
                <input
                  type="text"
                  value={purchaseData.name}
                  onChange={(e) => setPurchaseData({ ...purchaseData, name: e.target.value })}
                  className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.payment_last_name_label')}</label>
                <input
                  type="text"
                  value={purchaseData.lastName}
                  onChange={(e) => setPurchaseData({ ...purchaseData, lastName: e.target.value })}
                  className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.payment_phone_label')}</label>
                <input
                  type="tel"
                  value={purchaseData.phone}
                  onChange={(e) => setPurchaseData({ ...purchaseData, phone: e.target.value })}
                  className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.payment_city_label')}</label>
                <input
                  type="text"
                  value={purchaseData.city}
                  onChange={(e) => setPurchaseData({ ...purchaseData, city: e.target.value })}
                  className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.payment_address_label')}</label>
                <input
                  type="text"
                  value={purchaseData.address}
                  onChange={(e) => setPurchaseData({ ...purchaseData, address: e.target.value })}
                  className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.payment_credit_card_label')}</label>
                <input
                  type="text"
                  value={purchaseData.creditCard}
                  onChange={(e) => setPurchaseData({ ...purchaseData, creditCard: e.target.value })}
                  className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-secondary text-neutral dark:bg-dark-primary dark:text-neutral px-4 py-2 rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
              >
                {t('shop.pay')}
              </button>
              <button
                type="button"
                onClick={() => setShowPurchaseForm(false)}
                className="ml-2 bg-secondary text-neutral dark:bg-gray-600 dark:text-neutral px-4 py-2 rounded-lg hover:bg-buttonsHover dark:hover:bg-gray-700 transition-colors"
              >
                {t('shop.cancel')}
              </button>
            </form>
          </div>
        </div>
      )}

      {showRatingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center">
          <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-primaryText dark:text-neutral">{t('shop.rate_product_title')}</h2>
            <form onSubmit={handleRatingSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.rating_label')}</label>
                <input
                  type="number"
                  value={ratingData.rating}
                  onChange={(e) => setRatingData({ ...ratingData, rating: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                  min="1"
                  max="5"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-primaryText dark:text-neutral">{t('shop.comment_label')}</label>
                <textarea
                  value={ratingData.comment}
                  onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                  className="w-full p-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-primaryText dark:text-neutral focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-secondary"
                  maxLength="100"
                />
              </div>
              <button
                type="submit"
                className="bg-secondary text-neutral dark:bg-dark-primary dark:text-neutral px-4 py-2 rounded-lg hover:bg-buttonsHover dark:hover:bg-dark-secondary transition-colors"
              >
                {t('shop.submit_rating')}
              </button>
              <button
                type="button"
                onClick={() => setShowRatingForm(false)}
                className="ml-2 bg-secondary text-neutral dark:bg-gray-600 dark:text-neutral px-4 py-2 rounded-lg hover:bg-buttonsHover dark:hover:bg-gray-700 transition-colors"
              >
                {t('shop.cancel')}
              </button>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <Modal message={modalMessage} onClose={() => setShowModal(false)} isOpen={showModal} />
      )}

      {showDescriptionModal && selectedProduct && (
        <Modal
          isOpen={showDescriptionModal}
          title={selectedProduct.name}
          message={selectedProduct.description}
          onClose={() => setShowDescriptionModal(false)}
        />
      )}
    </div>
  );
}

export default PSNShop;