function ValueCard({ image, title, description }) {
  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg dark:shadow-dark-shadow p-6 flex flex-col items-center text-center">
      <img
        src={image}
        alt={title}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />
      <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-dark-text-secondary">{description}</p>
    </div>
  );
}

export default ValueCard;