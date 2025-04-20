import React from 'react';

interface DotIndicatorProps {
  count: number;
  activeIndex: number;
  onDotClick?: (index: number) => void;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DotIndicator: React.FC<DotIndicatorProps> = ({
  count,
  activeIndex,
  onDotClick,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseClasses = "flex items-center justify-center space-x-2";
  
  const sizeClasses = {
    sm: {
      container: "space-x-1.5",
      dot: "w-2 h-2",
      activeDot: "w-2.5 h-2.5",
    },
    md: {
      container: "space-x-2",
      dot: "w-2.5 h-2.5",
      activeDot: "w-3 h-3",
    },
    lg: {
      container: "space-x-3",
      dot: "w-3 h-3",
      activeDot: "w-4 h-4",
    },
  };
  
  const variantClasses = {
    default: {
      dot: "bg-gray-600 hover:bg-gray-500",
      activeDot: "bg-white",
    },
    primary: {
      dot: "bg-primary-800 hover:bg-primary-700",
      activeDot: "bg-primary-500",
    },
    secondary: {
      dot: "bg-secondary-800 hover:bg-secondary-700",
      activeDot: "bg-secondary-500",
    },
  };

  return (
    <div className={`${baseClasses} ${sizeClasses[size].container} ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onDotClick && onDotClick(index)}
          className={`
            rounded-full transition-all duration-300 
            ${index === activeIndex 
              ? `${sizeClasses[size].activeDot} ${variantClasses[variant].activeDot} shadow-lg transform scale-110` 
              : `${sizeClasses[size].dot} ${variantClasses[variant].dot}`
            }
            ${onDotClick ? 'cursor-pointer hover:scale-125' : 'cursor-default'}
          `}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default DotIndicator; 