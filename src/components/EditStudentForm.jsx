import React, { useState, useEffect } from 'react';

export default function EditStudentForm({ student, onCancel, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    grade: '',
    paid: false,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        age: student.age?.toString() || '',
        grade: student.grade?.toString() || '',
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (isNaN(formData.age) || formData.age < 5 || formData.age > 25) {
      setError('Please enter a valid age (5-25)');
      return false;
    }
    if (isNaN(formData.grade) || formData.grade < 0 || formData.grade > 100) {
      setError('Please enter a valid grade (0-100)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const studentData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        grade: parseInt(formData.grade),
        paid: formData.paid,
      };

      const response = await fetch(`https://studentregistrationsystem-production-06d9.up.railway.app/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error: ${response.status}`);
      }

      onUpdate(); // Refresh student list
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message.includes('Failed to fetch') ? 'Network error. Please check your connection' : err.message.includes('405') ? 'Server rejected the update request' : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-yellow-50 rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-center text-gray-800">Edit Student</h2>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded text-center">{error}</div>}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Student Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter student name"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Age</label>
        <input
          type="number"
          name="age"
          placeholder="Enter age (5-25)"
          min="5"
          max="25"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.age}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Grade</label>
        <input
          type="number"
          name="grade"
          placeholder="Enter grade (0-100)"
          min="0"
          max="100"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.grade}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" name="paid" id="paid" checked={formData.paid} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500" />
        <label htmlFor="paid" className="text-sm font-medium text-gray-700">
          Paid
        </label>
      </div>

      <div className="flex space-x-4 pt-4">
        <button type="submit" disabled={isSubmitting} className={`flex-1 py-2 px-4 rounded-md text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}>
          {isSubmitting ? 'Updating...' : 'Update Student'}
        </button>
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="flex-1 py-2 px-4 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
