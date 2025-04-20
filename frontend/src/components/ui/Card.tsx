import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'purple' | 'highlight' | 'achievement' | 'glass';
  hoverEffect?: boolean;
}

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hoverEffect = false
}: CardProps) => {
  const baseClasses = "rounded-xl shadow-lg p-6 transition-all duration-300";
  
  const variantClasses = {
    default: "bg-gray-800/80 border border-gray-700/60 backdrop-blur-sm",
    purple: "bg-gray-800/80 border border-primary-700/60 shadow-[0_0_15px_rgba(151,71,255,0.15)] backdrop-blur-sm",
    highlight: "bg-gray-800/90 border-2 border-primary-500/70 shadow-[0_0_30px_rgba(151,71,255,0.25)] backdrop-blur-md",
    achievement: "bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-primary-500/30 shadow-[0_4px_20px_rgba(151,71,255,0.2)] backdrop-blur-md",
    glass: "bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
  };
  
  const hoverClasses = hoverEffect 
    ? "hover:transform hover:translate-y-[-4px] hover:shadow-[0_10px_40px_rgba(151,71,255,0.3)] cursor-pointer" 
    : "";
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}>
      {variant !== 'default' && variant !== 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-purple-500/3 to-transparent rounded-xl pointer-events-none"></div>
      )}
      
      {/* Top highlight line for achievement cards */}
      {variant === 'achievement' && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-500 via-purple-400 to-primary-600 rounded-t-xl"></div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Bottom glow for highlighted cards */}
      {variant === 'highlight' && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[90%] h-1 bg-primary-500/20 blur-md rounded-full"></div>
      )}
    </div>
  );
};

export default Card; 