import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function StudentForm() {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [feesPaid, setFeesPaid] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newStudent = {
      name,
      grade,
      guardian_phone: parentPhone,
      fees_paid: feesPaid,
    };

    try {
      await axios.post('http://127.0.0.1:5000/add', newStudent);
      toast.success('Student added successfully!');
      navigate('/students');
    } catch {
      toast.error('Failed to add student.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-700">Add New Student</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full px-3 py-2 border rounded" placeholder="Student Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full px-3 py-2 border rounded" placeholder="Grade (e.g. First, Second)" value={grade} onChange={(e) => setGrade(e.target.value)} required />
        <input className="w-full px-3 py-2 border rounded" placeholder="Parent Phone Number" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} required />
        <div className="flex items-center space-x-2">
          <input type="checkbox" checked={feesPaid} onChange={(e) => setFeesPaid(e.target.checked)} />
          <label className="text-gray-600">Fees Paid</label>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Student
        </button>
      </form>
    </div>
  );
}
