import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import { 
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface PayrollForm {
  employeeId: string;
  amount: string;
  department: string;
  description: string;
}

const PAYROLL_ABI = [
  'function registerEmployee(string memory employeeId, address employeeAddress) public',
  'function processPayroll(string memory employeeId, uint256 amount, string memory department, string memory description) public payable',
  'function employeeAddresses(string memory) public view returns (address)',
  'function getPayment(string memory employeeId) public view returns (string memory, uint256, string memory, string memory, uint256, bool)'
];

export default function Payroll() {
  const { address, provider } = useWallet();
  const [formData, setFormData] = useState<PayrollForm>({
    employeeId: '',
    amount: '',
    department: '',
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

    if (!formData.employeeId || !formData.amount || !formData.department) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const contractAddress = import.meta.env.VITE_PAYROLL_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Payroll contract address not configured. Please check your .env file.');
      }

      // Create contract instance
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        PAYROLL_ABI,
        signer
      );

      // Check if employee is registered
      const employeeAddress = await contract.employeeAddresses(formData.employeeId);
      if (employeeAddress === ethers.ZeroAddress) {
        // Register employee if not registered
        const registerTx = await contract.registerEmployee(formData.employeeId, address);
        await registerTx.wait();
      }

      // Convert amount to wei
      const amountInWei = ethers.parseEther(formData.amount);
      
      // Send transaction with ETH value
      const tx = await contract.processPayroll(
        formData.employeeId,
        amountInWei,
        formData.department,
        formData.description,
        { value: amountInWei } // Send ETH with the transaction
      );
      await tx.wait();

      setSuccess(true);
      setFormData({
        employeeId: '',
        amount: '',
        department: '',
        description: ''
      });
    } catch (err) {
      console.error('Payroll processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payroll');
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payroll Processed!</h2>
              <p className="text-gray-600 mb-6">The payroll has been processed successfully.</p>
              <button
                onClick={() => setSuccess(false)}
                className="btn btn-primary"
              >
                Process Another Payroll
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className="input w-full pl-10"
                    placeholder="Enter employee ID"
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
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="input w-full pl-10"
                    required
                  >
                    <option value="">Select department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">Human Resources</option>
                    <option value="Operations">Operations</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
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
                    'Process Payroll'
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