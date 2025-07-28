import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaSearch, FaSyncAlt, FaFileCsv } from 'react-icons/fa';

export default function StudentsTable({ students, onDelete, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // دالة تصدير CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Grade', 'Parent Phone', 'Fees Paid'];
    const rows = filteredStudents.map((s) => [s.name, s.grade, s.guardian_phone, s.fees_paid ? 'Yes' : 'No']);
    let csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4">
      <div className="p-4">
        {/* شريط البحث + الأزرار */}
        <div className="mb-4 max-w-full mx-auto space-y-2 sm:space-y-0 sm:space-x-2 sm:flex sm:items-center">
          {/* مربع البحث */}
          <div className="flex-grow relative sm:flex-grow-[2]">
            <input
              type="search"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          {/* زر الريفرش */}
          <button
            onClick={onRefresh}
            title="Refresh List"
            className="w-full sm:w-auto flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm shadow-sm transition"
          >
            <FaSyncAlt className="mr-2" /> Refresh
          </button>

          {/* زر التصدير */}
          <button
            onClick={exportToCSV}
            title="Export CSV"
            className="w-full sm:w-auto flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm shadow-sm transition"
          >
            <FaFileCsv className="mr-2" /> Export
          </button>
        </div>
      </div>
      {/* الجدول */}
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
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s, index) => (
                <tr key={s.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{s.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{s.grade}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{s.guardian_phone}</td>
                  <td className="px-4 py-2 text-center text-sm border-r border-gray-200">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${s.fees_paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.fees_paid ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center text-sm flex justify-center space-x-2">
                    <Link to={`/edit/${s.id}`} title="Edit Student" className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs shadow-sm transition">
                      <FaEdit className="mr-1" /> Edit
                    </Link>
                    <button
                      onClick={() => onDelete(s.id)}
                      title="Delete Student"
                      className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs shadow-sm transition"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
