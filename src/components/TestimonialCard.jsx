function TestimonialCard({ image, name, role, comment }) {
  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg dark:shadow-dark-shadow p-6 flex flex-col items-center text-center mx-4 min-h-[320px]">
      <img
        src={image}
        alt={name}
        className="w-24 h-24 rounded-full object-cover mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-2">
        {name}
        <br />
        {role}
      </h3>
      <p className="text-gray-600 dark:text-dark-text-secondary flex-1 overflow-hidden text-ellipsis">
        {comment}
      </p>
    </div>
  );
}

export default TestimonialCard;