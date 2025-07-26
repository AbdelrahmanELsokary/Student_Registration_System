import React, { useState, useEffect } from 'react';

export default function EditStudentForm({ student, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    grade: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        age: student.age,
        grade: student.grade,
      });
    }
  }, [student]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!formData.age) newErrors.age = 'Age is required';
    else if (formData.age < 4 || formData.age > 100) newErrors.age = 'Age must be between 4 and 100';

    if (!formData.grade.trim()) newErrors.grade = 'Grade is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // clear field error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Student updated successfully!');
        onUpdate();
      } else {
        alert('Failed to update student.');
      }
    } catch (err) {
      console.error(err);
      alert('Server error.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-yellow-50 rounded-xl shadow-md space-y-4 mt-10">
      <h2 className="text-xl font-bold text-center">Edit Student</h2>

      <div>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full p-2 border rounded" />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div>
        <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" className="w-full p-2 border rounded" />
        {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
      </div>

      <div>
        <input type="text" name="grade" value={formData.grade} onChange={handleChange} placeholder="Grade" className="w-full p-2 border rounded" />
        {errors.grade && <p className="text-red-500 text-sm">{errors.grade}</p>}
      </div>

      <div className="flex gap-2">
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition">
          Update
        </button>
        <button type="button" onClick={onCancel} className="w-full bg-gray-300 text-black p-2 rounded hover:bg-gray-400 transition">
          Cancel
        </button>
      </div>
    </form>
  );
}
