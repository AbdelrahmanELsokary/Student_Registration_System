import React, { useState, useEffect } from 'react';

export default function EditStudentForm({ student, onCancel, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    grade: '',
    paid: false,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        age: student.age || '',
        grade: student.grade || '',
        paid: student.paid || false,
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.age || !formData.grade) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setError('');
        onUpdate(); // إعادة تحميل الطلاب
      } else {
        setError('Failed to update student.');
      }
    } catch (err) {
      console.error(err);
      setError('Server error.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-yellow-50 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold text-center">Edit Student</h2>

      {error && <p className="text-red-600">{error}</p>}

      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full p-2 border rounded" required />

      <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" className="w-full p-2 border rounded" required />

      <input type="text" name="grade" value={formData.grade} onChange={handleChange} placeholder="Grade" className="w-full p-2 border rounded" required />

      <label className="flex items-center space-x-2">
        <input type="checkbox" name="paid" checked={formData.paid} onChange={handleChange} />
        <span>Paid</span>
      </label>

      <div className="flex gap-4">
        <button type="submit" className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700 transition">
          Update
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-400 text-white p-2 rounded hover:bg-gray-600 transition">
          Cancel
        </button>
      </div>
    </form>
  );
}
