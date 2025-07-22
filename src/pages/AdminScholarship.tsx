import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { ScholarshipABI } from '../contracts/Scholarship';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Application {
  student: string;
  name: string;
  department: string;
  year: number;
  reason: string;
  amount: string;
  isApproved: boolean;
  isRejected: boolean;
  timestamp: number;
}

const AdminScholarship: React.FC = () => {
  const { address, provider } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (provider) {
      const setupContract = async () => {
        try {
          const signer = await provider.getSigner();
          setSigner(signer);
          const contract = new ethers.Contract(
            CONTRACT_ADDRESSES.SCHOLARSHIP,
            ScholarshipABI,
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

  useEffect(() => {
    if (contract) {
      const fetchApplications = async () => {
        try {
          setLoading(true);
          const count = await contract.getApplicationsCount();
          const apps: Application[] = [];
          
          for (let i = 0; i < count; i++) {
            const [
              student,
              name,
              department,
              year,
              reason,
              amount,
              isApproved,
              isRejected,
              timestamp
            ] = await contract.getApplication(i);
            
            apps.push({
              student,
              name,
              department,
              year: Number(year),
              reason,
              amount: ethers.formatEther(amount),
              isApproved,
              isRejected,
              timestamp: Number(timestamp)
            });
          }
          
          setApplications(apps);
        } catch (err) {
          console.error('Error fetching applications:', err);
          setError('Failed to fetch applications');
        } finally {
          setLoading(false);
        }
      };
      
      fetchApplications();
      
      // Listen for new applications
      const filter = contract.filters.ApplicationSubmitted();
      contract.on(filter, () => {
        fetchApplications();
      });
      
      return () => {
        contract.removeAllListeners(filter);
      };
    }
  }, [contract]);

  const handleApprove = async (applicationId: number) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.approveApplication(applicationId);
      await tx.wait();
      
      setSuccess('Application approved successfully!');
    } catch (err: any) {
      console.error('Approval error:', err);
      setError('Failed to approve application');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (applicationId: number) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.rejectApplication(applicationId);
      await tx.wait();
      
      setSuccess('Application rejected successfully!');
    } catch (err: any) {
      console.error('Rejection error:', err);
      setError('Failed to reject application');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (isApproved: boolean, isRejected: boolean) => {
    if (isApproved) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    } else if (isRejected) {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    } else {
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (isApproved: boolean, isRejected: boolean) => {
    if (isApproved) {
      return 'Approved';
    } else if (isRejected) {
      return 'Rejected';
    } else {
      return 'Pending';
    }
  };

  const getStatusColor = (isApproved: boolean, isRejected: boolean) => {
    if (isApproved) {
      return 'bg-green-100 text-green-800';
    } else if (isRejected) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Scholarship Applications</h1>
          
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 border border-red-200 shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
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

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : applications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No applications found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
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
                  {applications.map((app, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.name}</div>
                        <div className="text-sm text-gray-500">{app.student}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{app.department}</div>
                        <div className="text-sm text-gray-500">Year {app.year}</div>
                        <div className="text-sm text-gray-500 mt-1">{app.reason}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.amount} ETH</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(app.isApproved, app.isRejected)}
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.isApproved, app.isRejected)}`}>
                            {getStatusText(app.isApproved, app.isRejected)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {!app.isApproved && !app.isRejected && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(index)}
                              disabled={loading}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(index)}
                              disabled={loading}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminScholarship; 