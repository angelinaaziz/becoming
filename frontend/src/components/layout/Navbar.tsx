import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaHistory, FaPlus, FaChevronDown, FaUserAstronaut, FaWallet, FaBars, FaTimes } from 'react-icons/fa';
import Button from '../ui/Button';
import AccountSelector from '../ui/AccountSelector';
import { useContract } from '../../hooks/useContract';
import WalletSelector from '../WalletSelector';

const debug = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Navbar] ${message}`, ...args);
  }
};

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const { 
    selectedAccount, 
    connectWallet, 
    isConnecting, 
    isMinted,
    accounts,
    selectAccount
  } = useContract();
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      const connected = await connectWallet();
      if (connected) {
        // Show wallet selector after successful connection
        setShowWalletSelector(true);
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };
  
  // Handle account selection
  const handleAccountSelected = async (account) => {
    try {
      await selectAccount(account);
      setShowWalletSelector(false);
      
      // After selecting an account, check if they've minted
      // This ensures consistent behavior with the MintPage
      if (location.pathname === '/') {
        debug('Navbar: Checking if account has minted after selection');
      }
    } catch (err) {
      console.error('Failed to select account:', err);
    }
  };
  
  // Handle wallet selector cancellation
  const handleWalletSelectorCancel = () => {
    setShowWalletSelector(false);
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Define navigation items based on user's state
  const getNavigationItems = () => {
    const baseItems = [
      { path: '/', icon: <FaHome />, label: 'Mint' }
    ];
    
    // Only show these items if the user has minted an NFT
    if (isMinted) {
      baseItems.push(
        { path: '/journey', icon: <FaHistory />, label: 'Journey' }
      );
    }
    
    return baseItems;
  };
  
  const navigationItems = getNavigationItems();
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 text-transparent bg-clip-text">Becoming</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`text-sm font-medium transition-colors hover:text-primary-300 ${location.pathname === '/' ? 'text-primary-300' : 'text-gray-300'}`}>
              Mint
            </Link>
            {isMinted && (
              <>
                <Link to="/journey" className={`text-sm font-medium transition-colors hover:text-primary-300 ${location.pathname === '/journey' ? 'text-primary-300' : 'text-gray-300'}`}>
                  Journey
                </Link>
              </>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-300 hover:text-white"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
          
          {/* Account / Connect Button */}
          <div className="hidden md:block">
            {selectedAccount ? (
              <AccountSelector 
                account={selectedAccount} 
                accounts={accounts} 
                onSelect={handleAccountSelected} 
              />
            ) : (
              <Button
                variant="primary"
                onClick={handleConnectWallet}
                disabled={isConnecting}
                size="sm"
              >
                {isConnecting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FaWallet className="mr-2" /> Connect
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 px-4 py-5 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className={`text-base font-medium transition-colors hover:text-primary-300 ${location.pathname === '/' ? 'text-primary-300' : 'text-gray-300'}`}>
              Mint
            </Link>
            {isMinted && (
              <>
                <Link to="/journey" className={`text-base font-medium transition-colors hover:text-primary-300 ${location.pathname === '/journey' ? 'text-primary-300' : 'text-gray-300'}`}>
                  Journey
                </Link>
              </>
            )}
            
            {/* Account / Connect Button for Mobile */}
            <div className="pt-2 border-t border-gray-800">
              {selectedAccount ? (
                <AccountSelector 
                  account={selectedAccount} 
                  accounts={accounts} 
                  onSelect={handleAccountSelected} 
                />
              ) : (
                <Button
                  variant="primary"
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  fullWidth
                >
                  {isConnecting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FaWallet className="mr-2" /> Connect Wallet
                    </span>
                  )}
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
      
      {/* Wallet Selector Modal */}
      {showWalletSelector && (
        <WalletSelector 
          accounts={accounts}
          onSelect={handleAccountSelected}
          onCancel={handleWalletSelectorCancel}
          isLoading={isConnecting}
        />
      )}
    </header>
  );
};

export default Navbar; 