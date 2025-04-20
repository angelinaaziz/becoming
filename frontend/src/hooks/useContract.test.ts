import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContract } from './useContract';

// Mock environment variables
vi.mock('@polkadot/api', () => ({
  ApiPromise: {
    create: vi.fn().mockResolvedValue({
      query: {
        contracts: {
          contractInfoOf: vi.fn(),
        },
      },
      rpc: {
        contracts: {
          call: vi.fn(),
        },
      },
    }),
  },
  WsProvider: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
  })),
}));

vi.mock('@polkadot/api-contract', () => ({
  ContractPromise: vi.fn().mockImplementation(() => ({
    query: {
      getOwner: vi.fn().mockResolvedValue({
        result: { isOk: true },
        output: true,
      }),
      balanceOf: vi.fn().mockResolvedValue({
        result: { isOk: true },
        output: true,
      }),
    },
  })),
}));

vi.mock('./contract-metadata', () => ({
  metadata: { /* mock contract metadata */ },
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Helper function to clear localStorage before each test
const clearLocalStorage = () => {
  const keys = [
    'becoming_nft_minted',
    'becoming_mint_date',
    'becoming_wallet_connected',
    'becoming_selected_account',
    'becoming_token_id',
    'becoming_milestones_',
  ];
  
  keys.forEach(key => {
    localStorage.removeItem(key);
  });
};

describe('useContract Hook (Mock Mode)', () => {
  // Setup/Teardown
  beforeEach(() => {
    clearLocalStorage();
    vi.clearAllMocks();
    // Set mock mode to true to test mock functionality
    vi.stubEnv('VITE_MOCK_MODE', 'true');
    vi.stubEnv('VITE_DEBUG', 'true');
  });
  
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  
  it('should initialize with correct default values in mock mode', async () => {
    const { result } = renderHook(() => useContract());
    
    // Initial values
    expect(result.current.mockMode).toBe(true);
    expect(result.current.selectedAccount).toBe(null);
    expect(result.current.accounts).toEqual([]);
    expect(result.current.isContractReady).toBe(true); // In mock mode, contract is ready immediately
    expect(result.current.isMinted).toBe(false); // Default is not minted
  });
  
  it('should connect wallet in mock mode', async () => {
    const { result } = renderHook(() => useContract());
    
    await act(async () => {
      const success = await result.current.connectWallet();
      expect(success).toBe(true);
    });
    
    // After connecting
    expect(result.current.accounts.length).toBeGreaterThan(0);
    expect(localStorage.getItem('becoming_wallet_connected')).toBe('true');
  });
  
  it('should select an account and store it in localStorage', async () => {
    const { result } = renderHook(() => useContract());
    
    // First connect the wallet to get accounts
    await act(async () => {
      await result.current.connectWallet();
    });
    
    // Then select an account
    const account = result.current.accounts[0];
    await act(async () => {
      await result.current.selectAccount(account);
    });
    
    // Check that account was selected
    expect(result.current.selectedAccount).toEqual(account);
    expect(localStorage.getItem('becoming_selected_account')).toBe(account.address);
  });
}); 