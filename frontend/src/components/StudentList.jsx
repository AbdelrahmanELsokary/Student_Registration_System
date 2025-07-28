import React, { useState } from 'react';
import axios from 'axios';
import EditStudentForm from './EditStudentForm';

export default function StudentList({ students, onRefresh }) {
  const [editingStudent, setEditingStudent] = useState(null);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/delete/${id}`);
      onRefresh();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Student List</h2>
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full text-sm text-left text-gray-700 bg-white">
          <thead className="bg-gray-100 text-gray-900 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{student.name}</td>
                <td className="px-6 py-4">{student.email}</td>
                <td className="px-6 py-4">{student.phone}</td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button onClick={() => setEditingStudent(student)} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(student.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingStudent && (
        <div className="mt-6">
          <EditStudentForm student={editingStudent} onClose={() => setEditingStudent(null)} onRefresh={onRefresh} />
        </div>
      )}
    </div>
  );
}
