import React, { useEffect, useState } from 'react';
import StudentForm from './StudentForm';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    fetch('http://localhost:5000/api/students')
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error('Failed to fetch students', err));
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setIsAdding(false);
  };

  const handleDeleteClick = (id) => {
    fetch(`http://localhost:5000/api/students/${id}`, {
      method: 'DELETE',
    })
      .then(() => fetchStudents())
      .catch((err) => console.error('Failed to delete student', err));
  };

  const handleFormSuccess = () => {
    setEditingStudent(null);
    setIsAdding(false);
    fetchStudents();
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Registered Students</h2>

      {/* زر إضافة طالب جديد */}
      {!isAdding && !editingStudent && (
        <button onClick={() => setIsAdding(true)} className="mb-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          + Add New Student
        </button>
      )}

      {/* فورم الإضافة */}
      {isAdding && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Add Student</h3>
          <StudentForm onSuccess={handleFormSuccess} onCancel={() => setIsAdding(false)} />
        </div>
      )}

      {/* فورم التعديل */}
      {editingStudent && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Edit Student</h3>
          <StudentForm existingStudent={editingStudent} onSuccess={handleFormSuccess} onCancel={() => setEditingStudent(null)} />
        </div>
      )}

      {/* جدول الطلاب */}
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Age</th>
            <th className="p-2 border">Grade</th>
            <th className="p-2 border">Paid</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, idx) => (
            <tr key={student.id}>
              <td className="p-2 border">{idx + 1}</td>
              <td className="p-2 border">{student.name}</td>
              <td className="p-2 border">{student.age}</td>
              <td className="p-2 border">{student.grade}</td>
              <td className="p-2 border">{student.paid ? '✅' : '❌'}</td>
              <td className="p-2 border space-x-2">
                <button className="px-2 py-1 text-sm bg-yellow-400 text-white rounded hover:bg-yellow-500" onClick={() => handleEditClick(student)}>
                  Edit
                </button>
                <button className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleDeleteClick(student.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
