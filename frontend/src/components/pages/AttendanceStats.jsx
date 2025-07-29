import React, { useEffect, useState, useCallback } from 'react'; 
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AttendanceStats() {
  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [studentsSummary, setStudentsSummary] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('');

  const fetchSummary = useCallback(
    async (date, grade = '') => {
      try {
        const params = { date };
        if (grade) params.grade = grade;
        const res = await axios.get(`http://127.0.0.1:5000/attendance/summary`, { params });
        setSummary(res.data);
      } catch {
        toast.error(t('toast.fetchError'));
        setSummary(null);
      }
    },
    [t]
  );

  const fetchStudentsSummary = useCallback(
    async (grade = '') => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/attendance/summary/students`, {
          params: grade ? { grade } : {},
        });
        setStudentsSummary(res.data);
      } catch {
        toast.error(t('toast.studentsSummaryError'));
      }
    },
    [t]
  ); 
  useEffect(() => {
    fetchSummary(selectedDate, selectedGrade);
    fetchStudentsSummary(selectedGrade);
  }, [selectedDate, selectedGrade, fetchSummary, fetchStudentsSummary]);

  const pieChartData = summary
    ? [
        { name: t('chart.present'), value: summary.present_count },
        { name: t('chart.absent'), value: summary.absent_count },
      ]
    : [];

  const COLORS = ['#10B981', '#EF4444']; // Green & Red

  const gradeOptions = ['First Preparatory', 'Second Preparatory', 'Third Preparatory', 'First Secondary', 'Second Secondary', 'Third Secondary'];

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto space-y-10" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-700">{t('stats.title')}</h2>

      <div className="flex flex-wrap items-center justify-center gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('stats.selectDate')}:</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2 w-48" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('stats.selectGrade')}:</label>
          <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2 w-48">
            <option value="">{t('stats.allGrades')}</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {t(`grades.${grade.toLowerCase().replace(/ /g, '')}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('stats.totalStudents')}</h3>
            <p className="text-4xl font-bold text-blue-600">{summary.total_students_registered}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {t('stats.presentOn')} {summary.date}
            </h3>
            <p className="text-4xl font-bold text-green-600">{summary.present_count}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {t('stats.absentOn')} {summary.date}
            </h3>
            <p className="text-4xl font-bold text-red-600">{summary.absent_count}</p>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">{t('loading')}</p>
      )}

      <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
        <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">{t('stats.pieChartTitle')}</h3>
        {summary?.present_count > 0 || summary?.absent_count > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} ${t('chart.students')}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">{t('stats.noData')}</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 overflow-x-auto">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('stats.studentsSummaryTitle')}</h3>
        <table className="min-w-full border-collapse border border-gray-300 text-sm text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">{t('stats.studentName')}</th>
              <th className="border px-4 py-2">{t('stats.grade')}</th>
              <th className="border px-4 py-2 text-green-600">{t('stats.present')}</th>
              <th className="border px-4 py-2 text-red-600">{t('stats.absent')}</th>
            </tr>
          </thead>
          <tbody>
            {studentsSummary.length > 0 ? (
              studentsSummary.map((student) => (
                <tr key={student.student_id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{student.name}</td>
                  <td className="border px-4 py-2">{t(`grades.${student.grade.toLowerCase().replace(/ /g, '')}`)}</td>
                  <td className="border px-4 py-2 text-green-700 font-semibold">{student.present_count}</td>
                  <td className="border px-4 py-2 text-red-700 font-semibold">{student.absent_count}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 text-gray-500">
                  {t('stats.noStudentData')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
