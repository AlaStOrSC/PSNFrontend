import bannerImage from '../assets/b4.jpg';

function Banner() {
  return (
    <div
      className="relative bg-cover bg-center h-96 flex items-center justify-center bg-fixed"
      style={{ backgroundImage: `url(${bannerImage})` }}
    >
      <div className="absolute inset-0 bg-primary opacity-50"></div> {}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          Encuentra con quien jugar al padel y compite para subir en el ranking
        </h1>
        <h2 className="text-xl md:text-2xl font-medium drop-shadow-lg">
          Juega en pistas de todo el mundo y encuentra jugadores de tu nivel
        </h2>
      </div>
    </div>
  );
}

export default Banner;