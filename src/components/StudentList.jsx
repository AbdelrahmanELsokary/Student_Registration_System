import React, { useEffect, useState } from 'react';
import StudentForm from './StudentForm';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('https://studentregistrationsystem-production-06d9.up.railway.app/api/students');

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setStudents(data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load student data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setIsAdding(false);
  };

  const handleDeleteClick = async (id) => {
    try {
      const response = await fetch(`https://studentregistrationsystem-production-06d9.up.railway.app/api/students/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student. Please try again.');
    }
  };

  const handleFormSuccess = () => {
    setEditingStudent(null);
    setIsAdding(false);
    fetchStudents();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4">Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-red-50 text-red-600 rounded-xl">
        <p>{error}</p>
        <button onClick={fetchStudents} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Registered Students</h2>

      {/* زر إضافة طالب جديد */}
      {!isAdding && !editingStudent && (
        <button onClick={() => setIsAdding(true)} className="mb-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          + Add New Student
        </button>
      )}

      {/* فورم الإضافة/التعديل */}
      {(isAdding || editingStudent) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-semibold mb-2">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
          <StudentForm
            existingStudent={editingStudent}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setEditingStudent(null);
              setIsAdding(false);
            }}
          />
        </div>
      )}

      {/* جدول الطلاب */}
      {students.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border">#</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Age</th>
                <th className="p-3 border">Grade</th>
                <th className="p-3 border">Paid</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{idx + 1}</td>
                  <td className="p-3 border">{student.name}</td>
                  <td className="p-3 border">{student.age}</td>
                  <td className="p-3 border">{student.grade}</td>
                  <td className="p-3 border">{student.paid ? '✅' : '❌'}</td>
                  <td className="p-3 border space-x-2">
                    <button className="px-3 py-1 text-sm bg-yellow-400 text-white rounded hover:bg-yellow-500" onClick={() => handleEditClick(student)}>
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this student?')) {
                          handleDeleteClick(student.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No students found. Click "Add New Student" to get started.</div>
      )}
    </div>
  );
}
