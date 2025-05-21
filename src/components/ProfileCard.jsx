function ProfileCard({ children, className }) {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 mb-6 flex flex-col h-full ${className || ''}`}>
      {children}
    </div>
  );
}

export default ProfileCard;