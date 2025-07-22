import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  AcademicCapIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useWallet } from '../context/WalletContext';
import University from '../contracts/artifacts/contracts/University.json';

interface Student {
  address: string;
  name: string;
  department: string;
  year: number;
  feesPaid: number;
}

const StudentDashboard: React.FC = () => {
  const { address, provider } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  useEffect(() => {
    if (provider) {
      const setupContract = async () => {
        try {
          const network = await provider.getNetwork();
          setNetwork(network.name);
          
          if (network.chainId !== BigInt(1337)) {
            setError('Please switch to Ganache network (Chain ID: 1337)');
            return;
          }

          const signer = await provider.getSigner();
          setSigner(signer);
          const contract = new ethers.Contract(
            import.meta.env.VITE_CONTRACT_ADDRESS,
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
      const fetchStudentData = async () => {
        try {
          setLoading(true);
          const studentData = await contract.getStudent(address);
          setStudent({
            address: studentData[0],
            name: studentData[1],
            department: studentData[2],
            year: Number(studentData[3]),
            feesPaid: Number(ethers.formatEther(studentData[4]))
          });
        } catch (err) {
          console.error('Error fetching student data:', err);
          setError('Failed to fetch student data');
        } finally {
          setLoading(false);
        }
      };
      fetchStudentData();
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
      const tx = await contract.payFees({ value: amount });
      await tx.wait();
      
      setSuccess('Payment successful!');
      setPaymentAmount('');
      
      // Refresh student data
      const studentData = await contract.getStudent(address);
      setStudent({
        address: studentData[0],
        name: studentData[1],
        department: studentData[2],
        year: Number(studentData[3]),
        feesPaid: Number(ethers.formatEther(studentData[4]))
      });
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

        {/* Student Info Card */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 mb-8 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <ArrowPathIcon className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
          ) : student ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{student.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{student.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Year</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">Year {student.year}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fees Paid</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{student.feesPaid} ETH</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No student data found</p>
          )}
        </div>

        {/* Payment Form */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
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
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0.0"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handlePayment}
                disabled={loading || network !== 'ganache'}
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
      </div>
    </div>
  );
};

export default StudentDashboard; 