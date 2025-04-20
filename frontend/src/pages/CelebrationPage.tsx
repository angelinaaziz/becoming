import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import Avatar, { AvatarStage } from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DotIndicator from '../components/ui/DotIndicator';
import { FaTrophy } from 'react-icons/fa';

const CelebrationPage = () => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Set window dimensions for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    // Automatically stop confetti after some time
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 relative overflow-hidden">
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.15}
          colors={['#647eff', '#22c55e', '#8ba6ff', '#4ade80', '#f5f9ff', '#dcfce7']}
        />
      )}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 150, damping: 15 }}
        className="max-w-xl w-full mx-auto text-center z-10"
      >
        <Card className="mb-6 relative py-8">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-secondary-600 rounded-full p-3 shadow-lg">
            <FaTrophy className="text-2xl text-white" />
          </div>
          
          <h1 className="text-3xl font-bold mb-6 mt-4 bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
            Milestone Complete!
          </h1>
          
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.1, 1] }}
              transition={{ duration: 0.8, times: [0, 0.5, 1] }}
            >
              <Avatar stage={AvatarStage.VIVID} size="lg" className="celebrate" />
            </motion.div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">You achieved a new milestone!</h2>
            <p className="text-gray-300 text-lg">
              Started meditating daily
            </p>
            <p className="text-gray-400 mt-4">
              Your avatar has evolved to reflect your growth. Keep going!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary">
              View Milestone
            </Button>
            <Button>
              Continue Journey
            </Button>
          </div>
        </Card>
        
        {/* Additional milestones card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gray-800 bg-opacity-80 py-6">
            <h3 className="text-xl font-semibold mb-4">Journey Progress</h3>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2 max-w-md mx-auto">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2.5 rounded-full" 
                style={{ width: '75%' }}
              ></div>
            </div>
            
            {/* Add dot indicator for visual progress representation */}
            <div className="mb-4 max-w-md mx-auto">
              <DotIndicator 
                count={4} 
                activeIndex={3} // Assuming this is the VIVID stage (AvatarStage.VIVID)
                variant="primary"
                size="sm"
              />
              <div className="flex justify-between mt-1 px-1 text-xs text-gray-500">
                <span>Start</span>
                <span>Color</span>
                <span>Vivid</span>
                <span>Halo</span>
              </div>
            </div>
            
            <p className="text-gray-400">
              You're 75% of the way to your final evolution!
            </p>
            <p className="text-gray-400 mt-2">
              <span className="text-primary-400 font-semibold">1 more milestone</span> until your avatar receives its halo!
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CelebrationPage; 