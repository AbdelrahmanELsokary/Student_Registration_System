import React, { useState, useEffect } from 'react';

export default function StudentForm({ existingStudent, onSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingStudent) {
      setName(existingStudent.name);
      setAge(existingStudent.age.toString());
      setGrade(existingStudent.grade.toString());
      setPaid(existingStudent.paid);
    }
  }, [existingStudent]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || isNaN(age) || isNaN(grade)) {
      setError('❌ Please fill in all fields correctly.');
      return;
    }

    const studentData = {
      name,
      age: parseInt(age),
      grade: parseInt(grade),
      paid,
    };

    const url = existingStudent
      ? `studentregistrationsystem-production-06d9.up.railway.app/api/students/${existingStudent.id}`
      : 'studentregistrationsystem-production-06d9.up.railway.app/api/students';

    const method = existingStudent ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const message = await res.text();
          throw new Error(`❌ Failed to save student: ${message}`);
        }
        return res.status === 204 ? null : res.json();
      })
      .then(() => {
        setName('');
        setAge('');
        setGrade('');
        setPaid(false);
        setError('');
        onSuccess();
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || '❌ Something went wrong. Please try again.');
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 bg-white shadow-md rounded">
      {error && <p className="text-red-600 text-center">{error}</p>}

      <input type="text" placeholder="Student Name" className="w-full border rounded p-2" value={name} onChange={(e) => setName(e.target.value)} required />

      <input type="number" placeholder="Age" className="w-full border rounded p-2" value={age} onChange={(e) => setAge(e.target.value)} required />

      <input type="number" placeholder="Grade" className="w-full border rounded p-2" value={grade} onChange={(e) => setGrade(e.target.value)} required />

      <label className="flex items-center space-x-2">
        <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
        <span>Paid</span>
      </label>

      <div className="flex space-x-2 justify-end">
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          {existingStudent ? 'Update Student' : 'Add Student'}
        </button>
        {existingStudent && (
          <button type="button" onClick={onCancel} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
