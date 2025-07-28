import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function AttendanceStats() {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/attendance/summary');
        setSummary(res.data);
      } catch {
        toast.error('Failed to fetch attendance summary');
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">Attendance Summary</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-center border border-gray-300 shadow-md rounded-lg">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Grade</th>
              <th className="border p-2 text-green-600">Present</th>
              <th className="border p-2 text-red-600">Absent</th>
            </tr>
          </thead>
          <tbody>
            {summary.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No data available.
                </td>
              </tr>
            ) : (
              summary.map((student, index) => (
                <tr key={index} className="bg-white border-t hover:bg-gray-50">
                  <td className="border p-2">{student.name}</td>
                  <td className="border p-2">{student.grade}</td>
                  <td className="border p-2 font-semibold text-green-600">{student.present}</td>
                  <td className="border p-2 font-semibold text-red-600">{student.absent}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
