import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { ScholarshipABI } from '../contracts/Scholarship';
import { CONTRACT_ADDRESSES } from '../config/contracts';

const departments = ['CSE', 'CE', 'IT', 'EXTC'];

const Scholarship = () => {
  const { address, provider } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    reason: ''
  });

  useEffect(() => {
    if (provider) {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.SCHOLARSHIP,
        ScholarshipABI,
        provider
      );
      setContract(contract);
    }
  }, [provider]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (contract && address) {
        try {
          const balance = await contract.getScholarshipBalance(address);
          setBalance(ethers.formatEther(balance));
        } catch (err) {
          console.error('Error fetching balance:', err);
        }
      }
    };

    fetchBalance();
  }, [contract, address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !address) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const signer = await provider?.getSigner();
      const contractWithSigner = contract.connect(signer!);

      const tx = await contractWithSigner.submitApplication(
        formData.name,
        formData.department,
        1, // Default year to 1 since it's required by contract
        formData.reason,
        ethers.parseEther('0') // Default amount to 0 since it's required by contract
      );

      await tx.wait();
      setSuccess('Application submitted successfully!');
      setFormData({
        name: '',
        department: '',
        reason: ''
      });
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!contract || !address) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const signer = await provider?.getSigner();
      const contractWithSigner = contract.connect(signer!);

      const balance = await contract.getScholarshipBalance(address);
      const tx = await contractWithSigner.withdrawScholarship(balance);
      await tx.wait();

      setSuccess('Scholarship withdrawn successfully!');
      setBalance('0');
    } catch (err: any) {
      console.error('Error withdrawing scholarship:', err);
      setError(err.message || 'Failed to withdraw scholarship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Scholarship Application</h1>
          
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 border border-red-200 shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
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
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{success}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Wallet</h2>
              <p className="text-sm text-gray-500 mb-2">Address: {address || 'Not connected'}</p>
              <p className="text-sm text-gray-500">Scholarship Balance: {balance} ETH</p>
              {parseFloat(balance) > 0 && (
                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Withdrawing...' : 'Withdraw Scholarship'}
                </button>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Submit Application</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                    Reason for Scholarship
                  </label>
                  <textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !address}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scholarship; 