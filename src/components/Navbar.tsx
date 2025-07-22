import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { WalletIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

interface NavItem {
  name: string;
  path: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function Navbar() {
  const { address, disconnectWallet } = useWallet();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    disconnectWallet();
  };

  const handleScrollClick = (id: string, hashPath: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate(hashPath);
    } else {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const sectionId = hash.replace('#', '') + '-section';
      const section = document.getElementById(sectionId);
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  const studentNavItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Fee Payment', path: '/fee-payment' },
    { name: 'Scholarship', path: '/scholarship' }
  ];

  const adminNavItems: NavItem[] = [
    { name: 'Admin Dashboard', path: '/admin-dashboard' },
    { name: 'Payroll', path: '/payroll' }
  ];

  const landingNavItems: NavItem[] = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features', onClick: handleScrollClick('features-section', '/#features') },
    { name: 'Benefits', path: '/#benefits', onClick: handleScrollClick('benefits-section', '/#benefits') }
  ];

  const navItems = user?.role === 'admin'
    ? adminNavItems
    : user
    ? studentNavItems
    : landingNavItems;

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                onClick={handleLogout}
                className="text-xl font-bold text-indigo-600 hover:text-indigo-800"
              >
                Educhain
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={item.onClick}
                  className={`${
                    location.pathname === item.path
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {address ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <WalletIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">{address.slice(0, 6)}...{address.slice(-4)}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="#"
                onClick={handleScrollClick('login-section', '/#login')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={item.onClick}
              className={`${
                location.pathname === item.path
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              {item.name}
            </Link>
          ))}
          {!user && (
            <Link
              to="#"
              onClick={handleScrollClick('login-section', '/#login')}
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-indigo-600 hover:bg-gray-50 hover:border-gray-300 hover:text-indigo-800"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
