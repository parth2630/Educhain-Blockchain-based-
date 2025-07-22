import React, { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';

interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  timestamp: string;
}

interface BlockTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: ethers.BigNumberish;
}

interface ErrorState {
  message: string;
  code?: string;
}

function Transactions() {
  const { address, provider } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!provider) {
          throw new Error('Provider not initialized');
        }

        // Get the current account
        const signer = await provider.getSigner();
        const currentAccount = await signer.getAddress();

        // Get recent transactions
        const blockNumber = await provider.getBlockNumber();
        const recentBlocks = 10; // Get last 10 blocks
        
        const txList: Transaction[] = [];
        for (let i = blockNumber; i > blockNumber - recentBlocks; i--) {
          const block = await provider.getBlock(i, true);
          if (block && block.transactions) {
            for (const tx of block.transactions) {
              if (typeof tx === 'string') continue;
              const typedTx = tx as BlockTransaction;
              if (typedTx.from.toLowerCase() === currentAccount.toLowerCase() || 
                  typedTx.to?.toLowerCase() === currentAccount.toLowerCase()) {
                txList.push({
                  hash: typedTx.hash,
                  from: typedTx.from,
                  to: typedTx.to,
                  value: ethers.formatEther(typedTx.value),
                  timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString()
                });
              }
            }
          }
        }
        
        setTransactions(txList);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError({ message: 'Failed to fetch transactions' });
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchTransactions();
    }
  }, [address, provider]);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.value.includes(searchQuery) ||
    transaction.timestamp.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading transactions</h3>
              <p className="mt-2 text-sm text-red-700">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Transaction History</h1>
          <p className="mt-2 text-sm text-gray-700">
            A complete list of all your transactions including payments and receipts.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <div className="bg-white px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center">
                    <div className="relative rounded-md shadow-sm flex-1 max-w-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.hash}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.hash.slice(0, 10)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.from.slice(0, 10)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.to?.slice(0, 10) || 'Contract Creation'}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.value} ETH
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transactions;