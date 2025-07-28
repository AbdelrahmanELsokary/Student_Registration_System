import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddStudentPage from './components/pages/AddStudent';
import StudentListPage from './components/pages/StudentList';
import EditStudentForm from './components/EditStudentForm';
import Navbar from './components/layout/Header'; 
import Attendance from './components/AttendanceForm';
function App() {
  return (
    <Router>
      <div className="min-h-screen p-4 bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/edit/:id" element={<EditStudentForm />} />
          <Route path="/" element={<AddStudentPage />} />
          <Route path="/students" element={<StudentListPage />} />
          <Route path="/attendance" element={<Attendance />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
