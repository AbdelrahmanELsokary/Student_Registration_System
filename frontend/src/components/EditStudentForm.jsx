import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditStudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/student/${id}`);
        const studentData = response.data;
        setName(studentData.name);
        setEmail(studentData.email);
        setPhone(studentData.phone);
        setLoading(false);
      } catch {
        setError('Student not found or error fetching data');
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedStudent = { name, email, phone };
      await axios.put(`http://127.0.0.1:5000/update/${id}`, updatedStudent);
      navigate('/students');
    } catch {
      setError('Failed to update student');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 rounded-xl shadow-md max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Edit Student</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">Phone</label>
          <input
            type="tel"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
            Save Changes
          </button>
          <button type="button" onClick={() => navigate('/students')} className="text-gray-600 hover:text-gray-900">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
