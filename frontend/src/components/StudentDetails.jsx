import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { FaEdit, FaFilePdf, FaArrowLeft, FaChevronDown, FaTimesCircle } from 'react-icons/fa';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState('ar'); // Default to Arabic

  const [student, setStudent] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPdfErrorModal, setShowPdfErrorModal] = useState(false);

  // Define grade translations
  const gradeTranslations = useMemo(
    () => ({
      'Second Secondary': {
        ar: 'الثاني الثانوي',
        en: 'Second Secondary',
      },
      // Add more grade translations as needed
      'First Grade': {
        ar: 'الصف الأول',
        en: 'First Grade',
      },
      'Second Grade': {
        ar: 'الصف الثاني',
        en: 'Second Grade',
      },
      'Third Grade': {
        ar: 'الصف الثالث',
        en: 'Third Grade',
      },
      'Fourth Grade': {
        ar: 'الصف الرابع',
        en: 'Fourth Grade',
      },
      'Fifth Grade': {
        ar: 'الصف الخامس',
        en: 'Fifth Grade',
      },
      'Sixth Grade': {
        ar: 'الصف السادس',
        en: 'Sixth Grade',
      },
      'First Preparatory': {
        ar: 'الأول الإعدادي',
        en: 'First Preparatory',
      },
      'Second Preparatory': {
        ar: 'الثاني الإعدادي',
        en: 'Second Preparatory',
      },
      'Third Preparatory': {
        ar: 'الثالث الإعدادي',
        en: 'Third Preparatory',
      },
      'First Secondary': {
        ar: 'الأول الثانوي',
        en: 'First Secondary',
      },
      'Third Secondary': {
        ar: 'الثالث الثانوي',
        en: 'Third Secondary',
      },
    }),
    []
  );

  // Set Day.js locale based on current language
  useEffect(() => {
    dayjs.locale(lang === 'ar' ? 'ar' : 'en');
  }, [lang]);

  // Fetches student data, attendance summary, and records from the API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: studentData }, { data: summaryData }, { data: recordsData }] = await Promise.all([
        axios.get(`http://localhost:5000/student/${id}`),
        axios.get(`http://localhost:5000/student/${id}/attendance-summary`),
        axios.get(`http://localhost:5000/student/${id}/attendance-records`),
      ]);

      setStudent(studentData);
      setAttendanceSummary({
        present: summaryData?.present_count || 0,
        absent: summaryData?.absent_count || 0,
        avg_recitation: summaryData?.avg_recitation,
        avg_test: summaryData?.avg_test,
      });

      // Sort records by date in descending order (most recent first)
      const sortedRecords = (recordsData || []).sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
      setAttendanceRecords(sortedRecords);
    } catch (err) {
      console.error('Error fetching student details:', err);
      setError(lang === 'ar' ? 'حدث خطأ في جلب البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [id, lang]); // Dependencies for useCallback

  // Trigger data fetch on component mount or when fetchData changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized filtered attendance records based on the selected filter (all, week, month)
  const filteredRecords = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return [];
    const now = dayjs();
    let filtered = attendanceRecords;

    if (filter === 'week') {
      filtered = attendanceRecords.filter((record) => {
        const recordDate = dayjs(record.date);
        return recordDate.isSameOrAfter(now.startOf('week')) && recordDate.isSameOrBefore(now.endOf('week'));
      });
    } else if (filter === 'month') {
      filtered = attendanceRecords.filter((record) => {
        const recordDate = dayjs(record.date);
        return recordDate.isSameOrAfter(now.startOf('month')) && recordDate.isSameOrBefore(now.endOf('month'));
      });
    }
    return filtered;
  }, [attendanceRecords, filter]);

  // Memoized attendance records grouped by month for display in collapsible sections
  const groupedAttendanceByMonth = useMemo(() => {
    if (!filteredRecords || filteredRecords.length === 0) return {};

    return filteredRecords.reduce((acc, record) => {
      const date = dayjs(record.date);
      const monthYearKey = date.format('YYYY-MM'); // e.g., "2023-10"
      if (!acc[monthYearKey]) {
        acc[monthYearKey] = [];
      }
      acc[monthYearKey].push(record);
      return acc;
    }, {});
  }, [filteredRecords]);

  // --- Start Font Data for PDF Export ---
  // IMPORTANT: You MUST replace 'PASTE_YOUR_FULL_BASE64_FONT_DATA_HERE' with the actual
  // Base64 encoded data of your Arabic font (e.g., Amiri-Regular.ttf).
  // Use a tool like 'jspdf-customfonts' or 'base64-font-converter' to generate this.
  // Without this data, Arabic text will not render correctly in the PDF.
  const ARABIC_FONT_NAME_IN_VFS = 'Amiri-Regular.ttf'; // Example font file name
  const ARABIC_FONT_ALIAS = 'Amiri'; // Example font alias
  const ARABIC_FONT_STYLE = 'normal';
  const ARABIC_FONT_BASE64_DATA = ''; // <--- PASTE YOUR FULL BASE64 FONT DATA HERE!

  // Function to export student details and attendance to PDF
  const exportPDF = useCallback(() => {
    try {
      if (!student || !attendanceSummary || !filteredRecords) {
        throw new Error(lang === 'ar' ? 'بيانات الطالب غير كاملة' : 'Incomplete student data');
      }

      const doc = new jsPDF();
      const isArabic = lang === 'ar';

      // --- Font Setup for Arabic ---
      // This is crucial for Arabic text rendering.
      if (ARABIC_FONT_BASE64_DATA) {
        doc.addFileToVFS(ARABIC_FONT_NAME_IN_VFS, ARABIC_FONT_BASE64_DATA);
        doc.addFont(ARABIC_FONT_NAME_IN_VFS, ARABIC_FONT_ALIAS, ARABIC_FONT_STYLE);
        doc.setFont(ARABIC_FONT_ALIAS);
      } else {
        console.warn('ARABIC_FONT_BASE64_DATA is empty. Arabic text in PDF might not render correctly.');
        // Fallback to a generic font if no Arabic font data is provided
        doc.setFont('helvetica');
      }

      // Enable RTL for Arabic text
      if (isArabic) {
        doc.__private__.rtl = true;
      }

      // Title of the PDF report
      doc.setFontSize(18);
      const title = isArabic ? `تقرير الحضور - ${student.name}` : `Attendance Report - ${student.name}`;
      // Adjust title position based on language direction
      doc.text(title, isArabic ? doc.internal.pageSize.width - 15 : 15, 15, { align: isArabic ? 'right' : 'left' });

      // Get translated grade for PDF
      const translatedGradeForPdf = gradeTranslations[student.grade]?.[lang] || student.grade;

      // Student Information Table
      autoTable(doc, {
        startY: 25,
        body: [
          [isArabic ? 'اسم الطالب' : 'Student Name', student.name],
          [isArabic ? 'الصف' : 'Grade', translatedGradeForPdf], // Use translated grade here
          [isArabic ? 'هاتف ولي الأمر' : 'Guardian Phone', student.guardian_phone],
          [isArabic ? 'حالة الدفع' : 'Fees Paid', student.fees_paid ? (isArabic ? 'مدفوع' : 'Yes') : isArabic ? 'غير مدفوع' : 'No'],
        ],
        styles: {
          font: ARABIC_FONT_ALIAS, // Use your Arabic font alias here
          fontSize: 10,
          cellPadding: 3,
          halign: isArabic ? 'right' : 'left', // Align text in cells based on language
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
        },
      });

      // Attendance Summary Table
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        body: [
          [isArabic ? 'أيام الحضور' : 'Present Days', attendanceSummary.present],
          [isArabic ? 'أيام الغياب' : 'Absent Days', attendanceSummary.absent],
          [isArabic ? 'متوسط التسميع' : 'Avg. Recitation', attendanceSummary.avg_recitation?.toFixed(2) || (isArabic ? 'غير متاح' : 'N/A')],
          [isArabic ? 'متوسط الاختبار' : 'Avg. Test', attendanceSummary.avg_test?.toFixed(2) || (isArabic ? 'غير متاح' : 'N/A')],
        ],
        styles: {
          font: ARABIC_FONT_ALIAS, // Use your Arabic font alias here
          fontSize: 10,
          cellPadding: 3,
          halign: isArabic ? 'right' : 'left', // Align text in cells based on language
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
        },
      });

      // Attendance Records Table
      autoTable(doc, {
        head: [[isArabic ? 'التاريخ' : 'Date', isArabic ? 'الحالة' : 'Status', isArabic ? 'التسميع' : 'Recitation', isArabic ? 'الاختبار' : 'Test']],
        body: filteredRecords.map((rec) => [
          dayjs(rec.date).format('YYYY-MM-DD'),
          rec.status === 'present' ? (isArabic ? 'حاضر' : 'Present') : isArabic ? 'غائب' : 'Absent',
          rec.daily_recitation_score || (isArabic ? 'غير متاح' : 'N/A'),
          rec.test_score || (isArabic ? 'غير متاح' : 'N/A'),
        ]),
        startY: doc.lastAutoTable.finalY + 10,
        styles: {
          font: ARABIC_FONT_ALIAS, // Use your Arabic font alias here
          fontSize: 10,
          cellPadding: 3,
          halign: isArabic ? 'right' : 'left', // Align text in cells based on language
        },
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: isArabic ? 'right' : 'left', // Align header text based on language
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      doc.save(`${student.name}_${isArabic ? 'تقرير_الحضور' : 'Attendance_Report'}.pdf`);
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      setShowPdfErrorModal(true);
    }
  }, [filteredRecords, student, attendanceSummary, lang, setShowPdfErrorModal, gradeTranslations]); // Dependencies for useCallback

  // Loading state UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center p-8 bg-white rounded-lg shadow-xl animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl font-semibold text-gray-700">{lang === 'ar' ? 'جاري تحميل البيانات' : 'Loading Data'}</p>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center bg-white p-10 rounded-lg shadow-xl border-t-4 border-red-500">
          <p className="text-3xl font-bold text-red-600 mb-5">{lang === 'ar' ? 'خطأ' : 'Error'}</p>
          <p className="text-lg text-gray-700 mb-8">{error}</p>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-neutral-100 text-gray-800 hover:bg-neutral-200 transition-all shadow">
            <FaArrowLeft className={lang === 'ar' ? 'ml-2' : 'mr-2'} /> {/* Icon margin adjusted for RTL */}
            {lang === 'ar' ? 'العودة' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  // Student not found UI
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center bg-white p-10 rounded-lg shadow-xl border-t-4 border-yellow-500">
          <p className="text-3xl font-bold text-yellow-600 mb-5">{lang === 'ar' ? 'الطالب غير موجود' : 'Student Not Found'}</p>
          <button onClick={() => navigate(-1)} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
            {lang === 'ar' ? 'العودة للقائمة' : 'Back to List'}
          </button>
        </div>
      </div>
    );
  }

  // Get the translated grade for display
  const displayedGrade = gradeTranslations[student.grade]?.[lang] || student.grade;

  // Main component rendering
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-6 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{lang === 'ar' ? 'تفاصيل الطالب' : 'Student Details'}</h1>
        {/* Language Toggle Button */}
        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
          {lang === 'ar' ? 'English' : 'العربية'}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold shadow-md hover:bg-gray-200">
          <FaArrowLeft className={lang === 'ar' ? 'ml-2' : 'mr-2'} /> {/* Icon margin adjusted for RTL */}
          {lang === 'ar' ? 'العودة' : 'Go Back'}
        </button>

        <button onClick={() => navigate(`/edit/${id}`)} className="flex items-center px-6 py-2.5 rounded-xl bg-gray-100 text-gray-800 font-semibold shadow-lg hover:bg-gray-200">
          <FaEdit className={lang === 'ar' ? 'ml-2' : 'mr-2'} /> {/* Icon margin adjusted for RTL */}
          {lang === 'ar' ? 'تعديل الطالب' : 'Edit Student'}
        </button>

        <button onClick={exportPDF} className="flex items-center px-6 py-2 rounded-xl bg-gray-100 text-gray-800 font-semibold shadow-md hover:bg-gray-200">
          <FaFilePdf className={lang === 'ar' ? 'ml-2' : 'mr-2'} /> {/* Icon margin adjusted for RTL */}
          {lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}
        </button>
      </div>

      {/* Personal Information Section */}
      <section className="bg-white shadow-xl rounded-xl p-6 md:p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-3">{lang === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-lg">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <strong className="text-gray-700">{lang === 'ar' ? 'اسم الطالب:' : 'Student Name:'}</strong>
            <p className="font-semibold text-gray-900 mt-1">{student.name}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <strong className="text-gray-700">{lang === 'ar' ? 'الصف:' : 'Grade:'}</strong>
            <p className="font-semibold text-gray-900 mt-1">{displayedGrade}</p> {/* Use translated grade here */}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <strong className="text-gray-700">{lang === 'ar' ? 'هاتف ولي الأمر:' : 'Guardian Phone:'}</strong>
            <p className="font-semibold text-gray-900 mt-1">{student.guardian_phone}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <strong className="text-gray-700">{lang === 'ar' ? 'حالة الدفع:' : 'Fees Paid:'}</strong>
            <p className={`font-bold mt-1 ${student.fees_paid ? 'text-green-600' : 'text-red-600'}`}>{student.fees_paid ? (lang === 'ar' ? 'مدفوع' : 'Yes') : lang === 'ar' ? 'غير مدفوع' : 'No'}</p>
          </div>
        </div>
      </section>

      {/* Attendance Summary Section */}
      <section className="bg-white shadow-xl rounded-xl p-6 md:p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-3">{lang === 'ar' ? 'ملخص الحضور' : 'Attendance Summary'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-lg text-center">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <strong className="text-blue-700 text-lg">{lang === 'ar' ? 'أيام الحضور:' : 'Present Days:'}</strong>
            <p className="font-extrabold text-blue-800 text-4xl mt-2">{attendanceSummary.present}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <strong className="text-red-700 text-lg">{lang === 'ar' ? 'أيام الغياب:' : 'Absent Days:'}</strong>
            <p className="font-extrabold text-red-800 text-4xl mt-2">{attendanceSummary.absent}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <strong className="text-green-700 text-lg">{lang === 'ar' ? 'متوسط التسميع:' : 'Avg. Recitation:'}</strong>
            <p className="font-extrabold text-green-800 text-4xl mt-2">{attendanceSummary.avg_recitation?.toFixed(2) || (lang === 'ar' ? 'غير متاح' : 'N/A')}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <strong className="text-yellow-700 text-lg">{lang === 'ar' ? 'متوسط الاختبار:' : 'Avg. Test:'}</strong>
            <p className="font-extrabold text-yellow-800 text-4xl mt-2">{attendanceSummary.avg_test?.toFixed(2) || (lang === 'ar' ? 'غير متاح' : 'N/A')}</p>
          </div>
        </div>
      </section>

      {/* Attendance Records Section */}
      <section className="bg-white shadow-xl rounded-xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">{lang === 'ar' ? 'سجلات الحضور' : 'Attendance Records'}</h2>
          <div className="flex items-center gap-3">
            <label htmlFor="attendance-filter" className="font-medium text-gray-700 text-lg">
              {lang === 'ar' ? 'تصفية حسب:' : 'Filter by:'}
            </label>
            {/* Filter Dropdown */}
            <select
              id="attendance-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-base"
            >
              <option value="all">{lang === 'ar' ? 'كل السجلات' : 'All Records'}</option>
              <option value="week">{lang === 'ar' ? 'هذا الأسبوع' : 'This Week'}</option>
              <option value="month">{lang === 'ar' ? 'هذا الشهر' : 'This Month'}</option>
            </select>
          </div>
        </div>

        <p className="text-gray-600 mb-4 text-sm md:text-base">
          {lang === 'ar' ? `عرض ${filteredRecords.length} من أصل ${attendanceRecords.length} سجل` : `Showing ${filteredRecords.length} of ${attendanceRecords.length} records`}
        </p>

        {Object.keys(groupedAttendanceByMonth).length > 0 ? (
          Object.entries(groupedAttendanceByMonth).map(([monthYearKey, recordsInMonth]) => (
            <details key={monthYearKey} className="group border border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm" open>
              <summary className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200 font-semibold text-lg text-gray-800">
                {dayjs(monthYearKey).locale(lang).format('MMMM YYYY')} ({recordsInMonth.length} {lang === 'ar' ? 'سجل' : 'records'}){/* Chevron icon for expand/collapse, rotates consistently */}
                <FaChevronDown className="w-5 h-5 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="p-4 border-t border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm md:text-base bg-white">
                    <thead className="bg-gray-100">
                      <tr className={`text-gray-700 font-bold ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                        {' '}
                        {/* Conditional text alignment for headers */}
                        <th className="px-6 py-3 uppercase tracking-wider">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                        <th className="px-6 py-3 uppercase tracking-wider">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="px-6 py-3 uppercase tracking-wider">{lang === 'ar' ? 'التسميع' : 'Recitation'}</th>
                        <th className="px-6 py-3 uppercase tracking-wider">{lang === 'ar' ? 'الاختبار' : 'Test'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recordsInMonth.map((record, index) => (
                        <tr key={record.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">{dayjs(record.date).format('YYYY-MM-DD')}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {record.status === 'present' ? (lang === 'ar' ? 'حاضر' : 'Present') : lang === 'ar' ? 'غائب' : 'Absent'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{record.daily_recitation_score || (lang === 'ar' ? 'غير متاح' : 'N/A')}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{record.test_score || (lang === 'ar' ? 'غير متاح' : 'N/A')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          ))
        ) : (
          <p className="p-8 text-center text-gray-500 text-lg italic">{lang === 'ar' ? 'لا توجد سجلات للفترة المحددة' : 'No records for selected period'}</p>
        )}
      </section>

      {/* PDF Export Error Modal */}
      {showPdfErrorModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full text-center relative">
            <button onClick={() => setShowPdfErrorModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors">
              <FaTimesCircle className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold text-red-600 mb-4">{lang === 'ar' ? 'خطأ في تصدير PDF' : 'PDF Export Error'}</h3>
            <p className="text-gray-700 mb-6">{lang === 'ar' ? 'حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.' : 'An error occurred while generating the PDF file. Please try again.'}</p>
            <button onClick={() => setShowPdfErrorModal(false)} className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors">
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
