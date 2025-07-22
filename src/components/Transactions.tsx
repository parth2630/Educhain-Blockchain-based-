import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import { 
  ArrowPathIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: 'incoming' | 'outgoing';
}

export default function Transactions() {
  const { address, provider } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!address || !provider) return;

      try {
        setLoading(true);
        setError(null);

        const blockNumber = await provider.getBlockNumber();
        const blocks = await Promise.all(
          Array.from({ length: 10 }, (_, i) => 
            provider.getBlock(blockNumber - i, true)
          )
        );

        const recentTransactions = blocks
          .flatMap(block => {
            if (!block?.transactions) return [];
            return block.transactions
              .filter(tx => typeof tx !== 'string')
              .map(tx => {
                const typedTx = tx as ethers.TransactionResponse;
                const isIncoming = typedTx.to?.toLowerCase() === address.toLowerCase();
                return {
                  hash: typedTx.hash,
                  from: typedTx.from,
                  to: typedTx.to || '',
                  value: ethers.formatEther(typedTx.value),
                  timestamp: block.timestamp,
                  type: isIncoming ? 'incoming' as const : 'outgoing' as const
                };
              })
              .filter(tx => 
                tx.from.toLowerCase() === address.toLowerCase() || 
                tx.to.toLowerCase() === address.toLowerCase()
              );
          })
          .slice(0, 20);

        setTransactions(recentTransactions);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [address, provider]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <ArrowPathIcon className="h-5 w-5 animate-spin text-primary" />
          <span className="text-gray-600">Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center text-red-600 mb-4">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Transaction History</h1>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary flex items-center"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr 
                    key={tx.hash}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTx(tx)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {tx.type === 'incoming' ? (
                          <ArrowDownIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowUpIcon className="h-5 w-5 text-red-500" />
                        )}
                        <span className="ml-2 text-sm text-gray-500 capitalize">
                          {tx.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.value} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.timestamp * 1000).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedTx && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Transaction Details</h2>
                  <button
                    onClick={() => setSelectedTx(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Hash</label>
                    <p className="mt-1 text-sm text-gray-900 break-all">{selectedTx.hash}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">From</label>
                    <p className="mt-1 text-sm text-gray-900 break-all">{selectedTx.from}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">To</label>
                    <p className="mt-1 text-sm text-gray-900 break-all">{selectedTx.to}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Value</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTx.value} ETH</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Time</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedTx.timestamp * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 