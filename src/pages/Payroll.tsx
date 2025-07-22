import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import { BanknotesIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

type PayrollContract = ethers.Contract & {
  sendPayment: (employee: string, overrides?: { value: ethers.BigNumberish }) => Promise<ethers.ContractTransactionResponse>;
  getBalance: () => Promise<ethers.BigNumberish>;
  admin: () => Promise<string>;
};

export default function Payroll() {
  const { address, provider } = useWallet();
  const [employeeAddress, setEmployeeAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !provider) {
      setError('Please connect your wallet first');
      return;
    }

    if (!employeeAddress || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const contractAddress = import.meta.env.VITE_PAYROLL_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Payroll contract address not configured');
      }

      // Convert amount to wei
      const amountInWei = ethers.parseEther(amount);
      
      // Create contract instance
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        ['function sendPayment(address employee) payable', 'function getBalance() view returns (uint256)', 'function admin() view returns (address)'],
        signer
      ) as PayrollContract;

      // Send transaction
      const tx = await contract.sendPayment(employeeAddress, { value: amountInWei });
      await tx.wait();

      setSuccess(true);
      setEmployeeAddress('');
      setAmount('');
    } catch (err) {
      console.error('Payroll processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center mb-6">
            <BanknotesIcon className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">Process Payroll</h1>
          </div>

          {success ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Sent!</h2>
              <p className="text-gray-600 mb-6">The payment has been processed successfully.</p>
              <button
                onClick={() => setSuccess(false)}
                className="btn btn-primary"
              >
                Send Another Payment
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="employeeAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Wallet Address
                </label>
                <input
                  type="text"
                  id="employeeAddress"
                  required
                  value={employeeAddress}
                  onChange={(e) => setEmployeeAddress(e.target.value)}
                  className="input w-full"
                  placeholder="0x..."
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  id="amount"
                  step="0.001"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input w-full"
                  placeholder="0.00"
                />
              </div>

              {error && (
                <div className="flex items-center text-red-600">
                  <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full sm:w-auto"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    'Send Payment'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 