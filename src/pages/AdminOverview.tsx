import React from 'react';

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

interface AdminOverviewProps {
  students: Student[];
  employees: Employee[];
  totalRevenue: number;
}

const AdminOverview: React.FC<AdminOverviewProps> = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Content will be added here */}
    </div>
  );
};

export default AdminOverview; 