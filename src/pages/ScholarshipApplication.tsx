import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import Scholarship from '../contracts/artifacts/contracts/Scholarship.json';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const departments = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering'];

const ScholarshipApplication: React.FC = () => {
  const { address, provider } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    yearOfStudy: '1',
    reason: '',
    amount: ''
  });

  useEffect(() => {
    if (provider) {
      const setupContract = async () => {
        try {
          const signer = await provider.getSigner();
          setSigner(signer);
          const contract = new ethers.Contract(
            CONTRACT_ADDRESSES.SCHOLARSHIP,
            Scholarship.abi,
            signer
          );
          setContract(contract);
        } catch (err) {
          console.error('Error setting up contract:', err);
          setError('Failed to setup contract connection');
        }
      };
      setupContract();
    }
  }, [provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
        if (!window.ethereum) {
            throw new Error('Please install MetaMask');
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
            CONTRACT_ADDRESSES.SCHOLARSHIP,
            Scholarship.abi,
            signer
        );

        // Convert amount to Wei
        const amountInWei = ethers.parseEther(formData.amount);

        // Submit the application with all required parameters
        const tx = await contract.submitApplication(
            formData.name,
            formData.department,
            parseInt(formData.yearOfStudy),
            formData.reason,
            amountInWei
        );
        await tx.wait();

        setSuccess('Scholarship application submitted successfully!');
        setFormData({
            name: '',
            department: '',
            yearOfStudy: '',
            reason: '',
            amount: ''
        });
    } catch (err) {
        console.error('Error submitting application:', err);
        setError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Scholarship Application</h1>
          
          {error && (
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select your department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="yearOfStudy" className="block text-sm font-medium text-gray-700">
                Year of Study
              </label>
              <select
                id="yearOfStudy"
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                Reason for Scholarship
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Please explain why you need the scholarship"
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Requested Amount (ETH)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.1"
                step="0.1"
                placeholder="0.0"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !address}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipApplication; 