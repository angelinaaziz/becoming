import '@testing-library/jest-dom';

// Mock environment variables
window.ENV = {
  VITE_MOCK_MODE: 'true',
  VITE_CONTRACT_ADDRESS: '5Gy5UGvmGAPjhtiASNBhCPVzi1MnqwFXmaxLb13aSFC1FyRZ',
  VITE_WS_PROVIDER: 'wss://westend-contracts-rpc.polkadot.io',
  VITE_DEBUG: 'true',
  VITE_CONTRACTS_CHAIN_NAME: 'Westend Contracts',
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock canvas
Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock web3 related libraries
vi.mock('@polkadot/extension-dapp', () => ({
  web3Accounts: vi.fn().mockResolvedValue([]),
  web3Enable: vi.fn().mockResolvedValue([{ name: 'polkadot-js' }]),
  web3FromSource: vi.fn().mockResolvedValue({
    signer: {
      signPayload: vi.fn().mockResolvedValue({ signature: '0x123' }),
    },
  }),
})); 