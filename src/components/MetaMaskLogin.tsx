import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  WalletIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function MetaMaskLogin() {
  const { connectWallet, disconnectWallet, address, loading } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setError(null);
      await connectWallet();
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  const handleDisconnect = async () => {
    try {
      setError(null);
      await disconnectWallet();
    } catch (err) {
      console.error('Wallet disconnection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <WalletIcon className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Connect Your Wallet
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connect your MetaMask wallet to access the application
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {address ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Connected: {address.slice(0, 6)}...{address.slice(-4)}
                  </h3>
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <button
              onClick={address ? handleDisconnect : handleConnect}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                  {address ? 'Disconnecting...' : 'Connecting...'}
                </div>
              ) : address ? (
                'Disconnect Wallet'
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              Don't have MetaMask?{' '}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-primary-dark"
              >
                Download it here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 