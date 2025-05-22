import { useState, useEffect } from 'react';
import api from '../services/api';

function NewsCards() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get('/news');
        setArticles(response.data.slice(0, 4));
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener noticias:', err);
        setError(err.response?.data?.message || 'Error al cargar las noticias');
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-700 dark:text-dark-text-secondary">Cargando noticias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-red-500 dark:text-dark-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-neutral dark:bg-dark-bg">
      <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-dark-text-accent text-center mb-8">
        Mantente al día con los últimos acontecimientos!
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.map((article, index) => (
          <div
            key={index}
            className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg dark:shadow-dark-shadow overflow-hidden hover:shadow-xl dark:hover:shadow-dark-shadow transition-shadow duration-300"
          >
            <img
              src={article.urlToImage || 'https://via.placeholder.com/400x200?text=Sin+Imagen'}
              alt={article.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4 line-clamp-3">
                {article.description || 'Sin descripción disponible'}
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-primary dark:text-dark-text-accent font-medium hover:text-secondary dark:hover:text-dark-secondary transition-colors"
              >
                Leer más
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewsCards;