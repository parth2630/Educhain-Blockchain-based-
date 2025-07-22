import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import {
  UserIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface LoginForm {
  studentId: string;
  password: string;
}

export default function StudentLogin() {
  const navigate = useNavigate();
  const { address, provider } = useWallet();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginForm>({
    studentId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!address || !provider) {
        throw new Error('Please connect your wallet first');
      }

      if (!formData.studentId || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      // Here you would typically make an API call to verify credentials
      // For now, we'll simulate a successful login
      const isAuthenticated = await authenticateStudent(formData.studentId, formData.password);
      
      if (isAuthenticated) {
        // Use the auth context to handle login
        login(formData.studentId, formData.password, 'student');
        
        // Navigate to student dashboard
        navigate('/student-dashboard');
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

  // This function would typically make an API call to verify credentials
  const authenticateStudent = async (studentId: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any non-empty credentials
    return studentId.length > 0 && password.length > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Student Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your credentials to access your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
              <label htmlFor="studentId" className="sr-only">
                Student ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Student ID"
                  value={formData.studentId}
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

        <div className="text-center text-sm text-gray-600">
          <p>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-medium text-primary hover:text-primary-dark"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 