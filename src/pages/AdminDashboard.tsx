import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import University from '../contracts/artifacts/contracts/University.json';
import ScholarshipArtifact from '../contracts/artifacts/contracts/Scholarship.json';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AdminOverview from './AdminOverview';
import StudentRegistration from './StudentRegistration';
import StudentList from './StudentList';
import EmployeeAddition from './EmployeeAddition';
import EmployeeList from './EmployeeList';
import { UserPlusIcon, UserCircleIcon, BriefcaseIcon, AcademicCapIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CONTRACT_ADDRESSES } from '../config/contracts';

interface Student {
  address: string;
  name: string;
  department: string;
  year: number;
  feesPaid: number;
}

interface Employee {
  address: string;
  role: string;
}

interface ScholarshipApplication {
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

const AdminDashboard: React.FC = () => {
  const { address, provider } = useWallet();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [adminAddress, setAdminAddress] = useState<string | null>(null);
  const [scholarshipContract, setScholarshipContract] = useState<ethers.Contract | null>(null);
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);

  useEffect(() => {
    if (!address) {
      navigate('/');
      return;
    }
  }, [address, navigate]);

  // Function to fetch admin balance
  const fetchAdminBalance = async () => {
    if (provider) {
      try {
        setLoading(true);
        // Use the hardcoded admin address from the contract
        const adminAddress = '0x67D16f548eA1d46DfABc4DA5930f47828D8E0d0b';
        const balance = await provider.getBalance(adminAddress);
        const balanceInEth = Number(ethers.formatEther(balance));
        console.log('Admin balance:', balanceInEth, 'ETH');
        setTotalRevenue(balanceInEth);
        setError(null);
      } catch (err) {
        console.error('Error fetching admin balance:', err);
        setError('Failed to fetch admin balance');
        setTotalRevenue(null);
      } finally {
        setLoading(false);
      }
    }
  };

