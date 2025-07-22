import React from 'react';

interface Student {
  address: string;
  name: string;
  department: string;
  year: number;
  feesPaid: number;
}

interface AdminStudentsProps {
  students: Student[];
  newStudent: {
    address: string;
    name: string;
    department: string;
    year: number;
  };
  loading: boolean;
  network: string | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleRegisterStudent: () => Promise<void>;
}

const AdminStudents: React.FC<AdminStudentsProps> = ({
  students,
  newStudent,
  loading,
  network,
  handleInputChange,
  handleRegisterStudent
}) => {
  return (
    <div className="space-y-8">
      {/* Student Registration Form */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 mb-8 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Register New Student</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="studentAddress" className="block text-sm font-medium text-gray-700">
              Wallet Address
            </label>
            <input
              type="text"
              name="studentAddress"
              id="studentAddress"
              value={newStudent.address}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="0x..."
            />
          </div>
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="studentName"
              id="studentName"
              value={newStudent.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Student Name"
            />
          </div>
          <div>
            <label htmlFor="studentDepartment" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              name="studentDepartment"
              id="studentDepartment"
              value={newStudent.department}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select Department</option>
              <option value="CSE">Computer Science & Engineering (CSE)</option>
              <option value="CE">Computer Engineering (CE)</option>
              <option value="IT">Information Technology (IT)</option>
              <option value="EXTC">Electronics and Telecommunication (EXTC)</option>
            </select>
          </div>
          <div>
            <label htmlFor="studentYear" className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <select
              name="studentYear"
              id="studentYear"
              value={newStudent.year}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {[1, 2, 3, 4].map(year => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleRegisterStudent}
            disabled={loading || network !== 'ganache'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? 'Registering...' : 'Register Student'}
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Registered Students</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fees Paid (ETH)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.address} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.address.slice(0, 6)}...{student.address.slice(-4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.feesPaid}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminStudents; 