import { useSelector } from 'react-redux';
import Banner from '../components/Banner';
import NewsCards from '../components/NewsCards';

function Home() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-neutral flex flex-col">
      <Banner />
      <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Bienvenido a PSN
        </h1>
        {isAuthenticated && user ? (
          <p className="text-lg text-gray-700 mb-6">
            Hola, {user.username}! Estás listo para organizar partidos, conectar con amigos y mejorar tu ranking.
          </p>
        ) : (
          <p className="text-lg text-gray-700 mb-6">
            Únete a la comunidad de pádel, crea partidos y compite con otros jugadores.
          </p>
        )}
        <div className="space-x-4 mb-12">
          {!isAuthenticated && (
            <>
              <a
                href="/auth"
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary transition-colors"
              >
                Iniciar Sesión
              </a>
              <a
                href="/auth"
                className="inline-block bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-500 transition-colors"
              >
                Registrarse
              </a>
            </>
          )}
        </div>
        <NewsCards />
      </div>
    </div>
  );
}

export default Home;