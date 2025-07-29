import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react'; // إضافة useCallback
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // استيراد useTranslation

export default function EditStudentForm() {
  const { t, i18n } = useTranslation(); // استخدام Hook useTranslation
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [feesPaid, setFeesPaid] = useState(false);

  const gradeOptions = ['First Preparatory', 'Second Preparatory', 'Third Preparatory', 'First Secondary', 'Second Secondary', 'Third Secondary'];

  // تغليف fetchStudent بـ useCallback
  const fetchStudent = useCallback(async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/student/${id}`);
      const student = res.data;
      setName(student.name);
      setGrade(student.grade);
      setGuardianPhone(student.guardian_phone);
      setFeesPaid(student.fees_paid === 1);
    } catch {
      toast.error(t('toast.fetchStudentError')); // استخدام الترجمة
    }
  }, [id, t]); // الاعتماديات هي id و t

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]); // إضافة fetchStudent كاعتمادية

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://127.0.0.1:5000/update/${id}`, {
        name,
        grade,
        guardian_phone: guardianPhone,
        fees_paid: feesPaid ? 1 : 0,
      });
      toast.success(t('toast.studentUpdatedSuccess')); // استخدام الترجمة
      navigate('/');
    } catch {
      toast.error(t('toast.updateStudentFailed')); // استخدام الترجمة
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {' '}
      {/* إضافة dir */}
      <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">{t('editStudentForm.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-md rounded-lg">
        <div>
          <label className="block mb-1 text-gray-700 font-medium">{t('editStudentForm.name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium">{t('editStudentForm.grade')}</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">{t('editStudentForm.selectGradePlaceholder')}</option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>
                {t(`grades.${g.toLowerCase().replace(/ /g, '')}`)} {/* ترجمة الصفوف */}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium">{t('editStudentForm.guardianPhone')}</label>
          <input
            type="tel"
            value={guardianPhone}
            onChange={(e) => setGuardianPhone(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <input id="feesPaid" type="checkbox" checked={feesPaid} onChange={(e) => setFeesPaid(e.target.checked)} className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
          <label htmlFor="feesPaid" className="text-gray-700 font-medium">
            {t('editStudentForm.feesPaid')}
          </label>
        </div>

        <div className="text-center">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition">
            {t('editStudentForm.updateButton')}
          </button>
        </div>
      </form>
    </div>
  );
}
