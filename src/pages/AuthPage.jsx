import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login, registerUser } from '../services/authService';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  phone: z.string().regex(/^\+?\d{9,15}$/, 'Teléfono inválido'),
  city: z.string().min(2, 'Ciudad requerida'),
});

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const onSubmit = async (data) => {
    try {
      console.log(`Enviando datos de ${isLogin ? 'login' : 'registro'}:`, data);
      const response = isLogin
        ? await login(data)
        : await registerUser(data);
      console.log('Respuesta del backend:', response);
      dispatch(loginSuccess({ user: response.user || null, token: response.token }));
      console.log('Token almacenado en cookies');
      setServerError(null);
      reset();
      navigate('/');
    } catch (err) {
      console.error(`Error en ${isLogin ? 'login' : 'registro'}:`, err);
      console.log('Detalles del error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        request: err.request
      });
      if (err.response) {
        setServerError(err.response.data.message || `Error en ${isLogin ? 'login' : 'registro'}. Inténtalo de nuevo.`);
      } else if (err.request) {
        setServerError('No se pudo conectar con el servidor. Revisa tu conexión o la configuración del backend.');
      } else {
        setServerError('Error inesperado: ' + err.message);
      }
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setServerError(null);
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary mb-8 text-center">
          Padel Social
        </h1>
        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 font-medium ${isLogin ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'} rounded-l-lg`}
            onClick={() => setIsLogin(true)}
          >
            Iniciar Sesión
          </button>
          <button
            className={`px-4 py-2 font-medium ${!isLogin ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'} rounded-r-lg`}
            onClick={() => setIsLogin(false)}
          >
            Registrarse
          </button>
        </div>
        {serverError && (
          <p className="text-red-500 mb-4 text-center text-sm">{serverError}</p>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          {!isLogin && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de usuario
              </label>
              <input
                type="text"
                {...register('username')}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>
          )}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          {!isLogin && (
            <>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  {...register('city')}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                )}
              </div>
            </>
          )}
          <button
            type="submit"
            className="w-full bg-primary text-white p-3 rounded-lg hover:bg-secondary transition-colors font-medium"
          >
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;