import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import {
  WalletIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ClockIcon,
  GlobeAltIcon,
  UserIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface LoginForm {
  username: string;
  password: string;
}

export default function Home() {
  const { address, connectWallet } = useWallet();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'student' | null>(null);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState<'student' | 'admin' | null>(null);
  const [formData, setFormData] = useState<LoginForm>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check if we were redirected from a protected route
    const state = location.state as { from?: { pathname: string } } | undefined;
    if (state?.from) {
      setRedirectMessage(`Please log in to access ${state.from.pathname}`);
    }
  }, [location]);

  useEffect(() => {
    // Redirect to appropriate dashboard after wallet connection
    if (address && isLoggedIn) {
      if (userType === 'admin') {
        navigate('/admin-dashboard');
      } else if (userType === 'student') {
        navigate('/dashboard');
      }
    }
  }, [address, isLoggedIn, userType, navigate]);

  const handleLogin = (type: 'admin' | 'student') => {
    setShowLoginForm(type);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.username || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      const success = await login(formData.username, formData.password, showLoginForm!);
      
      if (success) {
        setUserType(showLoginForm!);
        setIsLoggedIn(true);
        setShowLoginForm(null);
        setRedirectMessage(null);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet');
    }
  };

  const authenticateUser = async (username: string, password: string, type: 'admin' | 'student'): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return username.length > 0 && password.length > 0;
  };

  const features = [
    {
      name: 'Fee Payments',
      description: 'Pay your fees securely and instantly using blockchain technology',
      icon: CreditCardIcon,
      path: '/fee-payment'
    },
    {
      name: 'Payroll',
      description: 'Process payroll transactions with transparency and efficiency',
      icon: BanknotesIcon,
      path: '/payroll'
    },
    {
      name: 'Fund Allocation',
      description: 'Allocate funds to projects with complete traceability',
      icon: ChartBarIcon,
      path: '/fund-allocation'
    },
    {
      name: 'Scholarships',
      description: 'Manage scholarship applications and disbursements',
      icon: AcademicCapIcon,
      path: '/scholarship'
    }
  ];

  const benefits = [
    {
      name: 'Secure Transactions',
      description: 'All transactions are secured by blockchain technology',
      icon: ShieldCheckIcon
    },
    {
      name: 'Instant Processing',
      description: 'Transactions are processed instantly without intermediaries',
      icon: ClockIcon
    },
    {
      name: 'Global Access',
      description: 'Access your funds and make transactions from anywhere',
      icon: GlobeAltIcon
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Welcome to Educhain
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Secure and efficient blockchain-based Financial system
            </p>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {!isLoggedIn ? (
          !showLoginForm ? (
            <>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Choose Your Login Type
                </h2>
                <p className="mt-2 text-lg leading-8 text-gray-600">
                  Select your role to access the appropriate dashboard
                </p>
              </div>

              <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                {/* Student Login Card */}
                <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
                  <div>
                    <div className="flex items-center gap-x-4">
                      <AcademicCapIcon className="h-10 w-10 text-indigo-600" />
                      <h3 className="text-lg font-semibold leading-8 text-gray-900">
                        Student Login
                      </h3>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      Access your academic records, make fee payments, and apply for scholarships.
                    </p>
                  </div>
                  <button
                    onClick={() => handleLogin('student')}
                    className="mt-8 flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Login as Student
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Admin Login Card */}
                <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
                  <div>
                    <div className="flex items-center gap-x-4">
                      <ShieldCheckIcon className="h-10 w-10 text-indigo-600" />
                      <h3 className="text-lg font-semibold leading-8 text-gray-900">
                        Admin Login
                      </h3>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      Manage student records, process payments, and oversee university operations.
                    </p>
                  </div>
                  <button
                    onClick={() => handleLogin('admin')}
                    className="mt-8 flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Login as Admin
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-md">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  {showLoginForm === 'student' ? 'Student Login' : 'Admin Login'}
                </h2>
                <p className="mt-2 text-lg leading-8 text-gray-600">
                  Please enter your credentials to access your account
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleFormSubmit}>
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          {error}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="username" className="sr-only">
                      {showLoginForm === 'student' ? 'Student ID' : 'Username'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                        placeholder={showLoginForm === 'student' ? 'Student ID' : 'Username'}
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                        Logging in...
                      </div>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowLoginForm(null)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Back to login options
                </button>
              </div>
            </div>
          )
        ) : !address ? (
          <div className="mx-auto max-w-md text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Please connect your MetaMask wallet to continue
            </p>
            <button
              onClick={handleConnectWallet}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Connect MetaMask
              <WalletIcon className="ml-2 -mr-1 h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="mx-auto max-w-md text-center">
            <div className="flex items-center justify-center gap-x-2 rounded-md bg-green-50 p-4 text-green-700">
              <UserIcon className="h-5 w-5" />
              <p className="text-sm font-medium">
                Connected as {userType} with address: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center gap-x-2 rounded-md bg-red-50 p-4 text-red-700">
              <ExclamationCircleIcon className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div id="features-section" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage payments
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform provides a comprehensive suite of tools for managing various types of payments and transactions.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className="relative group bg-white p-6 rounded-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="rounded-lg inline-flex p-3 bg-indigo-600 text-white ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="mt-8 relative">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                      {feature.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div id="benefits-section" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Benefits</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why choose our platform
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Experience the advantages of blockchain technology in your financial transactions.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {benefits.map((benefit) => (
                <div
                  key={benefit.name}
                  className="relative group bg-white p-6 rounded-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="rounded-lg inline-flex p-3 bg-green-600 text-white ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <benefit.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="mt-8 relative">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                      {benefit.name}
                    </h3>
                    <p className="mt-2 text-base text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
