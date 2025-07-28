import { Link } from 'react-router-dom';

export default function StudentsTable({ students, onDelete }) {
  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full border border-gray-300 divide-y divide-gray-200 shadow-md rounded-lg">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Grade</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Parent Phone</th>
            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Fees Paid</th>
            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No students found.
              </td>
            </tr>
          ) : (
            students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2 text-sm text-gray-800">{s.name}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{s.grade}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{s.guardian_phone}</td>
                <td className="px-4 py-2 text-center text-sm">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${s.fees_paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.fees_paid ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-2 text-center text-sm flex justify-center space-x-2">
                  <Link to={`/edit/${s.id}`} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs shadow-sm transition">
                    Edit
                  </Link>
                  <button onClick={() => onDelete(s.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs shadow-sm transition">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
