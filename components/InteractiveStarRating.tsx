import React from 'react';

interface InteractiveStarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  className?: string;
}

const InteractiveStarRating: React.FC<InteractiveStarRatingProps> = ({ rating, onRatingChange, className = '' }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const stars = [];

  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= (hoverRating || rating);
    const starColor = isFilled ? 'text-amber-400' : 'text-slate-600';
    
    stars.push(
      <button
        key={i}
        type="button"
        className={`focus:outline-none transition-transform duration-150 transform hover:scale-125 ${className}`}
        onMouseEnter={() => setHoverRating(i)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => onRatingChange(i)}
        aria-label={`Rate ${i} stars`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-8 h-8 ${starColor}`}>
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
        </svg>
      </button>
    );
  }

  return <div className="flex items-center space-x-2">{stars}</div>;
};

export default InteractiveStarRating;
