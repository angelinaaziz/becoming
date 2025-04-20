import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContract } from '../hooks/useContract';
import { FaRocket, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from './ui/AnimatedButton';

/**
 * A specialized button for minting NFTs with loading and success states
 */
const MintButton = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [particles, setParticles] = useState<number[]>([]);
  
  const navigate = useNavigate();
  const { mintNFT } = useContract();
  
  // Generate celebration particles on success
  useEffect(() => {
    if (isSuccess) {
      const particleCount = 12;
      const newParticles = Array.from({ length: particleCount }, (_, i) => i);
      setParticles(newParticles);
      
      // Navigate to the celebration page after a delay
      const timer = setTimeout(() => {
        navigate('/celebration');
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);
  
  const handleMint = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const success = await mintNFT();
      
      if (success) {
        setIsSuccess(true);
      } else {
        throw new Error("Minting failed");
      }
    } catch (err: any) {
      console.error('Mint error:', err);
      setError(err.message || 'Failed to mint NFT');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="relative">
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-lg text-sm text-white">
          <div className="font-medium mb-1">Error</div>
          <div className="text-red-200">{error}</div>
        </div>
      )}
      
      {/* Success particles */}
      <AnimatePresence>
        {isSuccess && particles.map((i) => {
          const angle = (i / particles.length) * Math.PI * 2;
          return (
            <motion.div 
              key={i}
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0 
              }}
              animate={{ 
                x: Math.cos(angle) * 60, 
                y: Math.sin(angle) * 60,
                scale: Math.random() * 0.6 + 0.4
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut" 
              }}
              className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-primary-400 to-purple-400"
              style={{
                boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)'
              }}
            />
          );
        })}
      </AnimatePresence>
      
      <AnimatedButton
        onClick={handleMint}
        fullWidth
        variant="gradient"
        size="lg"
        disabled={isSubmitting || isSuccess}
        loading={isSubmitting}
        icon={isSuccess ? <FaCheckCircle /> : <FaRocket />}
        glow={true}
        className={isSuccess ? 'bg-green-600 hover:bg-green-500' : ''}
      >
        {isSuccess ? "Successfully Minted!" : "Mint Your NFT"}
      </AnimatedButton>
    </div>
  );
};

export default MintButton; 