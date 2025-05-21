import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { setUser, logout } from './store/slices/authSlice';
import api from './services/api';
import AppRoutes from './routes/AppRoutes';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const validateToken = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const response = await api.get('/users/profile');
          dispatch(setUser(response.data));
        } catch (error) {
          console.error('Error al validar token:', error);
          dispatch(logout());
        }
      }
    };

    validateToken();
    return () => console.log('Limpiando useEffect de App.jsx');
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;