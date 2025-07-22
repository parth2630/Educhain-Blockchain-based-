import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import University from '../contracts/artifacts/contracts/University.json';
import { CONTRACT_ADDRESSES } from '../config/contracts';

interface Employee {
  address: string;
  role: string;
}

const EmployeeList: React.FC = () => {
  const { provider } = useWallet();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!provider) {
        setError('Please connect your wallet first');
        setLoading(false);
        return;
      }

      try {
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESSES.STUDENT_REGISTRY,
          University.abi,
          signer
        );

        // Get all employees by checking the EmployeeAdded events
        const events = await contract.queryFilter(contract.filters.EmployeeAdded());
        const employeeData = events.map(event => {
          if ('args' in event && event.args) {
            return {
              address: event.args[0],
              role: event.args[1]
            };
          }
          return null;
        }).filter(Boolean) as Employee[];

        setEmployees(employeeData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to fetch employees. Please make sure you are connected to the correct network and the University contract is deployed.');
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [provider]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Registered Employees</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <div key={employee.address} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{employee.role}</h2>
            <p>Address: {employee.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeList; 