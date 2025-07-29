import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function StudentForm() {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [feesPaid, setFeesPaid] = useState(false);

  const [touchedName, setTouchedName] = useState(false);
  const [touchedPhone, setTouchedPhone] = useState(false);

  const navigate = useNavigate();

  const gradeOptions = ['First Preparatory', 'Second Preparatory', 'Third Preparatory', 'First Secondary', 'Second Secondary', 'Third Secondary'];

  const isNameValid = name.trim().length >= 2;
  const isPhoneValid = /^01[0125][0-9]{8}$/.test(guardianPhone);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isNameValid || !isPhoneValid || !grade) {
      toast.error(t('toast.fillAllFields'));
      return;
    }

    const newStudent = {
      name,
      grade,
      guardian_phone: guardianPhone,
      fees_paid: feesPaid,
    };

    try {
      await axios.post('http://127.0.0.1:5000/add', newStudent);
      toast.success(t('toast.studentAddedSuccess'));
      navigate('/students');
    } catch (err) {
      toast.error(t('toast.addStudentFailed'));
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-700 text-center">{t('studentForm.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-700 font-medium">{t('studentForm.studentName')}</label>
          <input
            type="text"
            placeholder={t('studentForm.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouchedName(true)}
            required
            className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
              !isNameValid && touchedName ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-green-500'
            }`}
          />
          {!isNameValid && touchedName && <p className="text-sm text-red-500 mt-1">{t('studentForm.nameValidation')}</p>}
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium">{t('studentForm.grade')}</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">{t('studentForm.selectGradePlaceholder')}</option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>
                {t(`grades.${g.toLowerCase().replace(/ /g, '')}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium">{t('studentForm.parentPhoneNumber')}</label>
          <input
            type="tel"
            placeholder={t('studentForm.phonePlaceholder')}
            value={guardianPhone}
            onChange={(e) => setGuardianPhone(e.target.value)}
            onBlur={() => setTouchedPhone(true)}
            pattern="^01[0125][0-9]{8}$"
            required
            className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
              !isPhoneValid && touchedPhone ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-green-500'
            }`}
          />
          {!isPhoneValid && touchedPhone && <p className="text-sm text-red-500 mt-1">{t('studentForm.phoneValidation')}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="feesPaid" checked={feesPaid} onChange={(e) => setFeesPaid(e.target.checked)} className="accent-green-600" />
          <label htmlFor="feesPaid" className="text-gray-700">
            {t('studentForm.feesPaid')}
          </label>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition duration-200 font-semibold">
          {t('studentForm.addStudentButton')}
        </button>
      </form>
    </div>
  );
}
