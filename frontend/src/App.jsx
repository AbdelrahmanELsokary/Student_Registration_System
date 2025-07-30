import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AttendanceStats from './components/pages/AttendanceStats';
import DirectionProvider from './components/DirectionProvider';
import StudentListPage from './components/pages/StudentList';
import AddStudentPage from './components/pages/AddStudent';
import EditStudentForm from './components/EditStudentForm';
import StudentDetails from './components/StudentDetails';
import Attendance from './components/AttendanceForm';
import Navbar from './components/layout/Header';
import './i18n';

function App() {
  return (
    <DirectionProvider>
      <Router>
        <div className="min-h-screen p-4 bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/students/:id/details" element={<StudentDetails />} />
            <Route path="/attendance-summary" element={<AttendanceStats />} />
            <Route path="/add-student" element={<AddStudentPage />} />
            <Route path="/students" element={<StudentListPage />} />
            <Route path="/edit/:id" element={<EditStudentForm />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/" element={<AddStudentPage />} />
          </Routes>
        </div>
      </Router>
    </DirectionProvider>
  );
}

export default App;
