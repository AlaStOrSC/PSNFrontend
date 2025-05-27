const Spinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div
        className="w-12 h-12 border-4 border-t-primary dark:border-t-dark-primary border-gray-200 dark:border-dark-bg-tertiary rounded-full animate-spin"
      ></div>
      <p className="mt-4 text-lg text-gray-700 dark:text-dark-text-secondary">
        Cargando...
      </p>
    </div>
  );
};

export default Spinner;