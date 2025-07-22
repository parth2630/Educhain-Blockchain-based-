import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers, BigNumberish } from 'ethers';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, CreditCardIcon, UserIcon, IdentificationIcon, BuildingOfficeIcon, EnvelopeIcon, ChartBarIcon } from '@heroicons/react/24/outline';

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
  value: BigNumberish;
}

const Dashboard: React.FC = () => {
  const { address, provider } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [feePaymentStatus, setFeePaymentStatus] = useState<string>('Paid');
  const [scholarshipStatus, setScholarshipStatus] = useState<string>('Active');

  const getBalance = useCallback(async () => {
    if (!address || !provider) {
      setError('Wallet not connected');
      setLoading(false);
      return;
    }
    
    try {
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
      setError(null);
    } catch (error) {
      console.error('Error getting balance:', error);
      setError('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }, [address, provider]);

  const getTransactions = useCallback(async () => {
    if (!address || !provider) {
      console.log('No address or provider available');
      return;
    }

    try {
      const blockNumber = await provider.getBlockNumber();
      const latestBlock = Math.min(blockNumber, 10); // Get last 10 blocks

      const txList: Transaction[] = [];
      for (let i = latestBlock; i > 0; i--) {
        try {
        const block = await provider.getBlock(i, true);
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (typeof tx === 'string') continue;
            const typedTx = tx as BlockTransaction;
            if (typedTx.from.toLowerCase() === address.toLowerCase() || 
                typedTx.to?.toLowerCase() === address.toLowerCase()) {
              txList.push({
                hash: typedTx.hash,
                from: typedTx.from,
                to: typedTx.to || null,
                value: ethers.formatEther(typedTx.value),
                timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString()
              });
            }
          }
          }
        } catch (blockError) {
          console.error(`Error fetching block ${i}:`, blockError);
          continue; // Skip this block and continue with others
        }
      }
      setTransactions(txList);
    } catch (error) {
      console.error('Error in getTransactions:', error);
      setError('Failed to fetch transactions. Please check your network connection and try again.');
    }
  }, [address, provider]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          getBalance(),
          getTransactions()
        ]);
      } catch (error) {
        console.error('Error in useEffect:', error);
        setError('Failed to load dashboard data. Please try again later.');
      }
    };

    fetchData();
  }, [getBalance, getTransactions]);

  // Mock student data - replace with actual data from your backend/context
  const studentDetails = {
    name: 'John Doe',
    rollNo: '2023001',
    department: 'Computer Science',
    email: 'john.doe@university.edu'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Student Details Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Student Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-lg font-semibold text-gray-900">{studentDetails.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <IdentificationIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Roll No</p>
                    <p className="text-lg font-semibold text-gray-900">{studentDetails.rollNo}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-lg font-semibold text-gray-900">{studentDetails.department}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{studentDetails.email}</p>
            </div>
            </div>
          </div>
        </div>
      </div>

          {/* Quick Actions Section */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Pay Fees Card */}
              <Link
                to="/fee-payment"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300 hover:bg-indigo-50"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCardIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                Pay Fees
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-semibold text-indigo-600">
                          Make fee payments
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              </Link>

            {/* Scholarship Card */}
              <Link
                to="/scholarship"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300 hover:bg-indigo-50"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Scholarship
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-semibold text-indigo-600">
                          View scholarship status
            </div>
                      </dd>
                    </dl>
          </div>
        </div>
              </div>
            </Link>

            {/* Transaction History Card */}
            <Link
              to="/transactions"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300 hover:bg-indigo-50"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Transaction History
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-semibold text-indigo-600">
                          View all transactions
              </div>
                      </dd>
                    </dl>
            </div>
          </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;