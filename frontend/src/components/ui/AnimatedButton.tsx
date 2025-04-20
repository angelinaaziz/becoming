import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  glow?: boolean;
  hoverScale?: number;
}

/**
 * An animated button component with pleasing visual effects
 */
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  icon,
  fullWidth = false,
  loading = false,
  glow = true,
  hoverScale = 1.02
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  // Base styles based on variant
  let baseClasses = 'relative overflow-hidden rounded-lg font-medium transition-all';
  
  // Add size classes
  if (size === 'sm') baseClasses += ' text-sm py-1.5 px-3';
  else if (size === 'lg') baseClasses += ' text-lg py-3 px-6';
  else baseClasses += ' text-base py-2 px-4';
  
  // Add full width class if specified
  if (fullWidth) baseClasses += ' w-full';
  
  // Add disabled styles
  if (disabled) baseClasses += ' opacity-60 cursor-not-allowed';
  
  // Add variant-specific styles
  if (variant === 'primary') {
    baseClasses += ` bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white 
                    ${glow ? 'shadow-lg shadow-primary-600/20' : ''}`;
  } else if (variant === 'secondary') {
    baseClasses += ` bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white 
                    border border-gray-700`;
  } else if (variant === 'outline') {
    baseClasses += ` bg-transparent border border-gray-700 text-gray-300 
                    hover:text-white hover:border-primary-500 active:bg-gray-800/50`;
  } else if (variant === 'gradient') {
    baseClasses += ` bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 
                    hover:to-purple-500 active:from-primary-700 active:to-purple-700 text-white 
                    ${glow ? 'shadow-lg shadow-primary-600/20' : ''}`;
  }
  
  // Add custom classes
  baseClasses += ` ${className}`;
  
  // Button animations
  const buttonVariants = {
    idle: { 
      scale: 1,
      boxShadow: glow ? '0 10px 25px -5px rgba(124, 58, 237, 0.2)' : 'none'
    },
    hover: { 
      scale: disabled ? 1 : hoverScale,
      boxShadow: glow && !disabled ? '0 15px 25px -5px rgba(124, 58, 237, 0.4)' : 'none'
    },
    tap: { 
      scale: disabled ? 1 : 0.98
    }
  };
  
  // Ripple animation for click effect
  const rippleVariants = {
    initial: {
      scale: 0,
      opacity: 0.5,
    },
    animate: {
      scale: 3,
      opacity: 0,
      transition: { duration: 0.8 }
    }
  };
  
  // Gradient animation
  const gradientVariants = {
    idle: {
      backgroundPosition: '0% 50%',
    },
    hover: {
      backgroundPosition: '100% 50%',
      transition: { duration: 1.5, repeat: Infinity, repeatType: 'reverse' }
    }
  };
  
  // Loading spinner animation
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: "linear",
        repeat: Infinity
      }
    }
  };
  
  // Handler for button click to show ripple effect
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // Create ripple effect
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 600);
    
    // Execute onClick callback if provided
    if (onClick) onClick();
  };
  
  return (
    <motion.button
      type={type}
      onClick={handleButtonClick}
      className={baseClasses}
      disabled={disabled || loading}
      initial="idle"
      whileHover={disabled ? "idle" : "hover"}
      whileTap={disabled ? "idle" : "tap"}
      variants={buttonVariants}
      transition={{ duration: 0.2 }}
    >
      {/* Animated gradient background for gradient variant */}
      {variant === 'gradient' && !disabled && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary-600 via-purple-500 to-primary-600 bg-[length:200%_100%]"
          variants={gradientVariants}
          initial="idle"
          animate={disabled ? "idle" : "hover"}
        />
      )}
      
      {/* Loading spinner */}
      {loading ? (
        <div className="flex items-center justify-center">
          <motion.div 
            className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
            variants={spinnerVariants}
            animate="animate"
          />
          <span className="ml-2">{children}</span>
        </div>
      ) : (
        <div className="relative flex items-center justify-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </div>
      )}
      
      {/* Click ripple effect */}
      {isPressed && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-full bg-white/30 pointer-events-none"
          initial="initial"
          animate="animate"
          variants={rippleVariants}
          style={{ 
            left: '50%', 
            top: '50%', 
            translateX: '-50%', 
            translateY: '-50%' 
          }}
        />
      )}
      
      {/* Bottom highlight for primary and gradient variants */}
      {(variant === 'primary' || variant === 'gradient') && !disabled && (
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-0.5 bg-white/30"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
};

export default AnimatedButton; 