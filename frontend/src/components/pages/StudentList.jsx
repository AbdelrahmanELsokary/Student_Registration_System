import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // استيراد useTranslation

export default function StudentList() {
  const { t, i18n } = useTranslation(['studentsTable', 'grades', 'toast']); // استخدام namespaces ذات الصلة
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true); // حالة للتحميل
  const [error, setError] = useState(null); // حالة لإدارة الأخطاء

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://127.0.0.1:5000/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      // استخدام مفتاح ترجمة من namespace 'toast'
      setError(t('toast.fetchStudentError'));
      toast.error(t('toast.fetchStudentError'));
    } finally {
      setLoading(false);
    }
  }, [t]); // إضافة t كاعتمادية لـ useCallback

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (id) => {
    // استخدام نافذة تأكيد مخصصة بدلاً من window.confirm
    // (لأن window.confirm قد يسبب مشاكل في بيئات معينة مثل iframes)
    // في هذا المثال، سنبقيها لتبسيط الكود، ولكن في تطبيق حقيقي يفضل استخدام modal
    if (window.confirm(t('studentsTable.confirmDelete'))) {
      // استخدام الترجمة لرسالة التأكيد
      try {
        await axios.delete(`http://127.0.0.1:5000/delete/${id}`);
        toast.success(t('toast.studentDeletedSuccess')); // استخدام الترجمة لرسالة النجاح
        fetchStudents();
      } catch (err) {
        console.error('Failed to delete student:', err);
        toast.error(t('toast.deleteStudentFailed')); // استخدام الترجمة لرسالة الفشل
      }
    }
  };

  // رسالة التحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center p-8 bg-white rounded-lg shadow-xl animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl font-semibold text-gray-700">{t('loading')}</p> {/* مفتاح 'loading' من الـ default namespace */}
        </div>
      </div>
    );
  }

  // رسالة الخطأ
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center bg-white p-10 rounded-lg shadow-xl border-t-4 border-red-500">
          <p className="text-3xl font-bold text-red-600 mb-5">{t('toast.fetchError')}</p> {/* استخدام مفتاح ترجمة من 'toast' */}
          <p className="text-lg text-gray-700 mb-8">{error}</p>
          <button
            onClick={fetchStudents}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {t('studentsTable.refresh')} {/* استخدام مفتاح ترجمة من 'studentsTable' */}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-3">{t('studentsTable.totalStudents')}</h2> {/* استخدام مفتاح ترجمة من 'studentsTable' */}
      {students.length === 0 ? (
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <p className="text-xl text-gray-600 mb-4">{t('studentsTable.noStudentsFound')}</p> {/* استخدام مفتاح ترجمة من 'studentsTable' */}
          <button onClick={fetchStudents} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
            {t('studentsTable.refresh')}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-xl rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm md:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('studentsTable.tableName')} {/* استخدام مفتاح ترجمة من 'studentsTable' */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('studentsTable.tableGrade')} {/* استخدام مفتاح ترجمة من 'studentsTable' */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('studentsTable.tableParentPhone')} {/* استخدام مفتاح ترجمة من 'studentsTable' */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('studentsTable.tableFeesPaid')} {/* استخدام مفتاح ترجمة من 'studentsTable' */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('studentsTable.tableActions')} {/* استخدام مفتاح ترجمة من 'studentsTable' */}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student, index) => (
                <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t(`grades.${student.grade.toLowerCase().replace(/ /g, '')}`)} {/* ترجمة الصف الدراسي */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.guardian_phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.fees_paid ? <span className="text-green-600 font-bold">{t('studentsTable.yes')}</span> : <span className="text-red-600 font-bold">{t('studentsTable.no')}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Link
                      to={`/edit-student/${student.id}`}
                      className="inline-flex items-center bg-yellow-400 text-white px-3 py-1.5 rounded-md hover:bg-yellow-500 transition duration-200 shadow-sm hover:shadow-md font-medium text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i18n.language === 'ar' ? 'ml-1' : 'mr-1'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-7.793 7.793-2.121.707-.707-2.121 7.793-7.793z" />
                      </svg>
                      {t('studentsTable.edit')}
                    </Link>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="inline-flex items-center bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition duration-200 shadow-sm hover:shadow-md font-medium text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i18n.language === 'ar' ? 'ml-1' : 'mr-1'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t('studentsTable.delete')} {/* ترجمة زر الحذف */}
                    </button>
                    <Link
                      to={`/students/${student.id}/details`}
                      className="inline-flex items-center bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition duration-200 shadow-sm hover:shadow-md font-medium text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i18n.language === 'ar' ? 'ml-1' : 'mr-1'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 100 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      {t('studentsTable.view')} {/* ترجمة زر العرض */}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
