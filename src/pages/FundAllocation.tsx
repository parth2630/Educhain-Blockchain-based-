import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { ChartBarIcon, CurrencyDollarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface FundAllocation {
  id: string;
  department: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export default function FundAllocation() {
  const { address } = useWallet();
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<FundAllocation[]>([
    {
      id: '1',
      department: 'Computer Science',
      amount: 50000,
      purpose: 'Research Equipment',
      status: 'pending',
      date: '2024-03-15'
    },
    {
      id: '2',
      department: 'Engineering',
      amount: 75000,
      purpose: 'Lab Renovation',
      status: 'approved',
      date: '2024-03-10'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAllocations(prev => prev.map(allocation => 
        allocation.id === id ? { ...allocation, status: 'approved' } : allocation
      ));
    } catch (error) {
      console.error('Error approving allocation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAllocations(prev => prev.map(allocation => 
        allocation.id === id ? { ...allocation, status: 'rejected' } : allocation
      ));
    } catch (error) {
      console.error('Error rejecting allocation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fund Allocation Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and approve fund allocation requests from different departments
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">
                  Connected as: {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocations.map((allocation) => (
                  <tr key={allocation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {allocation.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${allocation.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allocation.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allocation.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        allocation.status === 'approved' ? 'bg-green-100 text-green-800' :
                        allocation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {allocation.status.charAt(0).toUpperCase() + allocation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allocation.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(allocation.id)}
                            disabled={loading}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            {loading ? (
                              <ArrowPathIcon className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              'Approve'
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(allocation.id)}
                            disabled={loading}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            {loading ? (
                              <ArrowPathIcon className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              'Reject'
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 