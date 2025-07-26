import React, { useState, useEffect } from 'react';

export default function StudentForm({ existingStudent, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    grade: '',
    paid: false,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تهيئة النموذج إذا كان هناك طالب موجود
  useEffect(() => {
    if (existingStudent) {
      setFormData({
        name: existingStudent.name,
        age: existingStudent.age.toString(),
        grade: existingStudent.grade.toString(),
        paid: existingStudent.paid,
      });
    }
  }, [existingStudent]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('❌ اسم الطالب مطلوب');
      return false;
    }
    if (isNaN(formData.age) || formData.age < 5 || formData.age > 25) {
      setError('❌ يرجى إدخال عمر صحيح (بين 5 و25)');
      return false;
    }
    if (isNaN(formData.grade) || formData.grade < 0 || formData.grade > 100) {
      setError('❌ يرجى إدخال درجة صحيحة (بين 0 و100)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const studentData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        grade: parseInt(formData.grade),
        paid: formData.paid,
      };

      // جرب هذه الروابط البديلة
      const baseUrl = 'https://studentregistrationsystem-production-06d9.up.railway.app';
      const endpoint = existingStudent ? `/update-student/${existingStudent.id}` : '/add-student';
      const url = baseUrl + endpoint;
      const method = 'POST'; // جرب POST لجميع الحالات

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || `Server error: ${response.status}`);
      }

      if (!existingStudent) {
        setFormData({
          name: '',
          age: '',
          grade: '',
          paid: false,
        });
      }

      onSuccess();
    } catch (err) {
      console.error('Error:', err);
      setError(err.message.includes('Failed to fetch') ? '❌ تعذر الاتصال بالخادم' : err.message.includes('405') ? '❌ الخادم يرفض الطلب. الرابط قد يكون خاطئاً' : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 bg-white shadow-md rounded">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded text-center">{error}</div>}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">اسم الطالب</label>
        <input type="text" name="name" placeholder="أدخل اسم الطالب" className="w-full border rounded p-2" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">العمر</label>
        <input type="number" name="age" placeholder="أدخل العمر (5-25)" min="5" max="25" className="w-full border rounded p-2" value={formData.age} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">الدرجة</label>
        <input type="number" name="grade" placeholder="أدخل الدرجة (0-100)" min="0" max="100" className="w-full border rounded p-2" value={formData.grade} onChange={handleChange} required />
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" name="paid" id="paid" checked={formData.paid} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded" />
        <label htmlFor="paid" className="text-sm font-medium text-gray-700">
          مدفوع
        </label>
      </div>

      <div className="flex space-x-2 justify-end pt-4">
        {existingStudent && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" disabled={isSubmitting}>
            إلغاء
          </button>
        )}
        <button type="submit" className={`px-4 py-2 rounded-md text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`} disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري المعالجة...
            </span>
          ) : existingStudent ? (
            'تحديث الطالب'
          ) : (
            'إضافة طالب'
          )}
        </button>
      </div>
    </form>
  );
}
