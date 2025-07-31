import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Component for Filters ---
function AttendanceFilters({ selectedDate, setSelectedDate, selectedGrade, setSelectedGrade, gradeOptions, t }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-4 bg-white rounded-xl shadow border border-gray-200">
      <div>
        <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-1">
          {t('stats.selectDate')}:
        </label>
        <input
          id="date-select"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-48 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="grade-select" className="block text-sm font-medium text-gray-700 mb-1">
          {t('stats.selectGrade')}:
        </label>
        <select
          id="grade-select"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-48 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{t('stats.allGrades')}</option>
          {gradeOptions.map((grade) => (
            <option key={grade} value={grade}>
              {t(`grades.${grade.toLowerCase().replace(/ /g, '')}`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// --- Component for Summary Cards ---
function AttendanceSummaryCards({ summary, t }) {
  if (!summary) {
    return <p className="text-center text-gray-500">{t('loading')}</p>;
  }

  return (
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
  );
}

// --- Component for Pie Chart ---
function AttendancePieChart({ summary, t }) {
  const pieChartData = summary
    ? [
        { name: t('chart.present'), value: summary.present_count },
        { name: t('chart.absent'), value: summary.absent_count },
      ]
    : [];
  const COLORS = ['#10B981', '#EF4444'];

  return (
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
  );
}

// --- Component for Student Attendance Table with Search ---
function AttendanceStudentsTable({ studentsSummary, t, searchTerm, setSearchTerm }) {
  // Group students by grade
  const groupedByGrade = studentsSummary.reduce((acc, student) => {
    const gradeKey = student.grade.toLowerCase().replace(/ /g, '');
    if (!acc[gradeKey]) {
      acc[gradeKey] = [];
    }
    acc[gradeKey].push(student);
    return acc;
  }, {});

  // Filter students based on search term
  const filterStudents = (students) => {
    return students.filter((student) => student.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200 overflow-x-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('stats.studentsSummaryTitle')}</h3>
      <div className="mb-4">
        <input
          type="search"
          placeholder={t('stats.searchStudents')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-full max-w-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {Object.entries(groupedByGrade).map(([gradeKey, students]) => {
        const filteredStudents = filterStudents(students);
        if (filteredStudents.length === 0) return null;

        return (
          <div key={gradeKey} className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-blue-600">{t(`grades.${gradeKey}`)}</h4>
              <span className="text-sm text-gray-500">
                {filteredStudents.length} {t('chart.students')}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2 text-left">{t('stats.studentName')}</th>
                    <th className="border px-4 py-2">{t('stats.present')}</th>
                    <th className="border px-4 py-2">{t('stats.absent')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 text-left">{student.name}</td>
                      <td className="border px-4 py-2 text-green-700 font-semibold">{student.present_count}</td>
                      <td className="border px-4 py-2 text-red-700 font-semibold">{student.absent_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {Object.values(groupedByGrade).every((students) => filterStudents(students).length === 0) && <p className="text-center text-gray-500 py-4">{t('stats.noStudentData')}</p>}
    </div>
  );
}

// --- Main AttendanceStats Component ---
export default function AttendanceStats() {
  const { t, i18n } = useTranslation();

  const [summary, setSummary] = useState(null);
  const [studentsSummary, setStudentsSummary] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const gradeOptions = ['First Preparatory', 'Second Preparatory', 'Third Preparatory', 'First Secondary', 'Second Secondary', 'Third Secondary'];

  const fetchSummary = useCallback(
    async (date, grade = '') => {
      try {
        setIsLoading(true);
        const params = { date };
        if (grade) params.grade = grade;
        const res = await axios.get(`http://127.0.0.1:5000/attendance/summary`, { params });
        setSummary(res.data);
      } catch (error) {
        console.error('Error fetching summary:', error);
        toast.error(t('toast.fetchError'));
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  const fetchStudentsSummary = useCallback(
    async (grade = '') => {
      try {
        setIsLoading(true);
        const params = grade ? { grade } : {};
        const res = await axios.get(`http://127.0.0.1:5000/attendance/summary/students`, { params });
        setStudentsSummary(res.data);
      } catch (error) {
        console.error('Error fetching students summary:', error);
        toast.error(t('toast.studentsSummaryError'));
        setStudentsSummary([]);
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    fetchSummary(selectedDate, selectedGrade);
    fetchStudentsSummary(selectedGrade);
  }, [selectedDate, selectedGrade, fetchSummary, fetchStudentsSummary]);

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto space-y-10 font-sans" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-700">{t('stats.title')}</h2>

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">{t('loading')}</p>
          </div>
        </div>
      )}

      {/* Section 1: Filters */}
      <section>
        <AttendanceFilters selectedDate={selectedDate} setSelectedDate={setSelectedDate} selectedGrade={selectedGrade} setSelectedGrade={setSelectedGrade} gradeOptions={gradeOptions} t={t} />
      </section>

      {/* Section 2: Summary Cards */}
      <section>
        <AttendanceSummaryCards summary={summary} t={t} />
      </section>

      {/* Section 3: Pie Chart */}
      <section>
        <AttendancePieChart summary={summary} t={t} />
      </section>

      {/* Section 4: Student Attendance Tables */}
      <section>
        <AttendanceStudentsTable studentsSummary={studentsSummary} t={t} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </section>
    </div>
  );
}
