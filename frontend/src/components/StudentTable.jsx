import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaSearch, FaSyncAlt, FaFileCsv } from 'react-icons/fa';

export default function StudentsTable({ students, onDelete, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');

  const allGrades = [...new Set(students.map((s) => s.grade))];

  // Filter students based on search and selected grade
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'All' || s.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const groupedStudents = filteredStudents.reduce((groups, student) => {
    const grade = student.grade || 'Unknown';
    if (!groups[grade]) groups[grade] = [];
    groups[grade].push(student);
    return groups;
  }, {});

  const exportToCSV = () => {
    const headers = ['Name', 'Grade', 'Parent Phone', 'Fees Paid'];
    const rows = filteredStudents.map((s) => [s.name, s.grade, s.guardian_phone, s.fees_paid ? 'Yes' : 'No']);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = selectedGrade === 'All' ? 'students.csv' : `students_${selectedGrade}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 text-blue-800 p-4 rounded-lg shadow text-center">
          <h4 className="text-sm font-semibold">Total Students</h4>
          <p className="text-2xl font-bold">{filteredStudents.length}</p>
        </div>
        <div className="bg-green-100 text-green-800 p-4 rounded-lg shadow text-center">
          <h4 className="text-sm font-semibold">Paid</h4>
          <p className="text-2xl font-bold">{filteredStudents.filter((s) => s.fees_paid).length}</p>
        </div>
        <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow text-center">
          <h4 className="text-sm font-semibold">Unpaid</h4>
          <p className="text-2xl font-bold">{filteredStudents.filter((s) => !s.fees_paid).length}</p>
        </div>
      </div>

      {/* Search, Filter, Buttons */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
        <div className="relative w-full sm:w-1/3">
          <input
            type="search"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Grades</option>
          {allGrades.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>

        <button onClick={onRefresh} className="flex items-center bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm shadow-sm">
          <FaSyncAlt className="mr-2" /> Refresh
        </button>

        <button onClick={exportToCSV} className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm shadow-sm">
          <FaFileCsv className="mr-2" /> Export
        </button>
      </div>

      {/* Students Table Grouped */}
      {Object.keys(groupedStudents).length === 0 ? (
        <div className="text-center text-gray-500 py-10">No students found.</div>
      ) : (
        Object.entries(groupedStudents).map(([grade, studentsInGrade]) => (
          <div key={grade} className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">Grade: {grade}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 divide-y divide-gray-300 shadow-md rounded-lg">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">Grade</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">Parent Phone</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">Fees Paid</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsInGrade.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 border-r">{s.name}</td>
                      <td className="px-4 py-2 border-r">{s.grade}</td>
                      <td className="px-4 py-2 border-r">{s.guardian_phone}</td>
                      <td className="px-4 py-2 text-center border-r">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${s.fees_paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {s.fees_paid ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center space-x-2">
                        <Link to={`/edit/${s.id}`} className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs">
                          <FaEdit className="mr-1" /> Edit
                        </Link>
                        <button onClick={() => onDelete(s.id)} className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs">
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
