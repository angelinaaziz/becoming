import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa';
import { useContract } from '../../hooks/useContract';
import BackgroundAnimation from '../ui/BackgroundAnimation';

// Remove the ParticleBackground component since we're replacing it

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [networkRetryCount, setNetworkRetryCount] = useState(0);
  const { error: contractError, isContractReady } = useContract();
  
  // State for animated background elements
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Handle mouse movement for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Calculate dynamic positions based on mouse
  const blobX = mousePosition.x * 20 - 10;
  const blobY = mousePosition.y * 20 - 10;
  
  // Check for network connectivity errors
  useEffect(() => {
    let connectionCheckInterval: number;
    let reconnectTimeout: number;
    
    // Check if the contract is having connection issues
    const checkContractConnection = () => {
      if (contractError && contractError.includes('Failed to connect')) {
        setShowNetworkError(true);
      } else {
        setShowNetworkError(false);
      }
    };
    
    // Initial check
    checkContractConnection();
    
    // Set up periodic checks
    connectionCheckInterval = window.setInterval(() => {
      checkContractConnection();
    }, 5000);
    
    return () => {
      clearInterval(connectionCheckInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [contractError, isContractReady]);
  
  // Handle retry connection
  const handleRetryConnection = () => {
    setNetworkRetryCount(prev => prev + 1);
    
    // Refresh the page to reconnect
    window.location.reload();
  };
  
  // Render error message if network is down
  const renderNetworkError = () => {
    if (!showNetworkError) return null;
    
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-900/90 backdrop-blur-sm text-white p-4 z-50 border-t border-red-700">
        <div className="container mx-auto">
          <div className="flex items-start gap-4">
            <div className="text-red-300 mt-1">
              <FaExclamationTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-2">Network Connection Error</h3>
              <p className="text-red-100 mb-3">
                We're having trouble connecting to the blockchain node. Please ensure that:
              </p>
              <ol className="list-decimal pl-5 mb-3 text-red-100 space-y-1">
                <li>The substrate-contracts-node is running locally</li>
                <li>WebSocket port 9944 is accessible</li>
                <li>Your contract is deployed at the address specified in your .env file</li>
              </ol>
              <div className="text-xs text-red-200 mb-4">
                Run <code className="bg-red-950 px-2 py-1 rounded">./substrate-contracts-node --dev</code> in your terminal to start the node
              </div>
              <button 
                onClick={handleRetryConnection}
                className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
              >
                <FaSyncAlt className={networkRetryCount > 0 ? "animate-spin" : ""} />
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Choose background variant based on current route
  const getBackgroundVariant = () => {
    const path = location.pathname;
    
    if (path === '/') return 'glow';
    if (path === '/journey') return 'particles';
    if (path === '/add-milestone') return 'hexGrid';
    if (path.includes('/profile')) return 'particles';
    
    return 'default';
  };
  
  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Replace static backgrounds with dynamic background animation */}
      <BackgroundAnimation 
        variant={getBackgroundVariant()} 
        intensity="medium"
        color="rgba(151, 71, 255, 0.3)"
      />
      
      {/* Cybernetic lines - keep these for extra visual flair */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-500/40 to-transparent"></div>
        <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
      </div>
      
      <Navbar />
      
      <main className="relative z-10">
        {children}
      </main>
      
      {/* Modern footer with glowing effects */}
      <footer className="relative z-10 border-t border-primary-900/50 backdrop-blur-md bg-gray-950/70 py-6 mt-20">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
        <div className="container mx-auto px-4 text-center text-sm">
          <p className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent font-medium tracking-wide">
            BECOMING — Track your personal growth journey on the blockchain
          </p>
          <p className="mt-1 text-gray-500">
            Empower your transformation with <span className="text-primary-400">verifiable</span> milestones
          </p>
          <p className="mt-3 text-gray-500">
            Made with 💜 by Angelina for easyA and Polkadot Hackathon
          </p>
        </div>
      </footer>
      
      {renderNetworkError()}
    </div>
  );
};

export default Layout; 