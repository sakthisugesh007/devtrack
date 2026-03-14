const Card = ({ children, className = "", hover = false }) => {
  return (
    <div
      className={`glass rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ${hover ? 'hover:bg-white/[0.04] hover:border-white/10 hover:shadow-xl hover:-translate-y-1' : ''
        } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
