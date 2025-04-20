import React from 'react';
import { FaTwitter, FaLinkedin, FaLink } from 'react-icons/fa';
import Button from './ui/Button';
import { AvatarStage } from './ui/Avatar';

// Mapping of avatar stages to user-friendly names
const stageNames = {
  [AvatarStage.GRAYSCALE]: 'Beginning',
  [AvatarStage.COLOR]: 'On My Way',
  [AvatarStage.VIVID]: 'Transforming',
  [AvatarStage.HALO]: 'Becoming Elite',
};

interface ShareMilestoneProps {
  milestone: {
    title: string;
    description?: string;
  };
  avatarStage: AvatarStage;
  profileLink?: string;
  className?: string;
}

const ShareMilestone: React.FC<ShareMilestoneProps> = ({
  milestone,
  avatarStage,
  profileLink,
  className = '',
}) => {
  const baseUrl = window.location.origin;
  const defaultProfileLink = `${baseUrl}/profile/${localStorage.getItem('becoming_selected_account') || ''}`;
  const shareLink = profileLink || defaultProfileLink;
  
  // Create the formatted content with emojis to make it visually appealing
  const formatShareText = () => {
    const stageName = stageNames[avatarStage] || 'My Journey';
    const emoji = avatarStage === AvatarStage.HALO ? '✨' : 
                 avatarStage === AvatarStage.VIVID ? '🌟' : 
                 avatarStage === AvatarStage.COLOR ? '🎨' : '🚀';
                 
    // Create a formatted message with the milestone and stage
    return `${emoji} I just achieved: "${milestone.title}" on my personal growth journey!\n\n` +
           `Current level: ${stageName}\n\n` +
           `Follow my journey on Becoming NFT ${shareLink}\n\n` +
           `#BecomingNFT #PersonalGrowth`;
  };
  
  const shareText = formatShareText();
  
  // Share to Twitter/X
  const shareToTwitter = () => {
    // Use Twitter Web Intent for sharing
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareLink)}&via=BecomingNFT`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };
  
  // Share to LinkedIn
  const shareToLinkedIn = () => {
    // LinkedIn doesn't support custom text + url in the same way as Twitter
    // So we'll just use their standard sharing dialog
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}&summary=${encodeURIComponent(shareText)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };
  
  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText)
      .then(() => {
        // Show a temporary success message
        alert('Share text copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text:', err);
        alert('Failed to copy text to clipboard. Please try again.');
      });
  };
  
  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-200">Share your milestone</h3>
      
      <div className="p-4 bg-gray-800/60 rounded-lg border border-gray-700 mb-2">
        <p className="text-gray-300 text-sm whitespace-pre-line">{shareText}</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={shareToTwitter}
          variant="secondary"
          className="flex items-center gap-2 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2]"
          size="sm"
        >
          <FaTwitter /> Share on X/Twitter
        </Button>
        
        <Button 
          onClick={shareToLinkedIn}
          variant="secondary"
          className="flex items-center gap-2 bg-[#0077B5]/20 hover:bg-[#0077B5]/30 text-[#0077B5]"
          size="sm"
        >
          <FaLinkedin /> Share on LinkedIn
        </Button>
        
        <Button 
          onClick={copyToClipboard}
          variant="secondary"
          className="flex items-center gap-2"
          size="sm"
        >
          <FaLink /> Copy to Clipboard
        </Button>
      </div>
    </div>
  );
};

export default ShareMilestone; 