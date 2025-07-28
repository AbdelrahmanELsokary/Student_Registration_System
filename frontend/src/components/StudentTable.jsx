import React from 'react';
import { Link } from 'react-router-dom';

export default function StudentsTable({ students, onDelete }) {
  return (
    <table className="w-full table-auto border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="border px-4 py-2">Name</th>
          <th className="border px-4 py-2">Grade</th>
          <th className="border px-4 py-2">Parent Phone</th>
          <th className="border px-4 py-2">Fees Paid</th>
          <th className="border px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s.id} className="text-center">
            <td className="border px-4 py-2">{s.name}</td>
            <td className="border px-4 py-2">{s.grade}</td>
            <td className="border px-4 py-2">{s.guardian_phone}</td> {/* ✅ تم التعديل */}
            <td className="border px-4 py-2">{s.fees_paid ? 'Yes' : 'No'}</td> {/* ✅ تم التعديل */}
            <td className="border px-4 py-2 space-x-2">
              <Link to={`/edit/${s.id}`} className="text-blue-600 hover:underline">
                Edit
              </Link>
              <button onClick={() => onDelete(s.id)} className="text-red-600 hover:underline">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
