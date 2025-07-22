import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import { 
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface PaymentForm {
  recipient: string;
  amount: string;
  description: string;
}

export default function Payments() {
  const { address, provider } = useWallet();
  const [formData, setFormData] = useState<PaymentForm>({
    recipient: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !provider) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.recipient || !formData.amount) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert amount to wei
      const amountInWei = ethers.parseEther(formData.amount);
      
      // Create contract instance
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_PAYMENTS_CONTRACT_ADDRESS,
        ['function sendPayment(address recipient, uint256 amount, string memory description)'],
        signer
      );

      // Send transaction
      const tx = await contract.sendPayment(
        formData.recipient,
        amountInWei,
        formData.description
      );
      await tx.wait();

      setSuccess(true);
      setFormData({
        recipient: '',
        amount: '',
        description: ''
      });
    } catch (err) {
      console.error('Payment error:', err);
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
            <CreditCardIcon className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">Send Payment</h1>
          </div>

          {success ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Sent!</h2>
              <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
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
                <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="recipient"
                    name="recipient"
                    value={formData.recipient}
                    onChange={handleChange}
                    className="input w-full pl-10"
                    placeholder="0x..."
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (ETH)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="input w-full pl-10 pr-12"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-500 sm:text-sm">ETH</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input w-full pl-10"
                    placeholder="Add any additional notes"
                    rows={3}
                  />
                  <div className="absolute top-0 left-0 pl-3 pt-3 pointer-events-none">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
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