import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
}

// Extend the Window interface
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface WalletContextType {
  address: string | null;
  provider: ethers.BrowserProvider | null;
  loading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  provider: null,
  loading: false,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
});

export const useWallet = () => {
  const context = useContext(WalletContext);
  console.log('Wallet Context State:', {
    address: context.address,
    hasProvider: !!context.provider,
    loading: context.loading
  });
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    console.log('Accounts changed:', accounts);
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      setAddress(null);
      setProvider(null);
    } else if (accounts[0] !== address) {
      setAddress(accounts[0]);
    }
  }, [address]);

  useEffect(() => {
    console.log('Setting up wallet listeners');
    if (window.ethereum?.on) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [handleAccountsChanged]);

  const connectWallet = async () => {
    console.log('Attempting to connect wallet...');
    
    if (!window.ethereum) {
      console.error('MetaMask not detected');
      alert('Please install MetaMask to use this feature.');
      return;
    }

    try {
      setLoading(true);
      console.log('Requesting accounts...');
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Accounts received:', accounts);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider
      console.log('Creating provider...');
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get network
      console.log('Getting network...');
      const network = await web3Provider.getNetwork();
      console.log('Current network:', network);

      // Set provider and address
      setProvider(web3Provider);
      setAddress(accounts[0]);
      
      // Store connection state
      localStorage.setItem('walletConnected', 'true');
      
      console.log('Wallet connected successfully:', {
        address: accounts[0],
        network: network.name
      });
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (localStorage.getItem('walletConnected') === 'true' && window.ethereum) {
        try {
          setLoading(true);
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(web3Provider);
            setAddress(accounts[0]);
          }
        } catch (err) {
          console.error('Error auto-connecting wallet:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    autoConnect();
  }, []);

  const disconnectWallet = async () => {
    try {
      setLoading(true);
      setAddress(null);
      setProvider(null);
      localStorage.removeItem('walletConnected');
      window.dispatchEvent(new Event('walletDisconnected'));
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      alert('Failed to disconnect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider value={{ address, provider, loading, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};