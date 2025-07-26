import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';

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
        <Route path="/add" element={<StudentForm />} />
        <Route path="/" element={<StudentList />} />
      </Routes>
    </Router>
  );
}

export default App;
