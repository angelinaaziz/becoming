import { useState, useEffect, useRef } from 'react';
import Button from './ui/Button';
import { formatAddress } from '../utils/formatting';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaWallet, FaInfoCircle } from 'react-icons/fa';

type Account = {
  address: string;
  meta: {
    name?: string;
    source?: string;
  };
  signer?: any;
};

interface WalletSelectorProps {
  accounts: Account[];
  onSelect: (account: Account) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const WalletSelector: React.FC<WalletSelectorProps> = ({ 
  accounts, 
  onSelect, 
  onCancel, 
  isLoading 
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close the modal when clicking outside of it
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onCancel();
    }
  };

  // Close the modal when pressing escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onCancel]);

  const handleSelect = (account: Account, index: number) => {
    setSelectedIndex(index);
    onSelect(account);
  };

  // Format the address to be more readable
  const displayAddress = (address: string) => {
    return formatAddress(address, 8);
  };

  // Get the icon to use for the wallet based on the source
  const getWalletIcon = (source?: string) => {
    switch (source?.toLowerCase()) {
      case 'polkadot-js':
        return (
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white">
            P
          </div>
        );
      case 'subwallet-js':
        return (
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
            S
          </div>
        );
      case 'talisman':
        return (
          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white">
            T
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white">
            <FaWallet className="text-sm" />
          </div>
        );
    }
  };

  // Check if account has signer capability
  const hasSigningCapability = (account: Account) => {
    return !!account.signer;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      ref={overlayRef} 
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FaWallet className="mr-2 text-primary-400" /> Select Account
          </h2>
          <button 
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-2 transition-colors"
            onClick={onCancel}
          >
            <FaTimes />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-300">Loading accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaInfoCircle className="text-primary-400 text-2xl" />
            </div>
            <p className="text-gray-300 mb-6">No accounts found. Please install and set up the Polkadot.js extension.</p>
            <Button
              variant="primary"
              onClick={() => window.open('https://polkadot.js.org/extension/', '_blank', 'noopener,noreferrer')}
            >
              Get Polkadot.js Extension
            </Button>
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto py-2">
            {accounts.map((account, index) => (
              <motion.div 
                key={account.address}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`mx-2 my-1.5 p-3 rounded-lg cursor-pointer transition-all
                  ${hasSigningCapability(account) 
                    ? 'hover:bg-primary-900/30 group' 
                    : 'hover:bg-red-900/20 border-l-2 border-red-600'}
                  ${selectedIndex === index ? 'bg-primary-900/40 ring-1 ring-primary-500' : 'bg-gray-800/60'}`}
                onClick={() => handleSelect(account, index)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getWalletIcon(account.meta.source)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-primary-300 transition-colors">
                      {account.meta.name || "Unnamed Account"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {displayAddress(account.address)}
                    </p>
                  </div>
                  {!hasSigningCapability(account) && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-900/30 text-red-400">
                        No signer
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="bg-gray-800/50 p-5 border-t border-gray-800">
          <div className="bg-primary-900/30 rounded-lg p-4 border border-primary-800/50 mb-4">
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-primary-300">Important:</span> Select the account you want to use with this application. Accounts without signing capability will not be able to perform transactions.
            </p>
          </div>
          <Button
            variant="outline"
            fullWidth
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletSelector; 