  // Set up interval to fetch admin balance every 5 seconds
  useEffect(() => {
    if (provider) {
      fetchAdminBalance(); // Initial fetch
      const interval = setInterval(fetchAdminBalance, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [provider]);

  // Add debug logging for provider
  useEffect(() => {
    if (provider) {
      console.log('Provider available:', provider);
    } else {
      console.log('Provider not available');
    }
  }, [provider]);

  useEffect(() => {
    if (provider) {
      const setupContract = async () => {
        try {
          setLoading(true);
          setError(null);

          // Get network info
          const network = await provider.getNetwork();
          setNetwork(network.name);
          
          // Support multiple networks
          const supportedNetworks: Record<number, string> = {
            1337: 'Ganache',
            5: 'Goerli',
            11155111: 'Sepolia'
          };

          if (!(Number(network.chainId) in supportedNetworks)) {
            setError(`Please switch to a supported network: ${Object.values(supportedNetworks).join(', ')}`);
            return;
          }

          // Get signer
          const signer = await provider.getSigner();
          
          // Get contract address from deployment config
          const contractAddress = CONTRACT_ADDRESSES.STUDENT_REGISTRY;
          
          // Validate contract address
          if (!ethers.isAddress(contractAddress)) {
            throw new Error('Invalid contract address');
          }

          // Create contract instance
          const contract = new ethers.Contract(
            contractAddress,
            University.abi,
            signer
          );

          // Verify contract is deployed
          try {
            const code = await provider.getCode(contractAddress);
            if (code === '0x') {
              throw new Error('Contract not deployed at this address');
            }
          } catch (err) {
            console.error('Error verifying contract:', err);
            throw new Error('Failed to verify contract deployment');
          }

          setContract(contract);
          setSuccess('Successfully connected to the contract');

          // Get admin address from contract
          try {
            // First try to get the admin address from the admin variable
            const adminFunction = contract.getFunction('admin');
            const rawAdminAddr = await adminFunction();
            console.log('Raw admin address:', rawAdminAddr);
            
            // Convert to checksum address if needed
            const checksumAddr = ethers.getAddress(rawAdminAddr);
            console.log('Checksum admin address:', checksumAddr);
            
            // Verify the address is valid
            if (!ethers.isAddress(checksumAddr)) {
              throw new Error('Invalid admin address format');
            }
            
            setAdminAddress(checksumAddr);
          } catch (err) {
            console.error('Error fetching admin address:', err);
            // If that fails, try the hardcoded adminAddress
            try {
              const adminAddressFunction = contract.getFunction('adminAddress');
              const hardcodedAddr = await adminAddressFunction();
              console.log('Hardcoded admin address:', hardcodedAddr);
              
              const checksumAddr = ethers.getAddress(hardcodedAddr);
              if (!ethers.isAddress(checksumAddr)) {
                throw new Error('Invalid hardcoded admin address format');
              }
              
              setAdminAddress(checksumAddr);
            } catch (hardcodedErr) {
              console.error('Error fetching hardcoded admin address:', hardcodedErr);
              throw new Error('Failed to fetch admin address from contract');
            }
          }
        } catch (err) {
          console.error('Error setting up contract:', err);
          setError(err instanceof Error ? err.message : 'Failed to setup contract connection');
        } finally {
          setLoading(false);
        }
      };
      setupContract();
    }
  }, [provider]);

  useEffect(() => {
    if (contract && provider) {
      const fetchData = async () => {
        try {
          setLoading(true);
          // Fetch total revenue
          const contractAddress = await contract.getAddress();
          const balance = await provider.getBalance(contractAddress);
          if (balance) {
            setTotalRevenue(Number(ethers.formatEther(balance)));
          }

          // Fetch students and employees through events
          const studentFilter = contract.filters.StudentRegistered();
          const employeeFilter = contract.filters.EmployeeAdded();
          
          const [studentEvents, employeeEvents] = await Promise.all([
            contract.queryFilter(studentFilter),
            contract.queryFilter(employeeFilter)
          ]);

          const studentData = studentEvents.map(event => {
            const args = (event as ethers.EventLog).args;
            return {
              address: args?.student,
              name: args?.name,
              department: args?.department,
              year: Number(args?.year),
              feesPaid: 0 // This would need to be calculated from payment events
            };
          });

          const employeeData = employeeEvents.map(event => {
            const args = (event as ethers.EventLog).args;
            return {
              address: args?.employee,
              role: args?.role
            };
          });

          setStudents(studentData);
          setEmployees(employeeData);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to fetch data');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [contract, provider]);

  useEffect(() => {
    if (provider) {
      const setupScholarshipContract = async () => {
        try {
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            CONTRACT_ADDRESSES.SCHOLARSHIP,
            ScholarshipArtifact.abi,
            signer
          );
          setScholarshipContract(contract);
        } catch (err) {
          console.error('Error setting up scholarship contract:', err);
          setError('Failed to setup scholarship contract connection');
        }
      };
      setupScholarshipContract();
    }
  }, [provider]);

  useEffect(() => {
    if (scholarshipContract) {
      const fetchApplications = async () => {
        try {
          setLoading(true);
          const count = await scholarshipContract.getApplicationsCount();
          const apps: ScholarshipApplication[] = [];
          
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
            ] = await scholarshipContract.getApplication(i);
            
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
      const filter = scholarshipContract.filters.ApplicationSubmitted();
      scholarshipContract.on(filter, () => {
        fetchApplications();
      });
      
      return () => {
        scholarshipContract.removeAllListeners(filter);
      };
    }
  }, [scholarshipContract]);

  const handleApprove = async (applicationId: number) => {
    if (!scholarshipContract) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await scholarshipContract.approveApplication(applicationId);
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
    if (!scholarshipContract) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await scholarshipContract.rejectApplication(applicationId);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-700">Loading...</p>
            </div>
          </div>
        )}

        {/* Network Info */}
        {network && (
          <div className="mb-4 text-sm text-gray-600">
            Connected to: {network}
            {adminAddress && (
              <div className="mt-1">
                Admin Address: <span className="font-mono text-xs">{adminAddress}</span>
              </div>
            )}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Revenue Card */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <BriefcaseIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Admin Wallet Balance
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {loading ? (
                        <div className="animate-pulse h-6 w-20 bg-gray-200 rounded"></div>
                      ) : totalRevenue !== null ? (
                        `${totalRevenue.toFixed(4)} ETH`
                      ) : (
                        'N/A'
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Register Students Card */}
          <Link to="/admin-dashboard/register-student" className="block">
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                    <UserPlusIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Register Students
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        Click to register new students
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Add Employees Card */}
          <Link to="/admin-dashboard/add-employee" className="block">
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <UserCircleIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Add Employees
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        Click to add new employees
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Scholarship Applications Section */}
        <div className="mt-8">
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Scholarship Applications</h2>
            
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!app.isApproved && !app.isRejected && (
                            <div className="space-x-2">
                              <button
                                onClick={() => handleApprove(index)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(index)}
                                className="text-red-600 hover:text-red-900"
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

        <Routes>
          <Route
            path="/"
            element={
              <AdminOverview
                students={students}
                employees={employees}
                totalRevenue={totalRevenue || 0}
              />
            }
          />
          <Route path="/register-student" element={<StudentRegistration />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/add-employee" element={<EmployeeAddition />} />
          <Route path="/employees" element={<EmployeeList />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard; 