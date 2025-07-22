import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import StudentRegistry from '../contracts/artifacts/contracts/StudentRegistry.json';
import { CONTRACT_ADDRESSES } from '../config/contracts';

interface FormData {
  publicKey: string;
  name: string;
  rollNo: string;
  department: string;
  username: string;
  password: string;
}

type StudentRegistryContract = ethers.Contract & {
  registerStudent: ethers.ContractMethod<[
    string, // studentAddress
    string, // name
    string, // rollNo
    string, // department
    string, // username
    string  // password
  ], ethers.ContractTransactionResponse>;
  isStudent: ethers.ContractMethod<[string], boolean>;
  isRollNoTaken: ethers.ContractMethod<[string], boolean>;
  isUsernameTaken: ethers.ContractMethod<[string], boolean>;
  admin: ethers.ContractMethod<[], string>;
};

const departments = ['CSE', 'CE', 'IT', 'EXTC'];

const StudentRegistration: React.FC = () => {
  const { provider, address } = useWallet();
  const [formData, setFormData] = useState<FormData>({
    publicKey: '',
    name: '',
    rollNo: '',
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

      const contractAddress = CONTRACT_ADDRESSES.STUDENT_REGISTRY;
      console.log('Contract address from config:', contractAddress);

      // Verify contract deployment
      console.log('Verifying contract deployment...');
      try {
        const code = await provider.getCode(contractAddress);
        console.log('Contract code length:', code.length);
        if (code === '0x') {
          throw new Error('No contract code found at the specified address. Please ensure the contract is properly deployed.');
        }
      } catch (err) {
        console.error('Error verifying contract deployment:', err);
        throw new Error('Failed to verify contract deployment. Please check the contract address and network.');
      }

      // Validate student address format
      if (!formData.publicKey) {
        throw new Error('Student wallet address is required');
      }

      let checksumAddress: string;
      try {
        // Try to get the checksum address
        checksumAddress = ethers.getAddress(formData.publicKey);
        console.log('Valid student address:', checksumAddress);
        // Update form data with checksum address
        setFormData(prev => ({ ...prev, publicKey: checksumAddress }));
      } catch (err) {
        console.error('Invalid student address:', err);
        throw new Error('Invalid student wallet address format. Please enter a valid Ethereum address.');
      }

      // Validate other inputs
      if (!formData.name || !formData.rollNo || !formData.department || !formData.username || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      // Validate string lengths
      if (formData.name.length > 50) {
        throw new Error('Name must be less than 50 characters');
      }
      if (formData.rollNo.length > 10) {
        throw new Error('Roll number must be less than 10 characters');
      }
      if (formData.department.length > 20) {
        throw new Error('Department must be less than 20 characters');
      }
      if (formData.username.length > 20) {
        throw new Error('Username must be less than 20 characters');
      }
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Create contract instance
      console.log('Creating contract instance with address:', contractAddress);
      const contract = new ethers.Contract(
        contractAddress,
        StudentRegistry.abi,
        provider
      ) as unknown as StudentRegistryContract;

      // Get current gas price and balance
      console.log('Fetching gas price and balance...');
      const [feeData, balance] = await Promise.all([
        provider.getFeeData(),
        provider.getBalance(address)
      ]);

      // Ensure we have valid gas price data
      if (!feeData.gasPrice) {
        throw new Error('Unable to fetch current gas price. Please try again later.');
      }

      console.log('Current gas price:', feeData.gasPrice.toString());
      console.log('Admin balance:', ethers.formatEther(balance), 'ETH');

      // Create contract instance with signer
      console.log('Creating contract instance with signer...');
      const signer = await provider.getSigner();
      const adminContract = contract.connect(signer) as unknown as StudentRegistryContract;

      // Check contract state before proceeding
      console.log('Checking contract state...');
      try {
        // First, check if we can get the admin address
        console.log('Fetching admin address...');
        const currentAdmin = await contract.admin();
        console.log('Current admin:', currentAdmin);
        
        if (typeof currentAdmin !== 'string') {
          throw new Error('Invalid admin address returned from contract');
        }

        if (currentAdmin.toLowerCase() !== address.toLowerCase()) {
          throw new Error('Only the admin can register students');
        }

        // Then check student registration
        console.log('Checking if student is registered...');
        try {
          const isStudent = await contract.isStudent(checksumAddress);
          console.log('Is student registered:', isStudent);
          if (isStudent) {
            throw new Error('Student is already registered');
          }
        } catch (err: any) {
          if (err.code === 'CALL_EXCEPTION' && err.reason === 'require(false)') {
            // This means the student is not registered, which is what we want
            console.log('Student is not registered, continuing with registration');
          } else {
            throw err;
          }
        }

        // Check roll number
        console.log('Checking if roll number is taken...');
        try {
          const isRollNoTaken = await contract.isRollNoTaken(formData.rollNo);
          console.log('Is roll number taken:', isRollNoTaken);
          if (isRollNoTaken) {
            throw new Error('Roll number is already taken');
          }
        } catch (err: any) {
          if (err.code === 'CALL_EXCEPTION' && err.reason === 'require(false)') {
            // This means the roll number is not taken, which is what we want
            console.log('Roll number is not taken, continuing with registration');
          } else {
            throw err;
          }
        }

        // Check username
        console.log('Checking if username is taken...');
        try {
          const isUsernameTaken = await contract.isUsernameTaken(formData.username);
          console.log('Is username taken:', isUsernameTaken);
          if (isUsernameTaken) {
            throw new Error('Username is already taken');
          }
        } catch (err: any) {
          if (err.code === 'CALL_EXCEPTION' && err.reason === 'require(false)') {
            // This means the username is not taken, which is what we want
            console.log('Username is not taken, continuing with registration');
          } else {
            throw err;
          }
        }

        // Register the student with a fixed gas limit
        console.log('Registering student with data:', {
          publicKey: checksumAddress,
          name: formData.name,
          rollNo: formData.rollNo,
          department: formData.department,
          username: formData.username,
          password: '***' // Don't log the actual password
        });

        try {
          // First, try to estimate gas
          console.log('Estimating gas for registration...');
          const estimatedGas = await adminContract.registerStudent.estimateGas(
            checksumAddress,
            formData.name,
            formData.rollNo,
            formData.department,
            formData.username,
            formData.password
          );
          console.log('Estimated gas:', estimatedGas.toString());

          // Add 20% buffer to the estimated gas
          const gasLimit = BigInt(estimatedGas) * BigInt(120) / BigInt(100);
          console.log('Gas limit with buffer:', gasLimit.toString());

          // Calculate total cost with buffer
          const totalCost = BigInt(feeData.gasPrice) * gasLimit;
          console.log('Estimated total cost:', ethers.formatEther(totalCost), 'ETH');

          // Check if balance is sufficient (with 10% buffer)
          const requiredBalance = totalCost * BigInt(110) / BigInt(100);
          if (BigInt(balance) < requiredBalance) {
            throw new Error(
              `Insufficient ETH balance. Required: ${ethers.formatEther(requiredBalance)} ETH, Available: ${ethers.formatEther(balance)} ETH`
            );
          }

          // Send the transaction with the calculated gas limit
          console.log('Sending registration transaction...');
          const tx = await adminContract.registerStudent(
            checksumAddress,
            formData.name,
            formData.rollNo,
            formData.department,
            formData.username,
            formData.password,
            {
              gasLimit: gasLimit,
              gasPrice: feeData.gasPrice,
              nonce: await signer.getNonce()
            }
          );

          console.log('Transaction sent:', tx.hash);
          const receipt = await tx.wait();

          if (receipt && receipt.status === 1) {
            setSuccess('Student registered successfully!');
            setFormData({
              publicKey: '',
              name: '',
              rollNo: '',
              department: '',
              username: '',
              password: ''
            });
          } else {
            throw new Error('Transaction failed');
          }
        } catch (err: any) {
          console.error('Error in registration process:', err);
          if (err.code === 'CALL_EXCEPTION') {
            console.error('Contract call exception details:', {
              code: err.code,
              reason: err.reason,
              data: err.data,
              transaction: err.transaction
            });
            
            if (err.reason === 'require(false)') {
              setError('Transaction failed. Please check if all fields are valid and try again.');
            } else {
              setError('Failed to register student. Please ensure the contract is properly deployed and accessible.');
            }
          } else if (err.code === -32603) {
            console.error('RPC error details:', {
              code: err.code,
              message: err.message,
              data: err.data
            });
            setError('Transaction failed. Please check your wallet connection and try again.');
          } else if (err.message?.includes('Insufficient ETH balance')) {
            setError(err.message);
          } else {
            setError(err.message || 'Failed to register student. Please try again.');
          }
        } finally {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error in registration process:', err);
        setError(err.message || 'Failed to register student. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error in registration process:', err);
      setError(err.message || 'Failed to register student. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Register New Student</h2>
        
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
              Student Wallet Address
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
            <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700">
              Roll Number
            </label>
            <input
              type="text"
              id="rollNo"
              name="rollNo"
              value={formData.rollNo}
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
              {loading ? 'Registering Student...' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration; 