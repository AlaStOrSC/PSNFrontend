function BannerM({ image, title }) {
  return (
    <div
      className="relative bg-cover bg-center h-96 flex items-center justify-center bg-fixed"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="absolute inset-0 bg-primary dark:bg-dark-bg-secondary opacity-50"></div>
      <div className="relative z-10 text-center text-white dark:text-dark-text-primary px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">{title}</h1>
      </div>
    </div>
  );
}

export default BannerM;