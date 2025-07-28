import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AttendanceStats = () => {
  const [summary, setSummary] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  const gradeOptions = [
    'First Preparatory',
    'Second Preparatory',
    'Third Preparatory',
    'First Secondary',
    'Second Secondary',
    'Third Secondary',
  ];

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/attendance/summary', {
          params: {
            date: selectedDate || undefined,
            grade: selectedGrade || undefined,
          },
        });
        setSummary(res.data);
      } catch (err) {
        console.error('Error fetching summary:', err);
      }
    };

    fetchSummary();
  }, [selectedDate, selectedGrade]);

  const calculatePercentage = (present, absent) => {
    const total = present + absent;
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  };

  const averagePercentage = () => {
    if (summary.length === 0) return 0;
    const total = summary.reduce(
      (acc, s) => acc + calculatePercentage(s.present, s.absent),
      0
    );
    return Math.round(total / summary.length);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-green-700">Attendance Summary</h2>

      <div className="mb-8 flex flex-col md:flex-row items-center justify-center gap-6">
        <div>
          <label className="text-sm font-medium block mb-1">Filter by Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Filter by Grade:</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Select Grade --</option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 w-48 text-center">
          <div className="text-gray-600 text-sm">Total Students</div>
          <div className="text-xl font-bold text-green-600">{summary.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 w-48 text-center">
          <div className="text-gray-600 text-sm">Average Attendance</div>
          <div className="text-xl font-bold text-blue-600">{averagePercentage()}%</div>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        {summary.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-800">
            <thead className="bg-green-100 text-green-900">
              <tr>
                <th className="py-3 px-4 text-left font-semibold border-r border-gray-300">Student Name</th>
                <th className="py-3 px-4 text-center font-semibold border-r border-gray-300">Present</th>
                <th className="py-3 px-4 text-center font-semibold border-r border-gray-300">Absent</th>
                <th className="py-3 px-4 text-center font-semibold">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summary.map((student, index) => (
                <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-3 px-4 border-r border-gray-200">{student.name}</td>
                  <td className="py-3 px-4 text-center text-green-600 font-semibold border-r border-gray-200">
                    {student.present}
                  </td>
                  <td className="py-3 px-4 text-center text-red-600 font-semibold border-r border-gray-200">
                    {student.absent}
                  </td>
                  <td className="py-3 px-4 text-center text-blue-600 font-semibold">
                    {calculatePercentage(student.present, student.absent)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-8">No data available for selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default AttendanceStats;
