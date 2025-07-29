import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [searchName, setSearchName] = useState('');

  const fetchAttendance = async (date, grade = '', name = '') => {
    try {
      let url = `http://127.0.0.1:5000/attendance/date/${date}`;
      const params = {};
      if (grade) params.grade = grade;
      if (name) params.name = name;

      const res = await axios.get(url, { params });
      setStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      toast.error('Failed to fetch attendance data.');
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate, selectedGrade, searchName);
  }, [selectedDate, selectedGrade, searchName]);

  const handleAttendance = async (studentId, status) => {
    try {
      await axios.post('http://127.0.0.1:5000/attendance', {
        student_id: studentId,
        date: selectedDate,
        status,
      });
      toast.success(`Successfully marked as ${status}.`);
      fetchAttendance(selectedDate, selectedGrade, searchName);
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      toast.error('Failed to mark attendance.');
    }
  };

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-blue-700 mb-8 text-center">Student Attendance</h2>

      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Select Grade:</label>
          <select className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
            <option value="">All</option>
            <option value="First Preparatory">First Preparatory</option>
            <option value="Second Preparatory">Second Preparatory</option>
            <option value="Third Preparatory">Third Preparatory</option>
            <option value="First Secondary">First Secondary</option>
            <option value="Second Secondary">Second Secondary</option>
            <option value="Third Secondary">Third Secondary</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Search Name:</label>
          <input
            type="search"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Type student name"
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-center border border-gray-300 shadow-md rounded-lg">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Grade</th>
              <th className="border p-2">Guardian Phone</th>
              <th className="border p-2">Fees Paid</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Mark</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="bg-white border-t hover:bg-gray-50">
                  <td className="border p-2">{student.name}</td>
                  <td className="border p-2">{student.grade}</td>
                  <td className="border p-2">{student.guardian_phone}</td>
                  <td className="border p-2">{student.fees_paid ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-red-500 font-semibold">No</span>}</td>

                  <td className="border p-2">
                    {student.status === 'present' ? (
                      <span className="text-green-600 font-semibold">Present</span>
                    ) : student.status === 'absent' ? (
                      <span className="text-red-600 font-semibold">Absent</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="border p-2">
                    <button onClick={() => handleAttendance(student.id, 'present')} className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded mr-2">
                      ✅
                    </button>
                    <button onClick={() => handleAttendance(student.id, 'absent')} className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
                      ❌
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
