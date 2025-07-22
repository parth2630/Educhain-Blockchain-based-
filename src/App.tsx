import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Transactions from './pages/Transactions';
import FeePayment from './pages/FeePayment';
import Payroll from './pages/Payroll';
import FundAllocation from './pages/FundAllocation';
import Scholarship from './pages/Scholarship';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import StudentLogin from './components/StudentLogin';
import { WalletProvider } from './context/WalletContext';
import { AuthProvider } from './context/AuthContext';
import ScholarshipApplication from './pages/ScholarshipApplication';
import AdminScholarship from './pages/AdminScholarship';

function App() {
  return (
    <WalletProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="student">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fee-payment"
                element={
                  <ProtectedRoute requiredRole="student">
                    <FeePayment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payroll"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Payroll />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fund-allocation"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <FundAllocation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scholarship"
                element={
                  <ProtectedRoute requiredRole="student">
                    <ScholarshipApplication />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute>
                    <Payments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route path="/student-login" element={<StudentLogin />} />
              <Route path="/admin/scholarship" element={<AdminScholarship />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </WalletProvider>
  );
}

export default App;