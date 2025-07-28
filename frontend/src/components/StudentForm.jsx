import { useState } from 'react';
import axios from 'axios';

export default function StudentForm({ onStudentAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const studentData = { name, email, phone };

    try {
      const res = await axios.post('http://localhost:5000/add', studentData);
      console.log('Student added', res.data);

      if (onStudentAdded) onStudentAdded();

      setName('');
      setEmail('');
      setPhone('');
    } catch (err) {
      console.error('Axios Error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl shadow-md space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200">
        Add Student
      </button>
    </form>
  );
}
