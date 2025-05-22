function ProfileCard({ children, className }) {
  return (
    <div className={`bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg dark:shadow-dark-shadow p-6 mb-6 flex flex-col h-full ${className || ''}`}>
      {children}
    </div>
  );
}

export default ProfileCard;