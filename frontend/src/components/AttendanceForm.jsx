import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today;
  });

  const fetchAttendance = async (date) => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/attendance/date/${date}`);
      setStudents(res.data);
    } catch {
      toast.error('Failed to fetch attendance');
      setStudents([]); // إفراغ الجدول في حال الخطأ
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  const handleAttendance = async (studentId, status) => {
    try {
      await axios.post('http://127.0.0.1:5000/attendance', {
        student_id: studentId,
        date: selectedDate,
        status: status
      });
      toast.success(`Marked as ${status}`);
      fetchAttendance(selectedDate);
    } catch {
      toast.error('Failed to mark attendance');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Attendance</h2>

      <div className="mb-4">
        <label className="block mb-2 text-gray-600 font-medium">Select Date:</label>
        <input
          type="date"
          className="border p-2 rounded"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
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
              <td colSpan="6" className="text-center p-4 text-gray-500">
                No students found for this date.
              </td>
            </tr>
          ) : (
            students.map((student, index) => (
              <tr key={`${student.id}-${index}`} className="text-center">
                <td className="border p-2">{student.name}</td>
                <td className="border p-2">{student.grade}</td>
                <td className="border p-2">{student.guardian_phone}</td>
                <td className="border p-2">{student.fees_paid ? 'Yes' : 'No'}</td>
                <td className="border p-2">
                  {student.status === 'present' ? (
                    <span className="text-green-600 font-semibold">Present</span>
                  ) : student.status === 'absent' ? (
                    <span className="text-red-600 font-semibold">Absent</span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleAttendance(student.id, 'present')}
                    className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded mr-2"
                  >
                    ✅
                  </button>
                  <button
                    onClick={() => handleAttendance(student.id, 'absent')}
                    className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                  >
                    ❌
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
