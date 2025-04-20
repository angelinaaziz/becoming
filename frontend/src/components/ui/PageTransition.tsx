import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
  transition?: 'fade' | 'slide' | 'scale' | 'none';
}

const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, x: 15 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -15 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 }
  },
  none: {
    initial: {},
    animate: {},
    exit: {}
  }
};

/**
 * A component that provides smooth transitions when navigating between pages
 */
const PageTransition = ({ children, transition = 'fade' }: PageTransitionProps) => {
  const location = useLocation();
  
  // Scroll to top on page transition
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  const variant = transitionVariants[transition];
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={variant.initial}
        animate={variant.animate}
        exit={variant.exit}
        transition={{ 
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1.0] // Smooth cubic bezier curve
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition; 