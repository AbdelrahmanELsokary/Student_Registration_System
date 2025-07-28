import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AddStudentPage from './components/pages/AddStudent';
import StudentListPage from './components/pages/StudentList';
import EditStudentForm from './components/EditStudentForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen p-4 bg-gray-50">
        <nav className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Student System's <br /> Mr/MUHAMED NOAMAN
          </h1>
          <div className="space-x-4">
            <Link to="/" className="text-blue-600 hover:underline">
              Add Student
            </Link>
            <Link to="/students" className="text-blue-600 hover:underline">
              View Students
            </Link>
          </div>
        </nav>
        <Routes>
          <Route path="/edit/:id" element={<EditStudentForm />} />
          <Route path="/" element={<AddStudentPage />} />
          <Route path="/students" element={<StudentListPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
