import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import Button from './ui/Button';
import ShareMilestone from './ShareMilestone';
import { AvatarStage } from './ui/Avatar';

interface MilestoneSuccessModalProps {
  milestone: {
    title: string;
    description?: string;
  };
  avatarStage: AvatarStage;
  onClose: () => void;
  onBackToJourney: () => void;
  onAddAnother: () => void;
}

const MilestoneSuccessModal: React.FC<MilestoneSuccessModalProps> = ({
  milestone,
  avatarStage,
  onClose,
  onBackToJourney,
  onAddAnother
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-400 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Milestone Added!</h2>
          <p className="text-gray-300">
            "{milestone.title}" has been successfully added to your journey.
          </p>
        </div>
        
        {/* Share Section */}
        <div className="mb-8">
          <ShareMilestone 
            milestone={milestone} 
            avatarStage={avatarStage}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <Button 
            onClick={onBackToJourney}
            variant="primary"
            fullWidth
          >
            Back to Journey
          </Button>
          
          <Button 
            onClick={onAddAnother}
            variant="secondary"
            fullWidth
          >
            Add Another Milestone
          </Button>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 text-sm"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MilestoneSuccessModal; 