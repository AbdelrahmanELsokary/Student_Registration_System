import React from 'react';

export default function StudentTable({ students = [], onRefresh }) {
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/delete/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      console.log('Deleted:', data);

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr key={student.id} className="border-t">
                <td className="p-3">{student.name}</td>
                <td className="p-3">{student.email}</td>
                <td className="p-3">{student.phone}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleDelete(student.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">
                No students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
