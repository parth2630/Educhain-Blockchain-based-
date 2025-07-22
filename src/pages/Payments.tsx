import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { CreditCard, BookOpen, GraduationCap, Library } from 'lucide-react';
import { getFeePaymentContract } from '../utils/web3';
import { ethers } from 'ethers';

interface ErrorState {
  message: string;
  code?: string;
}

interface PaymentType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

function Payments() {
  const { address, isConnected, provider } = useWallet();
  const [selectedPayment, setSelectedPayment] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address || !provider) {
      setError({ message: 'Please connect your wallet first' });
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const contract = getFeePaymentContract();
      
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const amountInWei = ethers.parseEther(amount);
      
      const tx = await contract.payFee(selectedPayment, {
        value: amountInWei
      });

      await tx.wait();
      setSuccess(true);
      setSelectedPayment('');
      setAmount('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error processing payment';
      setError({ message: errorMessage });
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please connect your wallet</h2>
          <p className="mt-2 text-gray-600">Connect your wallet to make payments</p>
        </div>
      </div>
    );
  }

  const paymentTypes: PaymentType[] = [
    {
      id: 'tuition',
      name: 'Tuition Fee',
      description: 'Regular semester tuition payment',
      icon: BookOpen,
    },
    {
      id: 'library',
      name: 'Library Fee',
      description: 'Annual library membership fee',
      icon: Library,
    },
    {
      id: 'exam',
      name: 'Exam Fee',
      description: 'Semester examination fee',
      icon: GraduationCap,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Make a Payment</h3>
          <div className="mt-5">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="text-base font-medium text-gray-900">Payment Type</label>
                  <p className="text-sm text-gray-500">Select the type of payment you want to make</p>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {paymentTypes.map((paymentType) => (
                      <div
                        key={paymentType.id}
                        className={`relative rounded-lg border p-4 cursor-pointer focus:outline-none ${
                          selectedPayment === paymentType.id
                            ? 'bg-indigo-50 border-indigo-200'
                            : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedPayment(paymentType.id)}
                      >
                        <div className="flex items-center">
                          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-50">
                            <paymentType.icon className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">{paymentType.name}</h4>
                            <p className="mt-1 text-sm text-gray-500">{paymentType.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    {loading ? 'Processing...' : 'Make Payment'}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">Payment successful!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;