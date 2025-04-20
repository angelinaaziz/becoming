import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContract } from '../hooks/useContract';
import Avatar, { AvatarStage } from '../components/ui/Avatar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AddMilestoneForm from '../components/AddMilestoneForm';
import { FaBolt, FaTrophy, FaWallet, FaPlus, FaShareAlt, FaCalendarAlt, FaCheckCircle, FaLock, FaInfoCircle } from 'react-icons/fa';
import DotIndicator from '../components/ui/DotIndicator';

interface Milestone {
  id: string;
  title: string;
  date: string;
  description?: string;
  proofHash: string;
  completed: boolean;
}

const JourneyPage = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [avatarStage, setAvatarStage] = useState(AvatarStage.GRAYSCALE);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [journeyStartDate, setJourneyStartDate] = useState<Date | null>(null);
  const [showMilestoneDetails, setShowMilestoneDetails] = useState<string | null>(null);
  const [shareTooltip, setShareTooltip] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { 
    getMilestones, 
    getAvatarStage, 
    selectedAccount, 
    connectWallet, 
    checkMinted,
    isContractReady,
    isConnecting,
    getJourneyStartDate,
    mockMode
  } = useContract();
  
  // Monitor development account minting status for changes
  useEffect(() => {
    if (mockMode && selectedAccount?.meta?.name === 'Development Account') {
      // Get the milestones key for the development account
      const mockMilestonesKey = `becoming_milestones_${selectedAccount.address}`;
      
      // Create a function to check if we need to reload data
      const handleStorageChange = (e) => {
        // If the milestones storage was changed externally (e.g., after a re-mint)
        if (e.key === mockMilestonesKey || e.key === 'becoming_nft_minted') {
          console.log('JourneyPage: Development account storage changed, reloading data');
          // Reload milestone data
          loadData();
        }
      };
      
      // Listen for changes to localStorage
      window.addEventListener('storage', handleStorageChange);
      
      // Clean up the event listener when component unmounts
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [mockMode, selectedAccount]);
  
  // Load data from blockchain
  const loadData = async () => {
    try {
      setIsLoading(true);
      setLoadingError(null);
      
      // Check if the user has minted an NFT
      if (selectedAccount) {
        const hasMinted = await checkMinted();
        if (!hasMinted) {
          setLoadingError("You need to mint an NFT first");
          setIsLoading(false);
          return;
        }
        
        // Get milestone data and avatar stage
        const milestonesData = await getMilestones();
        const stageData = await getAvatarStage();
        const startDate = await getJourneyStartDate();
        
        // Transform blockchain data into our format
        const formattedMilestones = milestonesData.map((m: any, index: number) => ({
          id: index.toString(),
          title: m[0],
          proofHash: m[1],
          description: m[2] || undefined, // Add description if available
          date: new Date().toISOString(), // The chain doesn't store dates, so we fake it here
          completed: true
        }));
        
        setMilestones(formattedMilestones);
        setAvatarStage(Number(stageData));
        setJourneyStartDate(startDate || new Date());
      }
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setLoadingError(err.message || 'Failed to load data from blockchain');
      setIsLoading(false);
    }
  };
  
  // Connect wallet and load data if needed
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      console.log("JourneyPage: Attempting to connect wallet");
      
      // Check if there's already a selected account before trying to connect
      if (selectedAccount) {
        console.log("JourneyPage: Already have selected account, no need to connect");
        setIsLoading(false);
        loadData();
        return;
      }
      
      const success = await connectWallet();
      if (success) {
        console.log("JourneyPage: Wallet connected successfully");
        
        // If we already have a selected account (auto-selected), load data immediately
        if (selectedAccount) {
          console.log("JourneyPage: Account selected automatically, loading data");
          loadData();
        } else {
          // At this point, we should have accounts but no selection yet
          // The wallet selector will be shown in the renderContent function
          console.log("JourneyPage: Wallet connected but waiting for account selection");
          setIsLoading(false);
        }
      } else {
        console.log("JourneyPage: Failed to connect wallet");
        setLoadingError("Failed to connect wallet");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("JourneyPage: Error connecting wallet:", err);
      setLoadingError(err.message);
      setIsLoading(false);
    }
  };
  
  // Effect to load data when contract and account are ready
  useEffect(() => {
    console.log("JourneyPage useEffect - isContractReady:", isContractReady, "selectedAccount:", !!selectedAccount, "isConnecting:", isConnecting);
    
    if (isContractReady && selectedAccount) {
      // We have an account and contract is ready, load data
      loadData();
    } else if (isContractReady && !isConnecting && !selectedAccount) {
      // Contract is ready but no account and not currently connecting
      // Let's check if there's a saved account we can restore
      const storedAccountAddress = localStorage.getItem('becoming_selected_account');
      const connected = localStorage.getItem('becoming_wallet_connected') === 'true';
      
      if (storedAccountAddress && connected) {
        console.log("JourneyPage: Found stored account, attempting to connect wallet");
        // Try to restore connection
        setIsLoading(true);
        connectWallet().then(success => {
          if (!success) {
            console.log("JourneyPage: Failed to restore wallet connection");
            setIsLoading(false);
          }
        });
      } else {
        // No stored account, stop loading
        console.log("JourneyPage: No stored account found, stopping loading");
        setIsLoading(false);
      }
    } else if (!isContractReady && !isConnecting) {
      // Just waiting for contract to be ready
      console.log("JourneyPage: Waiting for contract to be ready");
    }
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Safety timeout triggered - forcing loading state to end');
        setIsLoading(false);
      }
    }, 10000); // 10 second safety timeout
    
    return () => clearTimeout(safetyTimeout);
  }, [isContractReady, selectedAccount, isConnecting]);
  
  // Handle successful milestone addition
  const handleMilestoneSuccess = () => {
    loadData();
    setShowForm(false);
  };
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Navigate to mint page
  const handleGoToMint = () => {
    navigate('/');
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
  
  // Calculate days on journey
  const getDaysOnJourney = () => {
    if (!journeyStartDate) return 0;
    
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - journeyStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  };
  
  // Toggle milestone details
  const toggleMilestoneDetails = (id: string) => {
    if (showMilestoneDetails === id) {
      setShowMilestoneDetails(null);
    } else {
      setShowMilestoneDetails(id);
    }
  };
  
  // Share milestone
  const shareMilestone = (id: string) => {
    const milestone = milestones.find(m => m.id === id);
    if (!milestone) return;
    
    // Create sharing text
    const shareText = `I achieved a new milestone: ${milestone.title}. Check out my growth journey!`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareText)
      .then(() => {
        setShareTooltip(id);
        setTimeout(() => setShareTooltip(null), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };
  
  // Share user's profile link
  const shareProfile = () => {
    if (!selectedAccount) return;
    
    const baseUrl = window.location.origin;
    const profileUrl = `${baseUrl}/profile/${selectedAccount.address}`;
    
    navigator.clipboard.writeText(profileUrl)
      .then(() => {
        // Show temporary success message
        const shareButton = document.getElementById('share-profile-button');
        if (shareButton) {
          const originalText = shareButton.innerText;
          shareButton.innerText = 'Copied!';
          setTimeout(() => {
            shareButton.innerText = originalText;
          }, 2000);
        }
      })
      .catch(err => console.error('Failed to copy:', err));
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
    
    // If not connected - this is where the problem is
    if (!selectedAccount && !isConnecting) {
      console.log("Journey page: No account selected, showing connect wallet prompt");
      return (
        <Card className="max-w-lg mx-auto text-center py-10 px-6">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your Polkadot wallet to view your journey and track your milestones.
          </p>
          <Button 
            onClick={handleConnect} 
            variant="primary"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              <span className="flex items-center">
                <FaWallet className="mr-2" /> Connect Wallet
              </span>
            )}
          </Button>
        </Card>
      );
    }
    
    // If connecting is in progress, show loading
    if (isConnecting) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
          <div className="text-primary-400 ml-4">Connecting wallet...</div>
        </div>
      );
    }
    
    // If error
    if (loadingError) {
      return (
        <Card className="max-w-lg mx-auto text-center py-10 px-6">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Something Went Wrong</h2>
          <p className="text-gray-400 mb-6">
            {loadingError === "You need to mint an NFT first" ? (
              "You need to mint your Becoming NFT before you can track milestones."
            ) : (
              `Error loading your journey: ${loadingError}`
            )}
          </p>
          {loadingError === "You need to mint an NFT first" ? (
            <Button onClick={handleGoToMint} variant="primary">
              Mint Your NFT
            </Button>
          ) : (
            <Button onClick={loadData} variant="primary">
              Try Again
            </Button>
          )}
        </Card>
      );
    }
    
    // Main content
    return (
      <div className="flex flex-col md:flex-row gap-8 mb-16">
        {/* Left Column - Avatar and Progress */}
        <div className="w-full md:w-1/3">
          <Card variant="glass" className="sticky top-24">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6 text-primary-300">
                Level {avatarStage + 1}
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
                
                {/* Journey statistics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary-300">{milestones.length}</div>
                    <div className="text-xs text-gray-400">Milestones</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary-300">{getDaysOnJourney()}</div>
                    <div className="text-xs text-gray-400">Days on Journey</div>
                  </div>
                </div>
                
                <div className="mb-4 flex justify-between text-sm items-center">
                  <span className="text-primary-300 font-medium">Progress</span>
                  <span className="text-gray-300 bg-gray-800 px-2 py-0.5 rounded-full text-xs">
                    {milestones.length} / 4 Milestones
                  </span>
                </div>
                
                <div className="w-full bg-gray-800/70 rounded-full h-3 overflow-hidden mb-2">
                  <div 
                    className="bg-gradient-to-r from-primary-600 via-purple-500 to-primary-600 h-3 rounded-full"
                    style={{ width: `${(milestones.length / 4) * 100}%` }}
                  ></div>
                </div>
                
                {/* Add dot indicator below progress bar */}
                <div className="mb-5">
                  <DotIndicator 
                    count={4} 
                    activeIndex={avatarStage}
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
                
                {/* Upcoming evolution info */}
                {avatarStage < AvatarStage.HALO && (
                  <div className="bg-gray-800/30 rounded-lg p-3 text-sm text-gray-300 border border-gray-700">
                    <div className="flex items-center mb-2">
                      <FaInfoCircle className="text-primary-300 mr-2" />
                      <span className="font-medium">Next Evolution</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {4 - milestones.length} more milestone{4 - milestones.length !== 1 ? 's' : ''} until your 
                      avatar evolves to "{avatarStage === AvatarStage.GRAYSCALE ? "On Your Way" : 
                        avatarStage === AvatarStage.COLOR ? "Transforming" : "Becoming Elite"}"
                    </p>
                  </div>
                )}
              </div>
              
              {/* Call to action */}
              <div className="space-y-3 mt-6">
                <Button 
                  onClick={() => setShowForm(true)} 
                  variant="primary"
                  fullWidth
                  className="mt-6"
                >
                  <span className="flex items-center">
                    <FaPlus className="mr-2" /> Add New Milestone
                  </span>
                </Button>
                
                <Button 
                  onClick={shareProfile} 
                  variant="outline"
                  fullWidth
                  id="share-profile-button"
                >
                  <span className="flex items-center">
                    <FaShareAlt className="mr-2" /> Share Your Journey
                  </span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right Column - Milestones */}
        <div className="w-full md:w-2/3">
          {showForm ? (
            <div className="mb-6">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Add Milestone</h2>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <AddMilestoneForm 
                onSuccess={handleMilestoneSuccess} 
                currentAvatarStage={avatarStage}
                milestonesCount={milestones.length}
              />
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Your Journey</h2>
                <Button 
                  onClick={() => setShowForm(true)} 
                  variant="outline"
                  size="sm"
                >
                  <span className="flex items-center">
                    <FaPlus className="mr-1" /> Add Milestone
                  </span>
                </Button>
              </div>
              
              {milestones.length === 0 ? (
                <Card className="p-6 text-center">
                  <FaTrophy className="text-4xl text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No Milestones Yet</h3>
                  <p className="text-gray-400 mb-4">Record your first milestone to begin your journey!</p>
                  <Button onClick={() => setShowForm(true)} variant="primary">
                    Add Your First Milestone
                  </Button>
                </Card>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[19px] top-6 bottom-0 w-1 bg-gray-700 rounded-full"></div>
                  
                  {/* Milestone cards */}
                  <div className="space-y-6">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id} className="relative">
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-0 w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center z-10 border-4 border-gray-900">
                          <FaCheckCircle className="text-primary-300" />
                        </div>
                        
                        {/* Milestone card */}
                        <div className="ml-16 bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden backdrop-blur-sm">
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {milestone.title}
                              </h3>
                              <div className="relative">
                                <button 
                                  onClick={() => shareMilestone(milestone.id)}
                                  className="text-gray-400 hover:text-primary-300 transition-colors"
                                >
                                  <FaShareAlt />
                                </button>
                                {shareTooltip === milestone.id && (
                                  <div className="absolute right-0 top-full mt-1 bg-gray-900 text-white text-xs py-1 px-2 rounded z-10 whitespace-nowrap">
                                    Copied to clipboard!
                                  </div>
                                )}
                              </div>
                            </div>
                            
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
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary-300 to-purple-300 text-transparent bg-clip-text">
        Your Growth Journey
      </h1>
      
      {renderContent()}
    </div>
  );
};

export default JourneyPage; 