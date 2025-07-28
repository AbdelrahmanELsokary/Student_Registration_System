import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentsTable from '../StudentTable';
import { toast } from 'react-toastify';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/students');
      setStudents(res.data);
      setError(null);
    } catch  {
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
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Students List</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <StudentsTable students={students} onDelete={handleDelete} />
    </div>
  );
}
