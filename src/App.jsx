import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import EditStudentForm from './components/EditStudentForm';

function AddStudentWrapper() {
  const navigate = useNavigate();

  return (
    <StudentForm
      onSuccess={() => navigate('/')}
      onCancel={() => navigate('/')}
    />
  );
}

function EditStudentWrapper() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <EditStudentForm
      id={id}
      onSuccess={() => navigate('/')}
      onCancel={() => navigate('/')}
    />
  );
}

function App() {
  return (
    <Router>
      <nav className="flex justify-center space-x-4 bg-gray-200 p-4">
        <Link to="/" className="text-blue-600 hover:underline">
          Student List
        </Link>
        <Link to="/add" className="text-blue-600 hover:underline">
          Add Student
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<StudentList />} />
        <Route path="/add" element={<AddStudentWrapper />} />
        <Route path="/edit/:id" element={<EditStudentWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;
