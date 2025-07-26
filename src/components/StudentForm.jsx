import React, { useState } from 'react';

export default function StudentForm() {
  const [form, setForm] = useState({ name: '', age: '', grade: '', paid: 'false' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          age: form.age,
          grade: form.grade,
          paid: form.paid === 'true', // نحوله لقيمة منطقية
        }),
      });

      if (res.ok) {
        alert('Student added successfully');
        setForm({ name: '', age: '', grade: '', paid: 'false' });
      } else {
        const error = await res.text();
        console.error(error);
        alert('Failed to add student');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Add Student</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="age" placeholder="Age" value={form.age} onChange={handleChange} type="number" className="w-full p-2 border rounded" required />
        <input name="grade" placeholder="Grade" value={form.grade} onChange={handleChange} className="w-full p-2 border rounded" required />

        {/* الدفع */}
        <select name="paid" value={form.paid} onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="false">لم يدفع</option>
          <option value="true">دفع</option>
        </select>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Add Student
        </button>
      </form>
    </div>
  );
}
