import { useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { setUser, logout } from './store/slices/authSlice';
import { setTheme } from './store/slices/themeSlice';
import api from './services/api';
import AppRoutes from './routes/AppRoutes';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

function App() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.theme);

  useEffect(() => {
    const validateToken = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          console.log('Validando token...');
          const response = await api.get('/users/profile');
          dispatch(setUser(response.data));
        } catch (error) {
          console.error('Error al validar token:', error);
          dispatch(logout());
        }
      }
    };
    validateToken();

    const savedTheme = localStorage.getItem('theme') || 'light';
    dispatch(setTheme(savedTheme));
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<div className="text-center text-gray-700 dark:text-dark-text-secondary">Loading translations...</div>}>
        <AppRoutes />
      </Suspense>
    </I18nextProvider>
  );
}

export default App;