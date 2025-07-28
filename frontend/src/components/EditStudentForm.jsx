import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function EditStudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [feesPaid, setFeesPaid] = useState(false);

  const gradeOptions = ['First Preparatory', 'Second Preparatory', 'Third Preparatory', 'First Secondary', 'Second Secondary', 'Third Secondary'];

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/student/${id}`);
        const student = res.data;
        setName(student.name);
        setGrade(student.grade);
        setGuardianPhone(student.guardian_phone);
        setFeesPaid(student.fees_paid === 1);
      } catch {
        toast.error('Failed to fetch student data');
      }
    };

    fetchStudent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://127.0.0.1:5000/update/${id}`, {
        name,
        grade,
        guardian_phone: guardianPhone,
        fees_paid: feesPaid ? 1 : 0,
      });
      toast.success('Student updated successfully');
      navigate('/');
    } catch {
      toast.error('Failed to update student');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">Edit Student</h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-md rounded-lg">
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium">Grade</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Select Grade --</option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium">Guardian Phone</label>
          <input
            type="tel"
            value={guardianPhone}
            onChange={(e) => setGuardianPhone(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <input id="feesPaid" type="checkbox" checked={feesPaid} onChange={(e) => setFeesPaid(e.target.checked)} className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
          <label htmlFor="feesPaid" className="text-gray-700 font-medium">
            Fees Paid
          </label>
        </div>

        <div className="text-center">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition">
            Update Student
          </button>
        </div>
      </form>
    </div>
  );
}
