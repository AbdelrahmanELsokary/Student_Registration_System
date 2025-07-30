import { FaEdit, FaTrash, FaSearch, FaSyncAlt, FaFileCsv, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next'; // تأكد من استيراد useTranslation

export default function StudentsTable({ students, onDelete, onRefresh }) {
  const { t, i18n } = useTranslation(); // تهيئة useTranslation للوصول إلى دالة الترجمة ومعلومات اللغة
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [isLoading, setIsLoading] = useState(false); // حالة التحميل لزر التحديث
  const isRTL = i18n.language === 'ar'; // تحديد اتجاه الواجهة بناءً على اللغة الحالية

  // الحصول على جميع الصفوف الفريدة لخيارات الفلترة
  const allGrades = [...new Set(students.map((s) => s.grade))];

  // تصفية الطلاب بناءً على مصطلح البحث والصف المختار
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === '' || s.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  // تجميع الطلاب حسب الصف لعرضهم في جداول منفصلة
  const groupedStudents = filteredStudents.reduce((groups, student) => {
    const grade = student.grade || 'unknown'; // التعامل مع الصفوف غير المعروفة
    if (!groups[grade]) groups[grade] = [];
    groups[grade].push(student);
    return groups;
  }, {});

  // دالة لتصدير البيانات المفلترة إلى ملف CSV
  const exportToCSV = () => {
    // رؤوس الجدول لملف CSV، مترجمة
    const headers = [t('studentsTable.tableName'), t('studentsTable.tableGrade'), t('studentsTable.tableParentPhone'), t('studentsTable.tableFeesPaid')];
    // تحويل بيانات الطلاب إلى صفوف CSV، مع ترجمة حالة دفع المصروفات
    const rows = filteredStudents.map((s) => [
      s.name,
      // ترجمة الصف هنا أيضًا لملف CSV
      t(`grades.${s.grade.toLowerCase().replace(/ /g, '')}`),
      s.guardian_phone,
      s.fees_paid ? t('studentsTable.yes') : t('studentsTable.no'), // ترجمة "نعم" / "لا"
    ]);

    // إنشاء محتوى CSV وتشفيره
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    // تحديد اسم الملف بناءً على الصف المختار
    const filename = selectedGrade === '' ? 'students.csv' : `students_${selectedGrade}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // دالة لمعالجة تحديث البيانات مع حالة التحميل
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefresh(); // استدعاء دالة التحديث الممررة من المكون الأب
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* بطاقات الملخص الإحصائي */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 text-blue-800 p-4 rounded-lg shadow text-center">
          <h4 className="text-sm font-semibold">{t('studentsTable.totalStudents')}</h4>
          <p className="text-2xl font-bold">{filteredStudents.length}</p>
        </div>
        <div className="bg-green-100 text-green-800 p-4 rounded-lg shadow text-center">
          <h4 className="text-sm font-semibold">{t('studentsTable.paid')}</h4>
          <p className="text-2xl font-bold">{filteredStudents.filter((s) => s.fees_paid).length}</p>
        </div>
        <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow text-center">
          <h4 className="text-sm font-semibold">{t('studentsTable.unpaid')}</h4>
          <p className="text-2xl font-bold">{filteredStudents.filter((s) => !s.fees_paid).length}</p>
        </div>
      </div>

      {/* قسم البحث والفلترة والأزرار */}
      <div className={`mb-4 flex flex-col sm:flex-row sm:items-center ${isRTL ? 'sm:space-x-reverse' : ''} sm:space-x-2 space-y-2 sm:space-y-0`}>
        <div className="relative w-full sm:w-1/3">
          <input
            type="search"
            placeholder={t('studentsTable.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <FaSearch className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} />
        </div>

        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t('studentsTable.allGrades')}</option>
          {allGrades.map((g) => (
            <option key={g} value={g}>
              {/* ترجمة الصف في قائمة الفلترة */}
              {t(`grades.${g.toLowerCase().replace(/ /g, '')}`)}
            </option>
          ))}
        </select>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`flex items-center px-4 py-2 rounded-md text-sm shadow-sm transition-transform hover:scale-105
            bg-yellow-400 hover:bg-yellow-500 text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={t('studentsTable.refresh')}
          title={t('studentsTable.refresh')}
        >
          {isRTL ? (
            <>
              {t('studentsTable.refresh')} <FaSyncAlt className={`ml-2 ${isLoading ? 'animate-spin' : ''}`} />
            </>
          ) : (
            <>
              <FaSyncAlt className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> {t('studentsTable.refresh')}
            </>
          )}
        </button>

        <button
          onClick={exportToCSV}
          className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm shadow-sm transition-transform hover:scale-105"
          aria-label={t('studentsTable.export')}
          title={t('studentsTable.export')}
        >
          {isRTL ? (
            <>
              {t('studentsTable.export')} <FaFileCsv className="ml-2" />
            </>
          ) : (
            <>
              <FaFileCsv className="mr-2" /> {t('studentsTable.export')}
            </>
          )}
        </button>
      </div>

      {/* عرض الطلاب أو رسالة لا يوجد طلاب مع زر مسح الفلاتر */}
      {Object.keys(groupedStudents).length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          {t('studentsTable.noStudentsFound')}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedGrade('');
            }}
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            {t('studentsTable.resetFilters')}
          </button>
        </div>
      ) : (
        Object.entries(groupedStudents).map(([grade, studentsInGrade]) => (
          <div key={grade} className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">
              {t('studentsTable.gradePrefix')} {t(`grades.${grade.toLowerCase().replace(/ /g, '')}`)}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
              <table className="min-w-full border-collapse border border-gray-300 divide-y divide-gray-300">
                <thead className="bg-blue-100">
                  <tr>
                    {/* رؤوس الجدول - يتم ترجمتها باستخدام دالة t() */}
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">{t('studentsTable.tableName')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">{t('studentsTable.tableGrade')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">{t('studentsTable.tableParentPhone')}</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">{t('studentsTable.tableFeesPaid')}</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">{t('studentsTable.tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsInGrade.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 border-r">{s.name}</td>
                      <td className="px-4 py-2 border-r">{t(`grades.${s.grade.toLowerCase().replace(/ /g, '')}`)}</td>
                      <td className="px-4 py-2 border-r">{s.guardian_phone}</td>
                      <td className="px-4 py-2 text-center border-r">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${s.fees_paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {s.fees_paid ? t('studentsTable.yes') : t('studentsTable.no')}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center flex flex-wrap justify-center gap-2">
                        <Link
                          to={`/view/${s.id}`}
                          className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-xs transition-transform hover:scale-110"
                          title={t('studentsTable.view')}
                          aria-label={`${t('studentsTable.view')} ${s.name}`}
                        >
                          <FaEye className="mr-1" /> {t('studentsTable.view')}
                        </Link>
                        <Link
                          to={`/edit/${s.id}`}
                          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition-transform hover:scale-110"
                          title={t('studentsTable.edit')}
                          aria-label={`${t('studentsTable.edit')} ${s.name}`}
                        >
                          <FaEdit className="mr-1" /> {t('studentsTable.edit')}
                        </Link>
                        <button
                          onClick={() => onDelete(s.id)}
                          className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition-transform hover:scale-110"
                          title={t('studentsTable.delete')}
                          aria-label={`${t('studentsTable.delete')} ${s.name}`}
                        >
                          <FaTrash className="mr-1" /> {t('studentsTable.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
