import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next'; // استيراد useTranslation

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  const { t, i18n } = useTranslation(); // تهيئة useTranslation

  const [student, setStudent] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [error, setError] = useState(null); // حالة لإدارة الأخطاء

  // دالة لتنسيق التاريخ
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    // استخدام لغة i18n الحالية لتنسيق التاريخ
    return new Date(dateStr).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', options);
  };

  // دالة لجلب تفاصيل الطالب وسجلات الحضور
  const fetchDetails = React.useCallback(async () => {
    try {
      setError(null); // مسح أي أخطاء سابقة
      // جلب تفاصيل الطالب
      const studentRes = await axios.get(`http://127.0.0.1:5000/student/${id}`);
      setStudent(studentRes.data);

      // جلب ملخص الحضور (إجمالي الحضور والغياب ومتوسط الدرجات)
      // هذا المسار تم تعريفه في Flask كـ /student/<int:student_id>/attendance-summary
      const summaryRes = await axios.get(`http://127.0.0.1:5000/student/${id}/attendance-summary`);
      setAttendanceSummary(summaryRes.data);

      // جلب سجلات الحضور الفردية (التواريخ والحالة والدرجات)
      // هذا المسار تم تعريفه في Flask كـ /student/<int:student_id>/attendance-records
      const recordsRes = await axios.get(`http://127.0.0.1:5000/student/${id}/attendance-records`);
      setAttendanceRecords(recordsRes.data);
    } catch (err) {
      console.error('Error fetching student details:', err);
      setError(t('studentDetails.errorFetchingData')); // استخدام الترجمة لرسالة الخطأ
    }
  }, [id, t]); // إضافة t كاعتمادية لـ useCallback

  // استخدام useEffect لجلب البيانات عند تحميل المكون أو تغيير معرف الطالب
  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // دالة لتصدير المحتوى إلى PDF
  const exportToPDF = () => {
    const input = printRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${student?.name}_Details.pdf`);
    });
  };

  // عرض رسالة خطأ إذا حدث خطأ في جلب البيانات
  if (error) {
    return (
      <div className="text-center mt-10 text-red-600 font-semibold" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        {error}
        <br />
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          {t('studentDetails.backToList')}
        </button>
      </div>
    );
  }

  // عرض رسالة تحميل بينما يتم جلب البيانات
  if (!student || !attendanceSummary) {
    return (
      <div className="text-center mt-10 text-gray-600" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        {t('studentDetails.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 mt-6" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* الأزرار (مرئية فقط عند عدم الطباعة) */}
      <div className="flex justify-between items-center mb-4 print:hidden">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline px-4 py-2 rounded-md bg-blue-50 hover:bg-blue-100 transition duration-200">
          {t('studentDetails.backToStudents')}
        </button>

        <div className="flex gap-2">
          <button onClick={fetchDetails} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow">
            {t('studentDetails.refreshData')}
          </button>

          <button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow">
            {t('studentDetails.exportToPDF')}
          </button>
        </div>
      </div>

      {/* المحتوى القابل للطباعة */}
      <div ref={printRef} className="bg-white shadow-md rounded-xl p-6 print:text-black print:shadow-none">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{t('studentDetails.title')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-lg">
          <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
            <strong>{t('studentDetails.name')}:</strong> {student.name}
          </div>
          <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
            {/* تم تحديث هذا السطر لترجمة الصف الدراسي */}
            <strong>{t('studentDetails.grade')}:</strong> {t(`grades.${student.grade.toLowerCase().replace(/ /g, '')}`)}
          </div>
          <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
            <strong>{t('studentDetails.guardianPhone')}:</strong> {student.guardian_phone}
          </div>
          <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
            <strong>{t('studentDetails.feesPaid')}:</strong>{' '}
            {student.fees_paid ? <span className="text-green-600 font-bold">{t('studentDetails.paid')}</span> : <span className="text-red-600 font-bold">{t('studentDetails.notPaid')}</span>}
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">{t('studentDetails.attendanceSummary')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-base">
          <div className="bg-blue-50 p-3 rounded-lg shadow-sm">
            <strong>{t('studentDetails.present')}:</strong> <span className="font-semibold text-blue-700">{attendanceSummary.present_count}</span>
          </div>
          <div className="bg-red-50 p-3 rounded-lg shadow-sm">
            <strong>{t('studentDetails.absent')}:</strong> <span className="font-semibold text-red-700">{attendanceSummary.absent_count}</span>
          </div>
          <div className="bg-green-50 p-3 rounded-lg shadow-sm">
            <strong>{t('studentDetails.avgRecitation')}:</strong> <span className="font-semibold text-green-700">{attendanceSummary.avg_recitation?.toFixed(2) ?? 'N/A'}</span>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg shadow-sm">
            <strong>{t('studentDetails.avgTest')}:</strong> <span className="font-semibold text-yellow-700">{attendanceSummary.avg_test?.toFixed(2) ?? 'N/A'}</span>
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">{t('studentDetails.attendanceRecords')}</h3>
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full border text-sm bg-white">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700 font-semibold">
                <th className="px-4 py-3 border-b border-gray-300">{t('studentDetails.date')}</th>
                <th className="px-4 py-3 border-b border-gray-300">{t('studentDetails.status')}</th>
                <th className="px-4 py-3 border-b border-gray-300">{t('studentDetails.recitation')}</th>
                <th className="px-4 py-3 border-b border-gray-300">{t('studentDetails.test')}</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-500 italic">
                    {t('studentDetails.noRecords')}
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                    <td className="px-4 py-2 border-r border-gray-200">{formatDate(record.date)}</td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      {record.status === 'present' ? (
                        <span className="text-green-600">{t('studentDetails.presentStatus')}</span>
                      ) : (
                        <span className="text-red-600">{t('studentDetails.absentStatus')}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200">{record.daily_recitation_score ?? 'N/A'}</td>
                    <td className="px-4 py-2">{record.test_score ?? 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
