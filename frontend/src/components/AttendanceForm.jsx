import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export default function Attendance() {
  const { t, i18n } = useTranslation();
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [searchName, setSearchName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingScores, setEditingScores] = useState({});

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `http://127.0.0.1:5000/attendance/date/${selectedDate}`;
      const params = {};
      if (selectedGrade) params.grade = selectedGrade;
      if (searchName) params.name = searchName;

      const res = await axios.get(url, { params });
      setStudents(res.data);
      setEditingScores({});
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      toast.error(t('toast.fetchError'));
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedGrade, searchName, t]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleAttendance = async (studentId, status) => {
    try {
      await axios.post('http://127.0.0.1:5000/attendance', {
        student_id: studentId,
        date: selectedDate,
        status,
      });
      toast.success(t(`attendance.${status}Success`));
      fetchAttendance();
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      toast.error(t('attendance.markError'));
    }
  };

  const handleScoreChange = (studentId, field, value) => {
    if (value === '' || (!isNaN(value) && value >= 0)) {
      setEditingScores((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [field]: value === '' ? '' : Number(value),
        },
      }));
    }
  };

  const saveScores = async (studentId) => {
    try {
      const scores = editingScores[studentId];
      if (!scores) return;

      const dailyRecitation = scores.daily_recitation !== undefined ? scores.daily_recitation : null;
      const testScore = scores.test !== undefined ? scores.test : null;

      await axios.put(`http://127.0.0.1:5000/students/${studentId}/scores`, {
        date: selectedDate,
        daily_recitation_score: dailyRecitation,
        test_score: testScore,
      });

      toast.success(t('attendance.scoresSaved'));
      fetchAttendance();
    } catch (error) {
      console.error('Failed to save scores:', error);
      toast.error(t('attendance.scoresError'));
    }
  };

  const gradeOptions = ['First Preparatory', 'Second Preparatory', 'Third Preparatory', 'First Secondary', 'Second Secondary', 'Third Secondary'];

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-4xl font-bold text-blue-700 mb-8 text-center">{t('attendance.title')}</h2>

      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('attendance.selectDate')}:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('attendance.selectGrade')}:</label>
          <select className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
            <option value="">{t('attendance.all')}</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {t(`grades.${grade.toLowerCase().replace(/ /g, '')}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('attendance.searchName')}:</label>
          <input
            type="search"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder={t('attendance.namePlaceholder')}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-600 font-semibold">{t('loading')}...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-center border border-gray-300 shadow-md rounded-lg">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="border p-2">{t('attendance.name')}</th>
                <th className="border p-2">{t('attendance.grade')}</th>
                <th className="border p-2">{t('attendance.guardianPhone')}</th>
                <th className="border p-2">{t('attendance.feesPaid')}</th>
                <th className="border p-2">{t('attendance.status')}</th>
                <th className="border p-2">{t('attendance.dailyRecitation')} (0-10)</th>
                <th className="border p-2">{t('attendance.test')} (0-20)</th>
                <th className="border p-2">{t('attendance.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    {t('attendance.noStudents')}
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const isEditing = editingScores[student.id];
                  const hasChanges =
                    isEditing &&
                    ((isEditing.daily_recitation !== undefined && isEditing.daily_recitation !== student.daily_recitation_score) ||
                      (isEditing.test !== undefined && isEditing.test !== student.test_score));

                  return (
                    <tr key={student.id} className="bg-white border-t hover:bg-gray-50">
                      <td className="border p-2">{student.name}</td>
                      <td className="border p-2">{t(`grades.${student.grade.toLowerCase().replace(/ /g, '')}`)}</td>
                      <td className="border p-2">{student.guardian_phone}</td>
                      <td className="border p-2">
                        {student.fees_paid ? <span className="text-green-600 font-semibold">{t('attendance.yes')}</span> : <span className="text-red-500 font-semibold">{t('attendance.no')}</span>}
                      </td>
                      <td className="border p-2">
                        {student.status === 'present' ? (
                          <span className="text-green-600 font-semibold">{t('attendance.present')}</span>
                        ) : student.status === 'absent' ? (
                          <span className="text-red-600 font-semibold">{t('attendance.absent')}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="border p-2 bg-gray-50">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={editingScores[student.id]?.daily_recitation !== undefined ? editingScores[student.id].daily_recitation : student.daily_recitation_score ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'daily_recitation', e.target.value)}
                          className="w-20 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 px-3 py-1 text-center bg-white shadow-sm transition"
                          placeholder="تسميع"
                        />
                      </td>
                      <td className="border p-2 bg-gray-50">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={editingScores[student.id]?.test !== undefined ? editingScores[student.id].test : student.test_score ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'test', e.target.value)}
                          className="w-20 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 px-3 py-1 text-center bg-white shadow-sm transition"
                          placeholder="اختبار"
                        />
                      </td>

                      <td className="border p-2 space-x-2 min-w-[200px]">
                        <button
                          onClick={() => saveScores(student.id)}
                          disabled={!hasChanges}
                          className={`px-3 py-1 rounded ${hasChanges ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                        >
                          {t('attendance.save')}
                        </button>
                        <button onClick={() => handleAttendance(student.id, 'present')} className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded">
                          {t('attendance.presentBtn')}
                        </button>
                        <button onClick={() => handleAttendance(student.id, 'absent')} className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
                          {t('attendance.absentBtn')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
