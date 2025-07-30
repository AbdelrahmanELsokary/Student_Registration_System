import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

// خدمة للتعامل مع طلبات API
const attendanceService = {
  fetchAttendance: async (date, grade, name) => {
    const params = { date };
    if (grade) params.grade = grade;
    if (name) params.name = name;

    const response = await axios.get(`http://127.0.0.1:5000/attendance/date/${date}`, { params });
    return response.data;
  },

  markAttendance: async (studentId, date, status) => {
    await axios.post('http://127.0.0.1:5000/attendance', {
      student_id: studentId,
      date,
      status,
    });
  },

  updateScores: async (studentId, date, scores) => {
    await axios.put(`http://127.0.0.1:5000/students/${studentId}/scores`, {
      date,
      daily_recitation_score: scores.daily_recitation ?? null,
      test_score: scores.test ?? null,
    });
  },
};

// مكون لخيارات الفلترة
const FilterControls = ({ date, grade, name, onDateChange, onGradeChange, onNameChange, t }) => {
  const gradeOptions = ['First Preparatory', 'Second Preparatory', 'Third Preparatory', 'First Secondary', 'Second Secondary', 'Third Secondary'];

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-6 mb-8">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('attendance.selectDate')}:</label>
        <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('attendance.selectGrade')}:</label>
        <select className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={grade} onChange={(e) => onGradeChange(e.target.value)}>
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
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('attendance.namePlaceholder')}
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

// مكون لصف الطالب
const StudentRow = ({ student, onMarkAttendance, onScoreChange, editingScores, onSaveScores, t }) => {
  const isEditing = editingScores[student.id];
  const hasChanges =
    isEditing &&
    ((isEditing.daily_recitation !== undefined && isEditing.daily_recitation !== student.daily_recitation_score) || (isEditing.test !== undefined && isEditing.test !== student.test_score));

  return (
    <tr className="bg-white border-t hover:bg-gray-50">
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
          value={isEditing?.daily_recitation ?? student.daily_recitation_score ?? ''}
          onChange={(e) => onScoreChange(student.id, 'daily_recitation', e.target.value)}
          className="w-20 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 px-3 py-1 text-center bg-white shadow-sm transition"
        />
      </td>
      <td className="border p-2 bg-gray-50">
        <input
          type="number"
          min="0"
          max="20"
          value={isEditing?.test ?? student.test_score ?? ''}
          onChange={(e) => onScoreChange(student.id, 'test', e.target.value)}
          className="w-20 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 px-3 py-1 text-center bg-white shadow-sm transition"
        />
      </td>
      <td className="border p-2 space-x-2 min-w-[200px]">
        <button
          onClick={() => onSaveScores(student.id)}
          disabled={!hasChanges}
          className={`px-3 py-1 rounded ${hasChanges ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
        >
          {t('attendance.save')}
        </button>
        <button onClick={() => onMarkAttendance(student.id, 'present')} className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded">
          {t('attendance.presentBtn')}
        </button>
        <button onClick={() => onMarkAttendance(student.id, 'absent')} className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
          {t('attendance.absentBtn')}
        </button>
      </td>
    </tr>
  );
};

export default function Attendance() {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState({
    students: [],
    selectedDate: new Date().toISOString().split('T')[0],
    selectedGrade: '',
    searchName: '',
    isLoading: false,
    editingScores: {},
  });

  const fetchAttendance = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await attendanceService.fetchAttendance(state.selectedDate, state.selectedGrade, state.searchName);
      setState((prev) => ({ ...prev, students: data, editingScores: {} }));
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      toast.error(t('toast.fetchError'));
      setState((prev) => ({ ...prev, students: [] }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [state.selectedDate, state.selectedGrade, state.searchName, t]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleAttendance = async (studentId, status) => {
    try {
      await attendanceService.markAttendance(studentId, state.selectedDate, status);
      toast.success(t(`attendance.${status}Success`));
      fetchAttendance();
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      toast.error(t('attendance.markError'));
    }
  };

  const handleScoreChange = (studentId, field, value) => {
    if (value === '' || (!isNaN(value) && value >= 0)) {
      setState((prev) => ({
        ...prev,
        editingScores: {
          ...prev.editingScores,
          [studentId]: {
            ...prev.editingScores[studentId],
            [field]: value === '' ? '' : Number(value),
          },
        },
      }));
    }
  };

  const saveScores = async (studentId) => {
    try {
      const scores = state.editingScores[studentId];
      if (!scores) return;

      await attendanceService.updateScores(studentId, state.selectedDate, {
        daily_recitation: scores.daily_recitation,
        test: scores.test,
      });

      toast.success(t('attendance.scoresSaved'));
      fetchAttendance();
    } catch (error) {
      console.error('Failed to save scores:', error);
      toast.error(t('attendance.scoresError'));
    }
  };

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-4xl font-bold text-blue-700 mb-8 text-center">{t('attendance.title')}</h2>

      <FilterControls
        date={state.selectedDate}
        grade={state.selectedGrade}
        name={state.searchName}
        onDateChange={(date) => setState((prev) => ({ ...prev, selectedDate: date }))}
        onGradeChange={(grade) => setState((prev) => ({ ...prev, selectedGrade: grade }))}
        onNameChange={(name) => setState((prev) => ({ ...prev, searchName: name }))}
        t={t}
      />

      {state.isLoading ? (
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
              {state.students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    {t('attendance.noStudents')}
                  </td>
                </tr>
              ) : (
                state.students.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    onMarkAttendance={handleAttendance}
                    onScoreChange={handleScoreChange}
                    editingScores={state.editingScores}
                    onSaveScores={saveScores}
                    t={t}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
