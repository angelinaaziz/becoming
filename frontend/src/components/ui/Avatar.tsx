import { ReactNode } from 'react';

// Define the avatar evolution stages
export enum AvatarStage {
  GRAYSCALE = 0,
  COLOR = 1,
  VIVID = 2,
  HALO = 3
}

interface AvatarProps {
  stage: AvatarStage;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar = ({ stage, size = 'md', className = '' }: AvatarProps) => {
  // Define sizes
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  // Define image paths and effects based on stage
  let imagePath = '';
  let borderClasses = '';
  let containerClasses = '';

  switch (stage) {
    case AvatarStage.GRAYSCALE:
      imagePath = '/stage0_pixel_avatar.png';
      borderClasses = 'border-2 border-gray-700';
      containerClasses = 'bg-gray-800';
      break;
    case AvatarStage.COLOR:
      imagePath = '/stage1_pixel_avatar.png';
      borderClasses = 'border-2 border-primary-600';
      containerClasses = 'bg-primary-900/20 shadow-[0_0_15px_rgba(151,71,255,0.3)]';
      break;
    case AvatarStage.VIVID:
      imagePath = '/stage2_pixel_avatar.png';
      borderClasses = 'border-2 border-primary-500';
      containerClasses = 'bg-primary-900/30 shadow-[0_0_25px_rgba(151,71,255,0.4)]';
      break;
    case AvatarStage.HALO:
      imagePath = '/stage2_pixel_avatar.png';
      borderClasses = 'border-2 border-primary-400';
      containerClasses = 'bg-primary-900/40 shadow-[0_0_35px_rgba(151,71,255,0.5)]';
      break;
  }

  // Determine augmentations based on stage
  const renderAugmentations = () => {
    if (stage === AvatarStage.GRAYSCALE) return null;
    
    return (
      <>
        {/* Circular glow */}
        <div 
          className={`absolute inset-0 rounded-full opacity-80 blur-md -z-10 ${
            stage === AvatarStage.COLOR ? 'bg-primary-900/20' :
            stage === AvatarStage.VIVID ? 'bg-primary-800/40' :
            'bg-primary-700/60'
          }`}
          style={{ transform: 'scale(1.1)' }}
        ></div>
        
        {/* Orbital ring for higher levels */}
        {stage >= AvatarStage.VIVID && (
          <div className="absolute inset-0 -z-5 orbital-ring">
            <div className="h-full w-full rounded-full border-4 border-primary-500/20 border-dashed"></div>
          </div>
        )}
        
        {/* Decorative corner accents for maximum level */}
        {stage === AvatarStage.HALO && (
          <>
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-primary-400 rounded-tr-md"></div>
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-primary-400 rounded-bl-md"></div>
          </>
        )}
      </>
    );
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {renderAugmentations()}
      
      <div className={`relative rounded-full ${borderClasses} ${containerClasses} overflow-hidden z-10`}>
        <img
          src={imagePath}
          alt={`Avatar Stage ${stage}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to a colored div with initials if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
            
            // Add appropriate background based on stage
            if (stage === AvatarStage.GRAYSCALE) {
              e.currentTarget.parentElement!.classList.add('bg-gray-800');
            } else {
              e.currentTarget.parentElement!.classList.add('bg-primary-900');
            }
            
            const div = document.createElement('div');
            div.className = 'text-2xl font-bold ' + (stage === AvatarStage.GRAYSCALE ? 'text-gray-400' : 'text-primary-300');
            div.innerText = 'BE';
            e.currentTarget.parentElement!.appendChild(div);
          }}
        />
      </div>
      
      {/* Glow effects for higher levels */}
      {stage >= AvatarStage.VIVID && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-20 blur-3xl opacity-30 bg-primary-500 rounded-full"></div>
      )}
    </div>
  );
};

export default Avatar; 