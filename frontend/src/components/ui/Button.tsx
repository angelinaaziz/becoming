import React, { ButtonHTMLAttributes, ReactNode, isValidElement } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'gradient' | 'neon' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  iconPosition?: 'left' | 'right';
}

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  iconPosition = 'left',
  className = '',
  ...props 
}: ButtonProps) => {
  
  const baseClass = 'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-lg focus:outline-none relative overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg hover:shadow-primary-900/20 border border-primary-500',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white shadow-md hover:shadow-lg hover:shadow-secondary-900/20 border border-secondary-500',
    tertiary: 'bg-gray-800 hover:bg-gray-700 text-white shadow-md hover:shadow-lg hover:shadow-gray-900/20 border border-gray-700',
    outline: 'bg-transparent hover:bg-primary-900/10 text-primary-400 hover:text-primary-300 border border-primary-500/50 hover:border-primary-400',
    gradient: 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:shadow-primary-900/20 border border-primary-500/0',
    neon: 'bg-gray-900 hover:bg-gray-800 text-primary-300 shadow-[0_0_10px_rgba(151,71,255,0.3)] hover:shadow-[0_0_15px_rgba(151,71,255,0.5)] border border-primary-500/30 hover:border-primary-500/70',
    glass: 'bg-white/10 hover:bg-white/15 backdrop-blur-md text-white shadow-lg border border-white/10 hover:border-white/20'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Special effects for certain variants
  const effects = {
    primary: '',
    secondary: '',
    tertiary: '',
    outline: 'hover:scale-[1.02]',
    gradient: 'hover:scale-[1.02]',
    neon: 'hover:scale-[1.02]',
    glass: 'hover:scale-[1.02]'
  };
  
  // Simplified content rendering
  let content;
  if (typeof children === 'object' && isValidElement(children) && !children.props.children) {
    // If it's just a single icon with no children
    content = children;
  } else {
    content = children;
  }
  
  return (
    <button
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${effects[variant]} ${className}`}
      {...props}
    >
      {content}
      
      {/* Subtle bottom line for neon buttons */}
      {variant === 'neon' && (
        <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-500/70 to-transparent"></span>
      )}
      
      {/* Hover overlay */}
      {(variant === 'gradient' || variant === 'primary') && (
        <span className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors duration-300"></span>
      )}
    </button>
  );
};

export default Button; 