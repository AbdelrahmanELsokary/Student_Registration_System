import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/students');
      setStudents(res.data);
      setError(null);
    } catch {
      toast.error('Failed to fetch students');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`http://127.0.0.1:5000/delete/${id}`);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch {
        toast.error('Failed to delete student');
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Students List</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Grade</th>
            <th className="border px-4 py-2">Guardian Phone</th>
            <th className="border px-4 py-2">Fees Paid</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{student.name}</td>
              <td className="border px-4 py-2">{student.grade}</td>
              <td className="border px-4 py-2">{student.guardian_phone}</td>
              <td className="border px-4 py-2">
                {student.fees_paid ? '✅' : '❌'}
              </td>
              <td className="border px-4 py-2 space-x-2">
                <Link
                  to={`/edit/${student.id}`}
                  className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <Link
                  to={`/students/${student.id}/details`}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
