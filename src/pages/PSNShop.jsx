import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Modal from '../components/Modal';
import { useSelector } from 'react-redux';

function PSNShop() {
  const { user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(window.innerWidth < 640 ? 5 : 10);
  const [showSellForm, setShowSellForm] = useState(false);
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [filters, setFilters] = useState({
    minRating: '',
    minPrice: '',
    maxPrice: '',
    category: '',
    sellerUsername: '',
  });
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

  useEffect(() => {
    const handleResize = () => {
      setLimit(window.innerWidth < 640 ? 5 : 10);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const queryParams = new URLSearchParams({
          page,
          limit,
          ...(filters.minRating && { minRating: filters.minRating }),
          ...(filters.minPrice && { minPrice: filters.minPrice }),
          ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
          ...(filters.category && { category: filters.category }),
          ...(filters.sellerUsername && { sellerUsername: filters.sellerUsername }),
        }).toString();
        const response = await api.get(`/products?${queryParams}`);
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    };
    fetchProducts();
  }, [page, limit, filters]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setShowFilterForm(false);
  };

  const handleClearFilters = () => {
    setFilters({
      minRating: '',
      minPrice: '',
      maxPrice: '',
      category: '',
      sellerUsername: '',
    });
    setPage(1);
    setShowFilterForm(false);
  };

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('price', formData.price);
      form.append('description', formData.description);
      form.append('category', formData.category);
      form.append('image', formData.image);

      const response = await api.post('/products', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setModalMessage('¡Enhorabuena! Tu producto ha sido puesto a la venta.');
      setShowModal(true);
      setShowSellForm(false);
      setFormData({ name: '', price: '', description: '', category: '', image: null });

      const updatedResponse = await api.get(`/products?page=${page}&limit=${limit}`);
      setProducts(updatedResponse.data.products);
      setTotalPages(updatedResponse.data.totalPages);
    } catch (error) {
      console.error('Error al crear producto:', error);
      setModalMessage('Error al crear el producto. Inténtalo de nuevo.');
      setShowModal(true);
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    try {
      const { name, lastName, phone, city, address, creditCard, productId } = purchaseData;
      if (!name || !lastName || !phone || !city || !address || !creditCard) {
        setModalMessage('Por favor, completa todos los campos del formulario de pago.');
        setShowModal(true);
        return;
      }

      await api.post(`/products/purchase/${productId}`);

      setModalMessage('¡Enhorabuena! Compra realizada con éxito.');
      setShowModal(true);
      setShowPurchaseForm(false);

      setRatingData({ ...ratingData, productId });
      setShowRatingForm(true);
    } catch (error) {
      console.error('Error al procesar la compra:', error);
      setModalMessage('Error al procesar la compra. Inténtalo de nuevo.');
      setShowModal(true);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      if (ratingData.rating < 1 || ratingData.rating > 5) {
        setModalMessage('La valoración debe estar entre 1 y 5 estrellas.');
        setShowModal(true);
        return;
      }

      await api.post(`/products/rate/${ratingData.productId}`, {
        rating: ratingData.rating,
        comment: ratingData.comment,
      });

      setModalMessage('¡Gracias por tu valoración!');
      setShowModal(true);
      setShowRatingForm(false);
      setRatingData({ productId: '', rating: 0, comment: '' });

      const updatedResponse = await api.get(`/products?page=${page}&limit=${limit}`);
      setProducts(updatedResponse.data.products);
      setTotalPages(updatedResponse.data.totalPages);
    } catch (error) {
      console.error('Error al enviar la valoración:', error);
      setModalMessage('Error al enviar la valoración. Inténtalo de nuevo.');
      setShowModal(true);
    }
  };

  const openPurchaseForm = (productId) => {
    setPurchaseData({ ...purchaseData, productId });
    setShowPurchaseForm(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Tienda PSN</h1>

      <div className="flex justify-between mb-4">
        {user && (
          <button
            onClick={() => setShowSellForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
          >
            Vender
          </button>
        )}
        <button
          onClick={() => setShowFilterForm(true)}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Filtrar
        </button>
      </div>

      {showFilterForm && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-4">Filtros</h2>
          <form onSubmit={handleFilterSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Valoración mínima (1-5)</label>
              <input
                type="number"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="w-full p-2 border rounded-lg"
                min="1"
                max="5"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Precio mínimo (€)</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full p-2 border rounded-lg"
                min="0"
                step="0.01"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Precio máximo (€)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full p-2 border rounded-lg"
                min="0"
                step="0.01"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Todas las categorías</option>
                <option value="Palas">Palas</option>
                <option value="Bolas">Bolas</option>
                <option value="Ropa">Ropa</option>
                <option value="Calzado">Calzado</option>
                <option value="Accesorios">Accesorios</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Vendedor (nombre de usuario)</label>
              <input
                type="text"
                value={filters.sellerUsername}
                onChange={(e) => setFilters({ ...filters, sellerUsername: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
            >
              Aplicar filtros
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Limpiar filtros
            </button>
            <button
              type="button"
              onClick={() => setShowFilterForm(false)}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {showSellForm && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-4">Vender un producto</h2>
          <form onSubmit={handleSellSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nombre del producto</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Imagen del producto</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Precio (€)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-2 border rounded-lg"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded-lg"
                maxLength="100"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Selecciona una categoría</option>
                <option value="Palas">Palas</option>
                <option value="Bolas">Bolas</option>
                <option value="Ropa">Ropa</option>
                <option value="Calzado">Calzado</option>
                <option value="Accesorios">Accesorios</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
            >
              Enviar
            </button>
            <button
              type="button"
              onClick={() => setShowSellForm(false)}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
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
          />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="bg-primary text-white px-4 py-2 rounded-lg mr-2 disabled:bg-gray-400"
        >
          Anterior
        </button>
        <span className="self-center">Página {page} de {totalPages}</span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="bg-primary text-white px-4 py-2 rounded-lg ml-2 disabled:bg-gray-400"
        >
          Siguiente
        </button>
      </div>

      {showPurchaseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Formulario de pago</h2>
            <form onSubmit={handlePurchaseSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={purchaseData.name}
                  onChange={(e) => setPurchaseData({ ...purchaseData, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Apellidos</label>
                <input
                  type="text"
                  value={purchaseData.lastName}
                  onChange={(e) => setPurchaseData({ ...purchaseData, lastName: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={purchaseData.phone}
                  onChange={(e) => setPurchaseData({ ...purchaseData, phone: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Ciudad</label>
                <input
                  type="text"
                  value={purchaseData.city}
                  onChange={(e) => setPurchaseData({ ...purchaseData, city: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input
                  type="text"
                  value={purchaseData.address}
                  onChange={(e) => setPurchaseData({ ...purchaseData, address: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tarjeta de crédito</label>
                <input
                  type="text"
                  value={purchaseData.creditCard}
                  onChange={(e) => setPurchaseData({ ...purchaseData, creditCard: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
              >
                Pagar
              </button>
              <button
                type="button"
                onClick={() => setShowPurchaseForm(false)}
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {showRatingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Valora el producto</h2>
            <form onSubmit={handleRatingSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Valoración (1-5 estrellas)</label>
                <input
                  type="number"
                  value={ratingData.rating}
                  onChange={(e) => setRatingData({ ...ratingData, rating: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  min="1"
                  max="5"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Comentario (opcional, máximo 100 caracteres)</label>
                <textarea
                  value={ratingData.comment}
                  onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  maxLength="100"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
              >
                Enviar valoración
              </button>
              <button
                type="button"
                onClick={() => setShowRatingForm(false)}
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <Modal message={modalMessage} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default PSNShop;