import { FaEdit, FaTrash, FaSearch, FaSyncAlt, FaFileCsv, FaEye, FaPlus } from 'react-icons/fa'; // Added FaPlus icon
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function StudentsTable({ students, onDelete, onRefresh }) {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isRTL = i18n.language === 'ar';

  // Define the fixed list of grade options
  const gradeOptions = ['First Preparatory', 'Second Preparatory', 'Third Preparatory', 'First Secondary', 'Second Secondary', 'Third Secondary'];

  // Filter students based on search term and selected grade
  const filteredStudents = (students || []).filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === '' || s.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  // Group students by their actual grade for display in separate tables
  const groupedStudents = filteredStudents.reduce((groups, student) => {
    // Use the student's actual grade for grouping. If null/undefined, use a placeholder string.
    const groupKey = student.grade || 'unspecified';
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(student);
    return groups;
  }, {});

  // Function to export filtered data to a CSV file
  const exportToCSV = () => {
    // CSV table headers, translated
    const headers = [t('studentsTable.tableName'), t('studentsTable.tableGrade'), t('studentsTable.tableParentPhone'), t('studentsTable.tableFeesPaid')];
    // Convert student data to CSV rows, with translated fee payment status
    const rows = filteredStudents.map((s) => [
      s.name,
      // Corrected logic: Translate if known grade, otherwise use raw grade or 'unknown' fallback
      s.grade && gradeOptions.includes(s.grade) ? t(`grades.${s.grade.toLowerCase().replace(/ /g, '')}`) : s.grade ? s.grade : t('studentsTable.unknownGrade'),
      s.guardian_phone,
      s.fees_paid ? t('studentsTable.yes') : t('studentsTable.no'),
    ]);

    // Create CSV content and encode it
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    // Determine filename based on selected grade
    const filename = selectedGrade === '' ? 'students.csv' : `students_${selectedGrade.replace(/ /g, '_')}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle data refresh with loading state
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefresh(); // Call the refresh function passed from the parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 font-inter antialiased" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Summary Statistic Cards */}
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

      {/* Search, Filter, and Buttons Section */}
      <div className={`mb-4 flex flex-col sm:flex-row sm:items-center ${isRTL ? 'sm:space-x-reverse' : 'sm:space-x-2'} space-y-2 sm:space-y-0`}>
        <div className="relative w-full sm:w-1/3 min-w-[150px]">
          <input
            type="search"
            id="student-search"
            placeholder={t('studentsTable.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            aria-label={t('studentsTable.searchPlaceholder')}
          />
          <FaSearch className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} />
        </div>

        <select
          id="grade-filter"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
          aria-label={t('studentsTable.selectGrade')}
        >
          <option value="">{t('studentsTable.allGrades')}</option>
          {gradeOptions.map((g) => (
            <option key={g} value={g}>
              {t(`grades.${g.toLowerCase().replace(/ /g, '')}`)}
            </option>
          ))}
        </select>

        {/* New "Add Student" button */}
        <Link
          to="/add"
          className="flex items-center justify-center px-4 py-2 rounded-md text-sm shadow-sm transition-transform hover:scale-105
            bg-blue-600 hover:bg-blue-700 text-white"
          aria-label={t('studentsTable.addStudent')}
          title={t('studentsTable.addStudent')}
        >
          {isRTL ? (
            <>
              {t('studentsTable.addStudent')} <FaPlus className="mr-2" />
            </>
          ) : (
            <>
              <FaPlus className="mr-2" /> {t('studentsTable.addStudent')}
            </>
          )}
        </Link>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`flex items-center justify-center px-4 py-2 rounded-md text-sm shadow-sm transition-transform hover:scale-105
            bg-yellow-400 hover:bg-yellow-500 text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={t('studentsTable.refresh')}
          title={t('studentsTable.refresh')}
        >
          {isRTL ? (
            <>
              {t('studentsTable.refresh')} <FaSyncAlt className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> {/* Adjusted margin for RTL */}
            </>
          ) : (
            <>
              <FaSyncAlt className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> {t('studentsTable.refresh')}
            </>
          )}
        </button>

        <button
          onClick={exportToCSV}
          className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm shadow-sm transition-transform hover:scale-105"
          aria-label={t('studentsTable.export')}
          title={t('studentsTable.export')}
        >
          {isRTL ? (
            <>
              {t('studentsTable.export')} <FaFileCsv className="mr-2" /> {/* Adjusted margin for RTL */}
            </>
          ) : (
            <>
              <FaFileCsv className="mr-2" /> {t('studentsTable.export')}
            </>
          )}
        </button>
      </div>

      {/* Display Students or No Students Message with Clear Filters Button */}
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
        Object.entries(groupedStudents).map(([gradeKey, studentsInGrade]) => (
          <div key={gradeKey} className="mb-8">
            <h3 className={`text-lg font-semibold mb-2 text-blue-800 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('studentsTable.gradePrefix')}{' '}
              {
                // Display the translated grade if it's a known option,
                // otherwise display the raw gradeKey or 'Unknown Grade' if unspecified
                gradeOptions.includes(gradeKey) ? t(`grades.${gradeKey.toLowerCase().replace(/ /g, '')}`) : gradeKey === 'unspecified' ? t('studentsTable.unknownGrade') : gradeKey
              }
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
              <table className="min-w-full border-collapse border border-gray-300 divide-y divide-gray-300">
                <thead className="bg-blue-100">
                  <tr>
                    {/* Table Headers - translated using t() function and aligned based on RTL */}
                    <th className={`px-4 py-2 text-sm font-semibold text-gray-700 border-r border-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>{t('studentsTable.tableName')}</th>
                    <th className={`px-4 py-2 text-sm font-semibold text-gray-700 border-r border-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>{t('studentsTable.tableGrade')}</th>
                    <th className={`px-4 py-2 text-sm font-semibold text-gray-700 border-r border-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>{t('studentsTable.tableParentPhone')}</th>
                    <th className={`px-4 py-2 text-sm font-semibold text-gray-700 border-r border-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>{t('studentsTable.tableFeesPaid')}</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">{t('studentsTable.tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsInGrade.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className={`px-4 py-2 border-r ${isRTL ? 'text-right' : 'text-left'}`}>{s.name}</td>
                      <td className={`px-4 py-2 border-r ${isRTL ? 'text-right' : 'text-left'}`}>
                        {/* Corrected logic: Translate if known grade, otherwise use raw grade or 'unknown' fallback */}
                        {s.grade && gradeOptions.includes(s.grade) ? t(`grades.${s.grade.toLowerCase().replace(/ /g, '')}`) : s.grade ? s.grade : t('studentsTable.unknownGrade')}
                      </td>
                      <td className={`px-4 py-2 border-r ${isRTL ? 'text-right' : 'text-left'}`}>{s.guardian_phone}</td>
                      <td className={`px-4 py-2 text-center border-r ${isRTL ? 'text-right' : 'text-left'}`}>
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
                          {isRTL ? (
                            <>
                              {t('studentsTable.view')} <FaEye className="mr-1" />
                            </>
                          ) : (
                            <>
                              <FaEye className="mr-1" /> {t('studentsTable.view')}
                            </>
                          )}
                        </Link>
                        <Link
                          to={`/edit/${s.id}`}
                          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition-transform hover:scale-110"
                          title={t('studentsTable.edit')}
                          aria-label={`${t('studentsTable.edit')} ${s.name}`}
                        >
                          {isRTL ? (
                            <>
                              {t('studentsTable.edit')} <FaEdit className="mr-1" />
                            </>
                          ) : (
                            <>
                              <FaEdit className="mr-1" /> {t('studentsTable.edit')}
                            </>
                          )}
                        </Link>
                        <button
                          onClick={() => onDelete(s.id)}
                          className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition-transform hover:scale-110"
                          title={t('studentsTable.delete')}
                          aria-label={`${t('studentsTable.delete')} ${s.name}`}
                        >
                          {isRTL ? (
                            <>
                              {t('studentsTable.delete')} <FaTrash className="mr-1" />
                            </>
                          ) : (
                            <>
                              <FaTrash className="mr-1" /> {t('studentsTable.delete')}
                            </>
                          )}
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
