import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContract } from '../hooks/useContract';
import Avatar, { AvatarStage } from '../components/ui/Avatar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FaBolt, FaCalendarAlt, FaCheckCircle, FaLock, FaArrowLeft, FaGift } from 'react-icons/fa';

interface Milestone {
  id: string;
  title: string;
  date: string;
  description?: string;
  proofHash: string;
  completed: boolean;
}

const PublicProfilePage = () => {
  const { address } = useParams<{ address: string }>();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [avatarStage, setAvatarStage] = useState(AvatarStage.GRAYSCALE);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState('0.1');
  const [isSendingTip, setIsSendingTip] = useState(false);
  const [tipSuccess, setTipSuccess] = useState(false);
  const [showMilestoneDetails, setShowMilestoneDetails] = useState<string | null>(null);
  
  const { 
    getMilestonesForAccount, 
    getAvatarStageForAccount, 
    selectedAccount, 
    connectWallet, 
    sendTip,
    isContractReady,
    isConnecting,
  } = useContract();
  
  // Load data from blockchain
  const loadData = async () => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      setLoadingError(null);
      
      // Get milestone data and avatar stage for this account
      const milestonesData = await getMilestonesForAccount(address);
      const stageData = await getAvatarStageForAccount(address);
      
      // Transform blockchain data into our format
      const formattedMilestones = milestonesData.map((m: any, index: number) => ({
        id: index.toString(),
        title: m[0],
        proofHash: m[1],
        description: m[2] || undefined,
        date: new Date().toISOString(), // The chain doesn't store dates, so we fake it here
        completed: true
      }));
      
      setMilestones(formattedMilestones);
      setAvatarStage(Number(stageData));
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setLoadingError(err.message || 'Failed to load data from blockchain');
      setIsLoading(false);
    }
  };
  
  // Connect wallet if needed
  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err: any) {
      setLoadingError(err.message);
    }
  };
  
  // Effect to load data when contract is ready and address is available
  useEffect(() => {
    if (isContractReady && address) {
      loadData();
    }
  }, [isContractReady, address]);
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get stage name
  const getStageName = () => {
    switch(avatarStage) {
      case AvatarStage.GRAYSCALE: return "Just Starting";
      case AvatarStage.COLOR: return "On Your Way";
      case AvatarStage.VIVID: return "Transforming";
      case AvatarStage.HALO: return "Becoming Elite";
      default: return "Just Starting";
    }
  };
  
  // Send tip to this user
  const handleSendTip = async () => {
    if (!address || !selectedAccount) return;
    
    try {
      setIsSendingTip(true);
      
      await sendTip(address, parseFloat(tipAmount));
      
      // Show success animation
      setTipSuccess(true);
      setTimeout(() => {
        setTipSuccess(false);
        setShowTipModal(false);
      }, 3000);
      
      setIsSendingTip(false);
    } catch (err: any) {
      console.error('Failed to send tip:', err);
      setLoadingError(err.message || 'Failed to send tip');
      setIsSendingTip(false);
    }
  };
  
  // Toggle milestone details
  const toggleMilestoneDetails = (id: string) => {
    if (showMilestoneDetails === id) {
      setShowMilestoneDetails(null);
    } else {
      setShowMilestoneDetails(id);
    }
  };
  
  // Format address for display
  const formatAddress = (address: string | undefined) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Render content based on state
  const renderContent = () => {
    // If loading
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    }
    
    // If error
    if (loadingError) {
      return (
        <Card className="max-w-lg mx-auto text-center py-10 px-6">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Something Went Wrong</h2>
          <p className="text-gray-400 mb-6">
            Error loading profile: {loadingError}
          </p>
          <Button onClick={loadData} variant="primary">
            Try Again
          </Button>
        </Card>
      );
    }
    
    // Main content
    return (
      <div className="flex flex-col md:flex-row gap-8 mb-16">
        {/* Left Column - Avatar and Actions */}
        <div className="w-full md:w-1/3">
          <Card variant="glass" className="sticky top-24">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6 text-primary-300">
                {formatAddress(address)}
              </h2>
              
              {/* Identity Badge */}
              <div className="py-6 flex justify-center">
                <div className="relative">
                  <Avatar stage={avatarStage} size="lg" />
                  
                  {/* Badge indicators */}
                  {avatarStage >= AvatarStage.COLOR && (
                    <div className="absolute -right-2 -bottom-1 bg-primary-900/80 rounded-full p-2 border-2 border-gray-900">
                      <FaBolt className="text-primary-300" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Status and progress */}
              <div className="mt-8">
                <div className="text-center mb-4">
                  <div className="text-xl font-semibold bg-gradient-to-r from-primary-300 to-purple-300 text-transparent bg-clip-text">
                    {getStageName()}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="mb-4 flex justify-between text-sm items-center">
                  <span className="text-primary-300 font-medium">Progress</span>
                  <span className="text-gray-300 bg-gray-800 px-2 py-0.5 rounded-full text-xs">
                    {milestones.length} Milestones
                  </span>
                </div>
                
                <div className="w-full bg-gray-800/70 rounded-full h-3 overflow-hidden mb-6">
                  <div 
                    className="bg-gradient-to-r from-primary-600 via-purple-500 to-primary-600 h-3 rounded-full"
                    style={{ width: `${Math.min((milestones.length / 4) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="space-y-3 mt-6">
                {selectedAccount ? (
                  <Button 
                    onClick={() => setShowTipModal(true)} 
                    variant="gradient"
                    fullWidth
                  >
                    <span className="flex items-center">
                      <FaGift className="mr-2" /> Send a Tip
                    </span>
                  </Button>
                ) : (
                  <Button 
                    onClick={handleConnect} 
                    variant="primary"
                    fullWidth
                    disabled={isConnecting}
                  >
                    {isConnecting ? "Connecting..." : "Connect to Send Tip"}
                  </Button>
                )}
                
                <Link to="/journey">
                  <Button 
                    variant="outline"
                    fullWidth
                  >
                    <span className="flex items-center">
                      <FaArrowLeft className="mr-2" /> Back to Your Journey
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right Column - Milestones */}
        <div className="w-full md:w-2/3">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Journey Timeline</h2>
            </div>
            
            {milestones.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-400 mb-4">This user hasn't recorded any milestones yet.</p>
              </Card>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-6 bottom-0 w-1 bg-gray-700 rounded-full"></div>
                
                {/* Milestone cards */}
                <div className="space-y-6">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-0 w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center z-10 border-4 border-gray-900">
                        <FaCheckCircle className="text-primary-300" />
                      </div>
                      
                      {/* Milestone card */}
                      <div className="ml-16 bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden backdrop-blur-sm">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {milestone.title}
                          </h3>
                          
                          <div className="flex items-center text-sm text-gray-400 mb-3">
                            <FaCalendarAlt className="mr-1" /> {formatDate(milestone.date)}
                          </div>
                          
                          {milestone.description && (
                            <p className="text-gray-300 mb-3">{milestone.description}</p>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-xs text-gray-500">
                              <FaLock className="mr-1" /> Hash: {milestone.proofHash.substring(0, 10)}...
                            </div>
                            
                            <button 
                              onClick={() => toggleMilestoneDetails(milestone.id)}
                              className="text-xs text-primary-300 hover:text-primary-200"
                            >
                              {showMilestoneDetails === milestone.id ? 'Hide Details' : 'Show Details'}
                            </button>
                          </div>
                          
                          {showMilestoneDetails === milestone.id && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <div className="bg-gray-900/60 p-3 rounded-lg text-xs font-mono text-gray-300 break-all">
                                <div>
                                  <span className="text-gray-500">Hash:</span> {milestone.proofHash}
                                </div>
                                <div className="mt-1">
                                  <span className="text-gray-500">Verified:</span> <span className="text-green-400">Yes</span>
                                </div>
                                <div className="mt-1">
                                  <span className="text-gray-500">Milestone ID:</span> {milestone.id}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary-300 to-purple-300 text-transparent bg-clip-text">
        Profile: {formatAddress(address)}
      </h1>
      
      {renderContent()}
      
      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6 relative">
            {tipSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaGift className="text-green-400 text-3xl animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-green-400">Tip Sent!</h3>
                <p className="text-gray-300">Your support has been sent successfully.</p>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setShowTipModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
                
                <h3 className="text-2xl font-bold mb-6 text-center text-primary-300">Send a Tip</h3>
                
                <p className="text-gray-300 mb-6 text-center">
                  Support {formatAddress(address)}'s journey by sending them DOT tokens.
                </p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (DOT)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <Button
                  onClick={handleSendTip}
                  variant="gradient"
                  fullWidth
                  disabled={isSendingTip || !selectedAccount}
                >
                  {isSendingTip ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Tip"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage; 