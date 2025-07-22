import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import EmployeeRegistry from '../../artifacts/contracts/EmployeeRegistry.sol/EmployeeRegistry.json';

interface EmployeeFormData {
  publicKey: string;
  name: string;
  department: string;
  username: string;
  password: string;
}

interface EmployeeRegistryContract extends ethers.Contract {
  addEmployee: (
    _employeeAddress: string,
    _name: string,
    _department: string,
    _username: string,
    _password: string
  ) => Promise<ethers.ContractTransaction>;
  getEmployee: (address: string) => Promise<[string, string, string, boolean]>;
  admin: () => Promise<string>;
}

const departments = ['CSE', 'CE', 'IT', 'EXTC'];

const EmployeeAddition: React.FC = () => {
  const { provider, address } = useWallet();
  const [formData, setFormData] = useState<EmployeeFormData>({
    publicKey: '',
    name: '',
    department: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !address) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const contractAddress = import.meta.env.VITE_EMPLOYEE_REGISTRY_ADDRESS;
      if (!contractAddress) {
        throw new Error('Contract address not found in environment variables');
      }

      // Create contract instance
      const contract = new ethers.Contract(
        contractAddress,
        EmployeeRegistry.abi,
        provider
      ) as EmployeeRegistryContract;

      // Get the admin address from the contract
      const adminAddress = await contract.admin();
      console.log('Admin address:', adminAddress);

      // Check if connected wallet is the admin
      if (address.toLowerCase() !== adminAddress.toLowerCase()) {
        throw new Error('Only the admin can add employees');
      }

      // Create contract instance with signer
      const signer = await provider.getSigner();
      const adminContract = contract.connect(signer) as EmployeeRegistryContract;

      // Validate inputs
      if (!ethers.isAddress(formData.publicKey)) {
        throw new Error('Invalid public key address');
      }

      if (!formData.name || !formData.department || !formData.username || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      // Get current gas price and balance
      const [gasPrice, balance] = await Promise.all([
        provider.getFeeData(),
        provider.getBalance(address)
      ]);

      console.log('Current gas price:', gasPrice);
      console.log('Admin balance:', ethers.formatEther(balance), 'ETH');

      // Check if the employee is already registered
      const [_, __, ___, exists] = await contract.getEmployee(formData.publicKey);
      if (exists) {
        throw new Error('Employee is already registered');
      }

      // Add the employee
      const tx = await adminContract.addEmployee(
        formData.publicKey,
        formData.name,
        formData.department,
        formData.username,
        formData.password,
        {
          gasLimit: 500000, // Set a reasonable gas limit
          gasPrice: gasPrice.gasPrice
        }
      );

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();

      if (receipt && receipt.status === 1) {
        setSuccess('Employee added successfully!');
        setFormData({
          publicKey: '',
          name: '',
          department: '',
          username: '',
          password: ''
        });
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Error adding employee:', err);
      if (err.code === 'CALL_EXCEPTION') {
        setError('Failed to add employee: ' + (err.reason || 'Unknown reason'));
      } else if (err.message?.includes('Insufficient ETH balance')) {
        setError(err.message);
      } else if (err.code === 'UNKNOWN_ERROR') {
        setError('Transaction failed. Please check if you have enough ETH for gas fees and try again.');
      } else {
        setError(err.message || 'Failed to add employee. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Employee</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="publicKey" className="block text-sm font-medium text-gray-700">
              Employee Wallet Address
            </label>
            <input
              type="text"
              id="publicKey"
              name="publicKey"
              value={formData.publicKey}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
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
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Adding Employee...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeAddition; 