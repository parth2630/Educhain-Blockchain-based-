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
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface FeePaymentForm {
  studentId: string;
  amount: string;
  semester: string;
  description: string;
}

export default function FeePayment() {
  const { address, provider } = useWallet();
  const [formData, setFormData] = useState<FeePaymentForm>({
    studentId: '',
    amount: '',
    semester: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !provider) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.studentId || !formData.amount || !formData.semester) {
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
        import.meta.env.VITE_FEE_PAYMENT_CONTRACT_ADDRESS,
        ['function payFee(string memory studentId, uint256 amount, string memory semester, string memory description)'],
        signer
      );

      // Send transaction
      const tx = await contract.payFee(
        formData.studentId,
        amountInWei,
        formData.semester,
        formData.description
      );
      await tx.wait();

      setSuccess(true);
      setFormData({
        studentId: '',
        amount: '',
        semester: '',
        description: ''
      });
    } catch (err) {
      console.error('Fee payment error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process fee payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center mb-6">
            <BuildingOfficeIcon className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">Fee Payment</h1>
          </div>

          {success ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">Your fee payment has been processed successfully.</p>
              <button
                onClick={() => setSuccess(false)}
                className="btn btn-primary"
              >
                Make Another Payment
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="input w-full pl-10"
                    placeholder="Enter student ID"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
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
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <div className="relative">
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="input w-full pl-10"
                    required
                  >
                    <option value="">Select semester</option>
                    <option value="Spring 2024">Spring 2024</option>
                    <option value="Fall 2024">Fall 2024</option>
                    <option value="Spring 2025">Spring 2025</option>
                    <option value="Fall 2025">Fall 2025</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400" />
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
                    'Submit Payment'
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