import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Avatar, { AvatarStage } from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DotIndicator from '../components/ui/DotIndicator';
import { motion } from 'framer-motion';
import { FaRocket, FaLock, FaPaintBrush, FaStar, FaWallet, FaShieldAlt, FaChartLine, FaUsers } from 'react-icons/fa';
import { useContract } from '../hooks/useContract';
import MintButton from '../components/MintButton';
import WalletSelector from '../components/WalletSelector';
import AnimatedButton from '../components/ui/AnimatedButton';

const MintPage = () => {
  const [isMinted, setIsMinted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<AvatarStage>(AvatarStage.GRAYSCALE);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  
  const navigate = useNavigate();
  const { 
    connectWallet, 
    selectedAccount, 
    checkMinted, 
    isContractReady,
    isConnecting,
    accounts,
    selectAccount,
    mockMode
  } = useContract();
  
  // Stage info for evolution path
  const stageInfo = {
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
  
  // Auto-cycle through evolution stages
  useEffect(() => {
    const stageValues = [
      AvatarStage.GRAYSCALE, 
      AvatarStage.COLOR, 
      AvatarStage.VIVID, 
      AvatarStage.HALO
    ];
    
    const interval = setInterval(() => {
      setActiveStage(prevStage => {
        const currentIndex = stageValues.indexOf(prevStage);
        const nextIndex = (currentIndex + 1) % stageValues.length;
        return stageValues[nextIndex];
      });
    }, 4000); // Change stage every 4 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Check mint status once when component loads and contract is ready
  useEffect(() => {
    const checkMintStatus = async () => {
      if (!selectedAccount || !isContractReady) return;
      
      try {
        console.log("MintPage: Checking if user has minted NFT");
        const hasMinted = await checkMinted();
        console.log("MintPage: Mint status check result:", hasMinted);
        
        if (hasMinted) {
          console.log("MintPage: User has already minted, redirecting to journey");
          setIsMinted(true);
          // Short delay to ensure state is updated before redirect
          setTimeout(() => navigate('/journey'), 100);
        }
      } catch (err) {
        console.error('Failed to check mint status:', err);
      }
    };
    
    checkMintStatus();
  }, [selectedAccount, isContractReady, checkMinted, navigate]);
  
  const handleConnectWallet = async () => {
    try {
      const connected = await connectWallet();
      if (connected) {
        setShowWalletSelector(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleAccountSelected = async (account) => {
    try {
      await selectAccount(account);
      setShowWalletSelector(false);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleWalletSelectorCancel = () => {
    setShowWalletSelector(false);
  };
  
  const handleStartJourney = () => {
    navigate('/journey');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-1/4 -left-20 w-60 h-60 bg-secondary-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[20rem] bg-primary-400 rounded-full opacity-5 blur-3xl"></div>
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-400 via-purple-400 to-secondary-400 text-transparent bg-clip-text leading-tight tracking-wide"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut"
            }}
          >
            Becoming
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            The journey to becoming your best self starts with a single step.
          </motion.p>
        </motion.div>
        
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Card className="p-8 backdrop-blur-sm bg-opacity-60 border-gray-700 shadow-xl mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Left side - Avatar & Evolution Info */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6 p-1 rounded-full bg-gradient-to-tr from-primary-500 via-purple-500 to-secondary-500">
                    <div className="p-1 rounded-full bg-gray-900">
                      <Avatar stage={activeStage} size="lg" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gray-900 p-1 border-2 border-gray-800">
                      <div className="w-full h-full rounded-full bg-purple-900 flex items-center justify-center animate-pulse">
                        <FaStar className="text-purple-300" />
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">Evolution Preview</h2>
                  <p className="text-gray-400 mb-6">
                    Your journey starts here. As you log milestones, your avatar will evolve.
                  </p>
                  
                  {/* Evolution stages with dot indicator */}
                  <div className="w-full">
                    <div className="relative p-6 bg-gray-800/50 rounded-lg border border-gray-700/50 mb-6">
                      <h3 className="font-medium text-lg text-primary-300 mb-4">{stageInfo[activeStage].name}</h3>
                      <p className="text-sm text-gray-400 mb-4">{stageInfo[activeStage].description}</p>
                      
                      <DotIndicator 
                        count={4} 
                        activeIndex={activeStage} 
                        onDotClick={setActiveStage}
                        variant="primary"
                        className="mb-2"
                      />
                      
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>Start</span>
                        <span>Color</span>
                        <span>Vivid</span>
                        <span>Halo</span>
                      </div>
                    </div>
                    
                    {/* Quick view of all stages */}
                    <div className="flex justify-between">
                      {[AvatarStage.GRAYSCALE, AvatarStage.COLOR, AvatarStage.VIVID, AvatarStage.HALO].map((stage) => (
                        <button
                          key={stage}
                          onClick={() => setActiveStage(stage)}
                          className={`flex-1 mx-1 flex flex-col items-center p-2 rounded-lg ${
                            activeStage === stage ? 'bg-gray-800/60 ring-1 ring-primary-500/30' : 'hover:bg-gray-800/30'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full mb-1 flex items-center justify-center bg-gray-900">
                            <Avatar stage={stage} size="xs" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right side - Minting Card */}
                <div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary-900 flex items-center justify-center mx-auto mb-4">
                      <FaRocket className="text-primary-400 text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold">Begin Your Journey</h2>
                    <p className="text-gray-400 mt-2">
                      Mint your soul-bound NFT to start tracking your personal milestones
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-secondary-900 flex-shrink-0 mt-0.5 mr-3">
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-secondary-500"></div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">Soul-bound Token</h3>
                          <p className="text-sm text-gray-400">
                            Your NFT belongs to you and cannot be sold or transferred
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-secondary-900 flex-shrink-0 mt-0.5 mr-3">
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-secondary-500"></div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">Evolving Avatar</h3>
                          <p className="text-sm text-gray-400">
                            Your avatar evolves as you hit personal milestones
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {!selectedAccount && !isMinted ? (
                      <AnimatedButton
                        onClick={handleConnectWallet}
                        fullWidth
                        size="lg"
                        variant="gradient"
                        className="relative overflow-hidden"
                        disabled={isConnecting}
                        loading={isConnecting}
                        icon={<FaWallet />}
                        glow={true}
                      >
                        Connect Wallet
                      </AnimatedButton>
                    ) : isMinted ? (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-primary-900/70 to-secondary-900/70 rounded-lg p-5 border border-secondary-700/50">
                          <h3 className="font-semibold text-secondary-300 mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            NFT Successfully Minted!
                          </h3>
                          <p className="text-gray-300 mb-3">
                            Your soul-bound NFT has been created. Now start logging your personal milestones to see it evolve!
                          </p>
                          <AnimatedButton 
                            variant="secondary" 
                            fullWidth
                            onClick={handleStartJourney}
                            icon={<FaRocket />}
                            glow={true}
                          >
                            Start Your Journey
                          </AnimatedButton>
                        </div>
                      </div>
                    ) : (
                      <MintButton />
                    )}
                    
                    {isMinted && (
                      <p className="text-center text-gray-400 text-sm">
                        Your NFT will evolve as you add milestones to your journey.
                      </p>
                    )}
                  </div>
                  
                  {/* Extension description */}
                  {!selectedAccount && (
                    <div className="mt-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400">
                        You'll need the Polkadot.js extension to connect your wallet.
                        <a 
                          href="https://polkadot.js.org/extension/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-300 hover:text-primary-200 ml-1"
                        >
                          Install here
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Value Proposition Section */}
      <div className="container mx-auto px-4 py-20 border-t border-gray-800/50">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-primary-300 to-purple-300 text-transparent bg-clip-text">
          What is Becoming?
        </h2>
        
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-lg text-gray-300">
            Becoming is a soulbound NFT that evolves as you achieve personal milestones. Unlike traditional NFTs, it's tied to your identity and grows with you, visually representing your journey of personal growth.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Benefit Card 1 */}
          <Card className="text-center backdrop-blur-sm bg-opacity-40 border-gray-700 p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-900/50 flex items-center justify-center">
              <FaShieldAlt className="text-primary-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-3">Permanent Record of Growth</h3>
            <p className="text-gray-400">
              Your achievements are permanently recorded on the blockchain, creating an immutable history of your personal development.
            </p>
          </Card>
          
          {/* Benefit Card 2 */}
          <Card className="text-center backdrop-blur-sm bg-opacity-40 border-gray-700 p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-900/50 flex items-center justify-center">
              <FaPaintBrush className="text-purple-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-3">Visual Evolution</h3>
            <p className="text-gray-400">
              Watch your avatar transform from grayscale to vibrant, detailed versions as you reach new milestones in your journey.
            </p>
          </Card>
          
          {/* Benefit Card 3 */}
          <Card className="text-center backdrop-blur-sm bg-opacity-40 border-gray-700 p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-900/50 flex items-center justify-center">
              <FaUsers className="text-secondary-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-3">Community Recognition</h3>
            <p className="text-gray-400">
              Share your journey with others, receive tips for your achievements, and build a network of supporters.
            </p>
          </Card>
        </div>
      </div>
      
      {/* Wallet Selector Modal */}
      {showWalletSelector && createPortal(
        <WalletSelector 
          accounts={accounts}
          onSelect={handleAccountSelected}
          onCancel={handleWalletSelectorCancel}
          isLoading={isConnecting}
        />,
        document.body
      )}
    </div>
  );
};

export default MintPage; 