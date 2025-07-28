import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="bg-green-600/90 shadow-md mb-8 top-0 sticky z-50 rounded-lg">
      <nav className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
        {/* الشعار واسم السيستم */}
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105">
            <img src="/assets/images/logo.webp" alt="logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-white text-center sm:text-left text-xl sm:text-2xl font-extrabold leading-tight">
            Student System
            <br />
            <span className="text-sm font-light">Mr/MUHAMED NOAMAN</span>
          </h1>
        </div>

        {/* الروابط */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <Link to="/" className="bg-white text-green-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-100 hover:scale-105 transition-transform duration-300 w-full sm:w-auto text-center">
            Add Student
          </Link>
          <Link
            to="/students"
            className="bg-white text-green-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-100 hover:scale-105 transition-transform duration-300 w-full sm:w-auto text-center"
          >
            View Students
          </Link>
          <Link
            to="/attendance"
            className="bg-white text-green-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-100 hover:scale-105 transition-transform duration-300 w-full sm:w-auto text-center"
          >
            Attendance registration
          </Link>
        </div>
      </nav>
    </header>
  );
}
