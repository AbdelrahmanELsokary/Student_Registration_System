// src/App.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';

export default function App() {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Student Registration</h1>
      <StudentForm onStudentAdded={fetchStudents} />
      <StudentList students={students} onRefresh={fetchStudents} />
    </div>
  );
}
