import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentTable({ students, onRefresh }) {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/delete/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete student');

      await res.json();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-300 shadow rounded-xl">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">#</th>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Phone</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students?.map((student, index) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border text-center">{index + 1}</td>
              <td className="px-4 py-2 border">{student.name}</td>
              <td className="px-4 py-2 border">{student.email}</td>
              <td className="px-4 py-2 border">{student.phone}</td>
              <td className="px-4 py-2 border text-center space-x-2">
                <button onClick={() => navigate(`/edit/${student.id}`)} className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm">
                  Edit
                </button>
                <button onClick={() => handleDelete(student.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm">
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
