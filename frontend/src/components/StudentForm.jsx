import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function StudentForm() {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [feesPaid, setFeesPaid] = useState(false);

  const navigate = useNavigate();

  const gradeOptions = ['First Preparatory', 'Second Preparatory', 'Third Preparatory', 'First Secondary', 'Second Secondary', 'Third Secondary'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newStudent = {
      name,
      grade,
      guardian_phone: guardianPhone,
      fees_paid: feesPaid,
    };

    try {
      await axios.post('http://127.0.0.1:5000/add', newStudent);
      toast.success('Student added successfully!');
      navigate('/students');
    } catch (err) {
      toast.error('Failed to add student.');
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-700 text-center">Add New Student</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Student Name</label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            type="text"
            placeholder="Enter student name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Grade</label>
          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" value={grade} onChange={(e) => setGrade(e.target.value)} required>
            <option value="">-- Select Grade --</option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Parent Phone Number</label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            type="tel"
            placeholder="e.g. 01012345678"
            value={guardianPhone}
            onChange={(e) => setGuardianPhone(e.target.value)}
            pattern="^01[0125][0-9]{8}$"
            required
            title="Please enter a valid Egyptian phone number (e.g. 01012345678)"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="feesPaid" checked={feesPaid} onChange={(e) => setFeesPaid(e.target.checked)} className="accent-green-500" />
          <label htmlFor="feesPaid" className="text-gray-600">
            Fees Paid
          </label>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200">
          Add Student
        </button>
      </form>
    </div>
  );
}
