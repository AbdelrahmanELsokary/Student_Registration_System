import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentListPage from './components/pages/StudentList';
import AddStudentPage from './components/pages/AddStudent';
import EditStudentForm from './components/EditStudentForm';
import Attendance from './components/AttendanceForm';
import Navbar from './components/layout/Header';
import AttendanceStats from './components/pages/AttendanceStats';

function App() {
  return (
    <Router>
      <div className="min-h-screen p-4 bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/frontend/src/components/StudentForm.jsx" element={<AddStudentPage />} />
          <Route path="/attendance-summary" element={<AttendanceStats />} />
          <Route path="/edit/:id" element={<EditStudentForm />} />
          <Route path="/students" element={<StudentListPage />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/" element={<AddStudentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
