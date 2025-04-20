import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContract } from '../hooks/useContract';
import { formatAddress } from '../utils/formatting';

const Header: React.FC = () => {
  const { selectedAccount, resetMockState, mockMode } = useContract();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your mock state? This will clear your mint status and require you to mint again.')) {
      resetMockState(false); // Reset without auto-mint
      // Refresh the page to ensure all components update
      window.location.reload();
    }
    setShowDropdown(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-950/70 backdrop-blur-md z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-primary-400 text-xl font-bold">Becoming</Link>
        
        <div className="flex items-center gap-4">
          {mockMode && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors flex items-center"
              >
                <span>Development</span>
                <svg 
                  className={`ml-1 h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-1 w-60 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                  <div className="p-2 border-b border-gray-700 text-xs text-gray-400">
                    Development Options
                  </div>
                  <div className="p-1">
                    <button 
                      onClick={handleReset}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 text-gray-300 rounded"
                    >
                      Reset Development State
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {selectedAccount && (
            <div className="text-gray-300 text-sm bg-gray-800/60 py-1 px-3 rounded-full">
              {formatAddress(selectedAccount.address)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 