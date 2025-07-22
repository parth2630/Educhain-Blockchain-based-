import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  CurrencyDollarIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useWallet } from '../context/WalletContext';
import University from '../contracts/artifacts/contracts/University.json';
import { CONTRACT_ADDRESSES } from '../config/contracts';

interface Payment {
  amount: number;
  timestamp: number;
}

const FeePayment: React.FC = () => {
  const { address, provider } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('1');
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);

  useEffect(() => {
    if (provider) {
      const setupContract = async () => {
        try {
          const network = await provider.getNetwork();
          console.log('Current network:', network);
          setNetwork(network.name);
          
          if (network.chainId !== BigInt(1337) && network.chainId !== BigInt(5777)) {
            setError('Please switch to Ganache network (Chain ID: 1337 or 5777)');
            return;
          }

          const signer = await provider.getSigner();
          setSigner(signer);
          const contract = new ethers.Contract(
            CONTRACT_ADDRESSES.STUDENT_REGISTRY,
            University.abi,
            signer
          );
          setContract(contract);
          setError(null);
        } catch (err) {
          console.error('Error setting up contract:', err);
          setError('Failed to setup contract connection');
        }
      };
      setupContract();
    }
  }, [provider]);

  useEffect(() => {
    if (contract && address) {
      const fetchPaymentHistory = async () => {
        try {
          setLoading(true);
          const filter = contract.filters.FeePaid(address);
          const events = await contract.queryFilter(filter);
          const payments = events.map(event => ({
            amount: Number(ethers.formatEther(event.args?.amount || 0)),
            timestamp: Number(event.args?.timestamp || 0)
          }));
          setPaymentHistory(payments);
        } catch (err) {
          console.error('Error fetching payment history:', err);
          setError('Failed to fetch payment history');
        } finally {
          setLoading(false);
        }
      };
      fetchPaymentHistory();
    }
  }, [contract, address]);

  const handlePayment = async () => {
    if (!signer || !contract) {
      setError('Please ensure wallet is connected');
      return;
    }

    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const amount = ethers.parseEther(paymentAmount);
      const tx = await contract.payFee("Tuition Fee", { value: amount });
      await tx.wait();
      
      setSuccess('Payment successful!');
      setPaymentAmount('');
      
      // Refresh payment history
      const filter = contract.filters.FeePaid(address);
      const events = await contract.queryFilter(filter);
      const payments = events.map(event => ({
        amount: Number(ethers.formatEther(event.args?.amount || 0)),
        timestamp: Number(event.args?.timestamp || 0)
      }));
      setPaymentHistory(payments);
    } catch (err: any) {
      console.error('Payment error:', err);
      if (err.message.includes('insufficient funds')) {
        setError('Insufficient funds for payment');
      } else if (err.message.includes('user rejected')) {
        setError('Transaction rejected by user');
      } else {
        setError('Failed to process payment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Network Warning */}
        {error && error.includes('Please switch to Ganache network') && (
          <div className="mb-4 rounded-lg bg-yellow-50 p-4 border border-yellow-200 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Error and Success Messages */}
        {error && !error.includes('Please switch to Ganache network') && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 border border-red-200 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 border border-green-200 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{success}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Make Payment</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">
                Amount (ETH)
              </label>
              <input
                type="text"
                id="paymentAmount"
                value={paymentAmount}
                readOnly
                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm cursor-not-allowed"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handlePayment}
                disabled={loading || !contract || !signer}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay Fees'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <ArrowPathIcon className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
          ) : paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount (ETH)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentHistory.map((payment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.timestamp * 1000).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No payment history found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeePayment; 