import React, { useState } from 'react';
import Button from './Button';
import { FaUser, FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaInfoCircle, FaCode } from 'react-icons/fa';
import { useContract } from '../../hooks/useContract';

interface AccountSelectorProps {
  account: any;
  accounts?: any[];
  onSelect?: (account: any) => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ 
  account, 
  accounts = [], 
  onSelect = () => {} 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mockMode, isMinted } = useContract();
  
  const handleSelectAccount = (selectedAccount: any) => {
    onSelect(selectedAccount);
    setIsOpen(false);
  };
  
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Handle explorer click
  const openExplorer = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    // Replace with your actual explorer URL
    window.open(`https://polkadot.subscan.io/account/${address}`, '_blank');
  };

  // Status badge color
  const getStatusColor = () => {
    if (mockMode) return "bg-amber-500"; // Mock mode - amber/yellow
    if (isMinted) return "bg-green-500"; // Real mode, minted - green
    return "bg-blue-500"; // Real mode, not minted - blue
  };
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[200px] justify-between"
      >
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()} mr-2`}></div>
          <span className="truncate">
            {account.meta?.name || 'Account'}
          </span>
        </div>
        <span className="text-xs opacity-60 truncate">
          {formatAddress(account.address)}
        </span>
        {isOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-md shadow-lg z-50 border border-gray-700 overflow-hidden">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700 flex justify-between items-center">
              <span>Your Account</span>
              {mockMode && (
                <span className="bg-amber-800 text-amber-300 text-xs px-2 py-0.5 rounded-full flex items-center">
                  <FaCode className="mr-1" size={10} />
                  Mock Mode
                </span>
              )}
            </div>
            
            <div className="px-4 py-3 text-sm border-b border-gray-700">
              <div className="text-white font-medium mb-1">{account.meta?.name || 'Account'}</div>
              <div className="flex items-center justify-between text-gray-400">
                <span>{formatAddress(account.address)}</span>
                <button 
                  onClick={(e) => openExplorer(e, account.address)}
                  className="text-primary-400 hover:text-primary-300"
                >
                  <FaExternalLinkAlt size={12} />
                </button>
              </div>
              
              {/* Account Status */}
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="flex items-center text-xs">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor()} mr-2`}></div>
                  <span>
                    {mockMode 
                      ? "Mock Mode Enabled" 
                      : isMinted 
                        ? "NFT Minted" 
                        : "No NFT Minted"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Navigation Hint */}
            <div className="px-4 py-2 text-xs text-amber-300 bg-amber-900/30 border-b border-gray-700 flex items-start">
              <FaInfoCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>
                {isMinted 
                  ? "You can access your journey and add milestones" 
                  : "Mint an NFT first to access your journey"}
              </span>
            </div>
            
            {accounts.length > 1 && (
              <>
                <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                  Switch Account
                </div>
                {accounts.filter(acc => acc.address !== account.address).map((otherAccount, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    onClick={() => handleSelectAccount(otherAccount)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
                        <span>{otherAccount.meta?.name || 'Account'}</span>
                      </div>
                      <span className="text-xs opacity-60 truncate">
                        {formatAddress(otherAccount.address)}
                      </span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSelector; 