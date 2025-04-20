import React, { useState } from 'react';
import Avatar, { AvatarStage } from './Avatar';
import DotIndicator from './DotIndicator';
import { motion, AnimatePresence } from 'framer-motion';

interface EvolutionPathProps {
  currentStage: AvatarStage;
  className?: string;
  onStageSelect?: (stage: AvatarStage) => void;
}

interface StageInfo {
  name: string;
  description: string;
  milestones: number;
}

const EvolutionPath: React.FC<EvolutionPathProps> = ({
  currentStage,
  className = '',
  onStageSelect
}) => {
  const [activeStage, setActiveStage] = useState<AvatarStage>(currentStage);
  
  const stageInfo: Record<AvatarStage, StageInfo> = {
    [AvatarStage.GRAYSCALE]: {
      name: "Beginning",
      description: "The start of your journey. Your NFT is in grayscale, waiting to evolve.",
      milestones: 0
    },
    [AvatarStage.COLOR]: {
      name: "On Your Way",
      description: "Your first milestone brings color to your journey. You're making progress!",
      milestones: 1
    },
    [AvatarStage.VIVID]: {
      name: "Transforming",
      description: "With each milestone, your avatar becomes more vibrant and dynamic.",
      milestones: 2
    },
    [AvatarStage.HALO]: {
      name: "Becoming Elite",
      description: "The final form. Your avatar now has a halo, representing your achievement.",
      milestones: 4
    }
  };
  
  const handleDotClick = (index: number) => {
    const newStage = index as AvatarStage;
    setActiveStage(newStage);
    if (onStageSelect) {
      onStageSelect(newStage);
    }
  };
  
  // Calculate gradient class based on active stage
  const getGradientClass = () => {
    switch (activeStage) {
      case AvatarStage.GRAYSCALE:
        return 'from-gray-700 to-gray-800';
      case AvatarStage.COLOR:
        return 'from-primary-700 to-primary-800';
      case AvatarStage.VIVID:
        return 'from-secondary-600 to-purple-700';
      case AvatarStage.HALO:
        return 'from-purple-600 to-primary-500';
    }
  };
  
  return (
    <div className={`bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-primary-300">Evolution Path</h3>
      
      {/* Stage display with animation */}
      <div className="relative mb-8 overflow-hidden rounded-lg bg-gray-900/60 p-5">
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${getGradientClass()}`} />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className={`relative w-24 h-24 mb-4 rounded-full p-0.5 bg-gradient-to-tr ${getGradientClass()}`}>
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                <Avatar stage={activeStage} size="sm" />
              </div>
            </div>
            
            <h4 className="text-lg font-medium text-white mb-1">
              {stageInfo[activeStage].name}
            </h4>
            
            <p className="text-sm text-gray-400 text-center mb-2">
              {stageInfo[activeStage].description}
            </p>
            
            <div className="text-xs bg-gray-800 px-2 py-1 rounded-full text-primary-300">
              {stageInfo[activeStage].milestones} milestone{stageInfo[activeStage].milestones !== 1 ? 's' : ''}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Dot indicator navigation */}
      <DotIndicator 
        count={4} 
        activeIndex={activeStage} 
        onDotClick={handleDotClick}
        variant="primary"
        className="mb-4"
      />
      
      {/* Visual representation of stages (optional compact view) */}
      <div className="grid grid-cols-4 gap-2">
        {[
          AvatarStage.GRAYSCALE, 
          AvatarStage.COLOR, 
          AvatarStage.VIVID, 
          AvatarStage.HALO
        ].map((stage) => (
          <button
            key={stage}
            onClick={() => handleDotClick(stage)}
            className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
              activeStage === stage ? 'bg-gray-700/60 ring-1 ring-primary-500/50' : 'hover:bg-gray-700/30'
            }`}
          >
            <div className={`w-8 h-8 rounded-full mb-1 flex items-center justify-center ${
              stage <= currentStage ? 'bg-primary-900/50' : 'bg-gray-800/50'
            }`}>
              <Avatar stage={stage} size="xs" />
            </div>
            <span className="text-xs text-gray-400 truncate w-full text-center">
              {stageInfo[stage].name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EvolutionPath; 