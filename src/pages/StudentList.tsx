import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import University from '../contracts/artifacts/contracts/University.json';
import { CONTRACT_ADDRESSES } from '../config/contracts';

interface Student {
  name: string;
  department: string;
  year: number;
  feesPaid: number;
  isRegistered: boolean;
}

const StudentList: React.FC = () => {
  const { provider } = useWallet();
  const [students, setStudents] = useState<{ address: string; data: Student }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const fetchStudents = async () => {
      if (!provider) {
        setError('Please connect your wallet first');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setDebugInfo('Connecting to contract...');

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESSES.STUDENT_REGISTRY,
          University.abi,
          signer
        );

        setDebugInfo('Fetching student events...');
        // Get all registered students by checking the isStudent mapping
        const studentAddresses: string[] = [];
        const events = await contract.queryFilter(contract.filters.StudentRegistered());
        setDebugInfo(`Found ${events.length} student registration events`);
        
        for (const event of events) {
          if ('args' in event && event.args) {
            const address = event.args[0];
            setDebugInfo(`Checking student status for address: ${address}`);
            const isStudent = await contract.isStudent(address);
            if (isStudent) {
              studentAddresses.push(address);
            }
          }
        }

        setDebugInfo(`Found ${studentAddresses.length} active students`);
        // Fetch details for each student
        const studentDetails = await Promise.all(
          studentAddresses.map(async (address: string) => {
            setDebugInfo(`Fetching details for student: ${address}`);
            const student = await contract.students(address);
            return {
              address,
              data: {
                name: student.name,
                department: student.department,
                year: Number(student.year),
                feesPaid: Number(student.feesPaid),
                isRegistered: student.isRegistered
              }
            };
          })
        );

        setStudents(studentDetails);
        setDebugInfo(`Successfully loaded ${studentDetails.length} students`);
      } catch (err: any) {
        console.error('Error fetching students:', err);
        setError(err.message || 'Failed to fetch students');
        setDebugInfo(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [provider]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student data...</p>
          {debugInfo && <p className="mt-2 text-sm text-gray-500">{debugInfo}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          {debugInfo && <p className="mt-2 text-sm">{debugInfo}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Registered Students</h1>
      {debugInfo && <p className="text-sm text-gray-500 mb-4">{debugInfo}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <div key={student.address} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{student.data.name}</h2>
            <p className="text-sm text-gray-500">Address: {student.address}</p>
            <p className="text-sm text-gray-500">Department: {student.data.department}</p>
            <p className="text-sm text-gray-500">Year: {student.data.year}</p>
            <p className="text-sm text-gray-500">Fees Paid: {ethers.formatEther(student.data.feesPaid)} ETH</p>
            <p className="text-sm text-gray-500">Status: {student.data.isRegistered ? 'Registered' : 'Not Registered'}</p>
          </div>
        ))}
        {students.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            No students found
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList; 