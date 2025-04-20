import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WalletSelector from './WalletSelector';

// Mock data
const mockAccounts = [
  {
    address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    meta: {
      name: 'Alice',
      source: 'polkadot-js'
    },
    signer: {}
  },
  {
    address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    meta: {
      name: 'Bob',
      source: 'talisman'
    },
    signer: {}
  },
  {
    address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
    meta: {
      name: 'Charlie',
      source: 'subwallet-js'
    }
  }
];

describe('WalletSelector Component', () => {
  const onSelectMock = vi.fn();
  const onCancelMock = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the wallet selector modal', () => {
    render(
      <WalletSelector
        accounts={mockAccounts}
        onSelect={onSelectMock}
        onCancel={onCancelMock}
      />
    );
    
    expect(screen.getByText('Select Account')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });
  
  it('shows loading state when isLoading is true', () => {
    render(
      <WalletSelector
        accounts={mockAccounts}
        onSelect={onSelectMock}
        onCancel={onCancelMock}
        isLoading={true}
      />
    );
    
    expect(screen.getByText('Loading accounts...')).toBeInTheDocument();
  });
  
  it('shows empty state when accounts array is empty', () => {
    render(
      <WalletSelector
        accounts={[]}
        onSelect={onSelectMock}
        onCancel={onCancelMock}
      />
    );
    
    expect(screen.getByText('No accounts found. Please install and set up the Polkadot.js extension.')).toBeInTheDocument();
    expect(screen.getByText('Get Polkadot.js Extension')).toBeInTheDocument();
  });
  
  it('calls onSelect when an account is clicked', async () => {
    render(
      <WalletSelector
        accounts={mockAccounts}
        onSelect={onSelectMock}
        onCancel={onCancelMock}
      />
    );
    
    const aliceAccount = screen.getByText('Alice');
    fireEvent.click(aliceAccount);
    
    expect(onSelectMock).toHaveBeenCalledWith(mockAccounts[0]);
  });
  
  it('calls onCancel when Cancel button is clicked', async () => {
    render(
      <WalletSelector
        accounts={mockAccounts}
        onSelect={onSelectMock}
        onCancel={onCancelMock}
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(onCancelMock).toHaveBeenCalled();
  });
  
  it('calls onCancel when close icon is clicked', async () => {
    render(
      <WalletSelector
        accounts={mockAccounts}
        onSelect={onSelectMock}
        onCancel={onCancelMock}
      />
    );
    
    // Find the close button (it has an FaTimes icon)
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);
    
    expect(onCancelMock).toHaveBeenCalled();
  });
  
  it('highlights an account that does not have signing capability', () => {
    render(
      <WalletSelector
        accounts={mockAccounts}
        onSelect={onSelectMock}
        onCancel={onCancelMock}
      />
    );
    
    // Check that Charlie's account has the "No signer" indicator
    const noSignerIndicator = screen.getByText('No signer');
    expect(noSignerIndicator).toBeInTheDocument();
  });
}); 