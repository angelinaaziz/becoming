import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import MintPage from './pages/MintPage';
import JourneyPage from './pages/JourneyPage';
import CelebrationPage from './pages/CelebrationPage';
import PublicProfilePage from './pages/PublicProfilePage';
import { useEffect, useState } from 'react';
import { useContract } from './hooks/useContract';
import PageTransition from './components/ui/PageTransition';
import './App.css';

// Add debug utility at the top of the file
const debug = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[App] ${message}`, ...args);
  }
};

// Generate hexagon mesh pattern as a data URL
const generateHexagonMesh = (): string => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Failed to get canvas context');
      return '';
    }
    
    // Set transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw hexagon grid
    const hexSize = 30;
    const hexHeight = hexSize * Math.sqrt(3);
    ctx.strokeStyle = 'rgba(151, 71, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let row = 0; row < canvas.height / hexHeight + 1; row++) {
      for (let col = 0; col < canvas.width / (hexSize * 3) + 1; col++) {
        const x = col * hexSize * 3 + (row % 2 === 0 ? 0 : hexSize * 1.5);
        const y = row * hexHeight * 0.75;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const xPos = x + hexSize * Math.cos(angle);
          const yPos = y + hexSize * Math.sin(angle);
          
          if (i === 0) ctx.moveTo(xPos, yPos);
          else ctx.lineTo(xPos, yPos);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating hexagon mesh:', error);
    return '';
  }
};

// A component to redirect users if they haven't minted an NFT
const RequiresMinted = ({ children }: { children: JSX.Element }) => {
  const { 
    isMinted, 
    isContractReady, 
    selectedAccount, 
    isConnecting, 
    error, 
    forceMintCheck,
    mockMode, // Get mockMode from useContract
    connectWallet,
    selectAccount,
    accounts
  } = useContract();
  const location = useLocation();
  const [checkComplete, setCheckComplete] = useState(false);
  const [actualMintStatus, setActualMintStatus] = useState<boolean | null>(null);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
  
  // When location changes (navigation happens), always reset the check complete flag
  // This ensures we recheck when navigating between pages
  useEffect(() => {
    debug("RequiresMinted: Navigation detected, resetting check state");
    setCheckComplete(false);
  }, [location.pathname]);
  
  // Try to restore account from localStorage on initial mount or location change
  useEffect(() => {
    const attemptAccountRestore = async () => {
      if (hasAttemptedRestore || selectedAccount || isConnecting) return;
      
      const storedAccountAddress = localStorage.getItem('becoming_selected_account');
      const connected = localStorage.getItem('becoming_wallet_connected') === 'true';
      
      if (storedAccountAddress && connected) {
        debug('RequiresMinted: Attempting to restore account from localStorage:', storedAccountAddress);
        
        try {
          setHasAttemptedRestore(true);
          const success = await connectWallet(true); // Use silent mode
          
          if (success && accounts.length > 0) {
            // Give time for accounts to be populated
            setTimeout(() => {
              const account = accounts.find(acc => acc.address === storedAccountAddress);
              if (account) {
                debug('RequiresMinted: Found stored account, selecting:', account.address);
                selectAccount(account);
              } else {
                debug('RequiresMinted: Stored account not found in available accounts');
              }
            }, 100);
          } else {
            debug('RequiresMinted: Failed to connect wallet or no accounts found');
          }
        } catch (err) {
          console.error('Error restoring account:', err);
        }
      } else {
        setHasAttemptedRestore(true);
        debug('RequiresMinted: No stored account to restore');
      }
    };
    
    attemptAccountRestore();
  }, [selectedAccount, isConnecting, connectWallet, accounts, selectAccount, hasAttemptedRestore, location.pathname]);
  
  // Only do the redirect check once all data is loaded
  const readyToCheck = isContractReady && !isConnecting && hasAttemptedRestore;
  
  // More reliable handling of checks for minted status
  useEffect(() => {
    // Skip if we're still loading or already checked
    if (!readyToCheck || checkComplete) return;
    
    const checkMintStatus = async () => {
      try {
        debug("RequiresMinted: Ready to check mint status, selectedAccount:", selectedAccount?.address);
        
        if (!selectedAccount) {
          debug("RequiresMinted: No wallet connected, will redirect to home page");
          setCheckComplete(true);
          return;
        }
        
        // In mock mode, directly check localStorage for more reliable results
        if (mockMode) {
          debug("RequiresMinted: Using mock mode check");
          const storedMinted = localStorage.getItem('becoming_nft_minted');
          const mintStatus = storedMinted === 'true';
          debug("RequiresMinted: Mock mode mint status:", mintStatus);
          setActualMintStatus(mintStatus);
          setCheckComplete(true);
          return;
        }
        
        // For real mode, use forceMintCheck for fresh status
        const isMintedResult = await forceMintCheck();
        debug("RequiresMinted: Force mint check result:", isMintedResult);
        
        // Store the result in localStorage for consistent access
        localStorage.setItem('becoming_nft_minted', isMintedResult ? 'true' : 'false');
        
        setActualMintStatus(isMintedResult);
        
        // Mark check as complete regardless of result
        setCheckComplete(true);
      } catch (err) {
        console.error("Error checking mint status:", err);
        // Still mark as complete so we don't get stuck
        setCheckComplete(true);
      }
    };
    
    checkMintStatus();
  }, [readyToCheck, selectedAccount, forceMintCheck, checkComplete, mockMode]);
  
  // Debug logging of state
  useEffect(() => {
    debug("RequiresMinted state:", { 
      selectedAccount: selectedAccount?.address, 
      isConnecting, 
      isContractReady, 
      checkComplete, 
      actualMintStatus,
      hasAttemptedRestore,
      readyToCheck
    });
  }, [selectedAccount, isConnecting, isContractReady, checkComplete, actualMintStatus, hasAttemptedRestore, readyToCheck]);
  
  // Perform the actual redirect if needed - use actualMintStatus instead of isMinted
  if (checkComplete && (!selectedAccount || (actualMintStatus !== null && !actualMintStatus))) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Show loading state while we're connecting, checking contract, or verifying mint status
  if (isConnecting || !isContractReady || !checkComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950">
        <div className="w-16 h-16 border-t-4 border-primary-400 border-solid rounded-full animate-spin mb-4"></div>
        <div className="text-primary-400 text-xl">
          {isConnecting ? 'Connecting to blockchain...' : 
           !isContractReady ? 'Loading contract...' : 
           'Verifying mint status...'}
        </div>
        {error && (
          <div className="mt-4 text-red-400 max-w-md text-center p-4 bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}
      </div>
    );
  }

  // If there was a contract error, show it but still allow navigation if they're minted
  if (error && actualMintStatus) {
    console.warn('Contract error, but allowing navigation since user has minted:', error);
    return (
      <>
        <div className="bg-red-900/80 text-white p-3 text-center">
          <p>Warning: Contract connection issue. Some features may be limited.</p>
          <p className="text-sm">{error}</p>
        </div>
        {children}
      </>
    );
  }

  // If they have minted and we've passed all checks, allow access to the route
  return children;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Apply hexagon mesh to CSS classes
    try {
      const dataUrl = generateHexagonMesh();
      if (dataUrl) {
        // Create style element for hexagon background
        const style = document.createElement('style');
        style.textContent = `
          .hex-bg {
            background-image: url('${dataUrl}');
            background-size: 300px;
          }
        `;
        document.head.appendChild(style);
        
        // Create a hidden image element to ensure the pattern is loaded
        const img = new Image();
        img.src = dataUrl;
        img.id = 'hexagon-mesh';
        img.style.display = 'none';
        document.body.appendChild(img);
        
        // Store in localStorage for later use
        localStorage.setItem('hexagon-mesh', dataUrl);
      }
    } catch (error) {
      console.error('Failed to apply hexagon mesh:', error);
    } finally {
      // Always mark loading as complete, even if there's an error
      setIsLoading(false);
    }
  }, []);

  // Show a simple loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-primary-400 text-xl">
          Loading application...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><PageTransition transition="fade"><MintPage /></PageTransition></Layout>} />
        <Route path="/journey" element={<RequiresMinted><Layout><PageTransition transition="slide"><JourneyPage /></PageTransition></Layout></RequiresMinted>} />
        <Route path="/celebration" element={<RequiresMinted><Layout><PageTransition transition="scale"><CelebrationPage /></PageTransition></Layout></RequiresMinted>} />
        <Route path="/profile/:address" element={<Layout><PageTransition><PublicProfilePage /></PageTransition></Layout>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
