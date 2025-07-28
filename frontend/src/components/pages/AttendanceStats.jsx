import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const AttendanceView = () => {
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [grade, setGrade] = useState('All');
  const [summary, setSummary] = useState([]);

  const gradeOptions = ['All', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/attendance/date/${selectedDate}`, {
        params: { grade },
      });
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  }, [selectedDate, grade]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/attendance/summary', {
        params: { grade },
      });
      setSummary(res.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, [grade]);

  useEffect(() => {
    fetchAttendance();
    fetchSummary();
  }, [selectedDate, grade, fetchAttendance, fetchSummary]);

  const markAttendance = async (studentId, status) => {
    try {
      await axios.post('http://127.0.0.1:5000/attendance', {
        student_id: studentId,
        date: selectedDate,
        status,
      });
      fetchAttendance();
      fetchSummary();
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Attendance Tracker</h2>

      <div className="flex items-center gap-4 mb-4">
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border p-2 rounded" />
        <select value={grade} onChange={(e) => setGrade(e.target.value)} className="border p-2 rounded">
          {gradeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* جدول الحضور اليومي */}
      <table className="w-full border border-gray-300 mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Grade</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="text-center">
              <td className="border p-2">{student.name}</td>
              <td className="border p-2">{student.grade}</td>
              <td className="border p-2">{student.status || 'Not marked'}</td>
              <td className="border p-2 flex justify-center gap-2">
                <button onClick={() => markAttendance(student.id, 'present')} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded">
                  ✅
                </button>
                <button onClick={() => markAttendance(student.id, 'absent')} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* جدول ملخص الحضور */}
      <h3 className="text-lg font-semibold mb-2">Attendance Summary</h3>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Grade</th>
            <th className="border p-2">Times Present</th>
            <th className="border p-2">Times Absent</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((s) => (
            <tr key={s.student_id} className="text-center">
              <td className="border p-2">{s.name}</td>
              <td className="border p-2">{s.grade}</td>
              <td className="border p-2 text-green-600 font-bold">{s.present_count}</td>
              <td className="border p-2 text-red-600 font-bold">{s.absent_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceView;
