import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaTrash, FaSearch, FaSyncAlt, FaFileCsv, FaEye, FaPlus } from 'react-icons/fa';

export default function StudentList() {
  const { t, i18n } = useTranslation(['studentsTable', 'grades', 'toast', 'common']);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [isLoadingRefresh, setIsLoadingRefresh] = useState(false);

  const isRTL = i18n.language === 'ar';

  const gradeOptions = ['First Preparatory', 'Second Preparatory', 'Third Preparatory', 'First Secondary', 'Second Secondary', 'Third Secondary'];

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://127.0.0.1:5000/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError(t('toast.fetchStudentError'));
      toast.error(t('toast.fetchStudentError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (id) => {

    if (window.confirm(t('studentsTable.confirmDelete'))) {
      try {
        await axios.delete(`http://127.0.0.1:5000/delete/${id}`);
        toast.success(t('toast.studentDeletedSuccess'));
        fetchStudents(); 
      } catch (err) {
        console.error('Failed to delete student:', err);
        toast.error(t('toast.deleteStudentFailed'));
      }
    }
  };

  const handleRefresh = async () => {
    setIsLoadingRefresh(true);
    try {
      await fetchStudents(); 
    } finally {
      setIsLoadingRefresh(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === '' || s.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const groupedStudents = filteredStudents.reduce((groups, student) => {
    const groupKey = student.grade || 'unspecified'; 
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(student);
    return groups;
  }, {});

  const exportToCSV = () => {
    const headers = [t('studentsTable.tableName'), t('studentsTable.tableGrade'), t('studentsTable.tableParentPhone'), t('studentsTable.tableFeesPaid')];
    const rows = filteredStudents.map((s) => [
      s.name,
      s.grade && gradeOptions.includes(s.grade) ? t(`grades.${s.grade.toLowerCase().replace(/ /g, '')}`) : s.grade || t('grades.unknown'),
      s.guardian_phone,
      s.fees_paid ? t('studentsTable.yes') : t('studentsTable.no'), // Translate "Yes" / "No"
    ]);

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

  // Loading message
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center p-8 bg-white rounded-lg shadow-xl animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl font-semibold text-gray-700">{t('common:loading')}</p>
        </div>
      </div>
    );
  }

  // Error message
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center bg-white p-10 rounded-lg shadow-xl border-t-4 border-red-500">
          <p className="text-3xl font-bold text-red-600 mb-5">{t('toast.fetchError')}</p>
          <p className="text-lg text-gray-700 mb-8">{error}</p>
          <button
            onClick={fetchStudents}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {t('studentsTable.refresh')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-3">{t('studentsTable.totalStudents')}</h2>

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
          {gradeOptions.map((g) => (
            <option key={g} value={g}>
              {t(`grades.${g.toLowerCase().replace(/ /g, '')}`)}
            </option>
          ))}
        </select>

        <button
          onClick={handleRefresh}
          disabled={isLoadingRefresh}
          className={`flex items-center px-4 py-2 rounded-md text-sm shadow-sm transition-transform hover:scale-105
            bg-yellow-400 hover:bg-yellow-500 text-white ${isLoadingRefresh ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={t('studentsTable.refresh')}
          title={t('studentsTable.refresh')}
        >
          {isRTL ? (
            <>
              {t('studentsTable.refresh')} <FaSyncAlt className={`ml-2 ${isLoadingRefresh ? 'animate-spin' : ''}`} />
            </>
          ) : (
            <>
              <FaSyncAlt className={`mr-2 ${isLoadingRefresh ? 'animate-spin' : ''}`} /> {t('studentsTable.refresh')}
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
        {/* Add Student Button */}
        <Link to="/add-student" className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm shadow-sm transition-transform hover:scale-105">
          {isRTL ? (
            <>
              {t('studentsTable.addStudent')} <FaPlus className="ml-2" />
            </>
          ) : (
            <>
              <FaPlus className="mr-2" /> {t('studentsTable.addStudent')}
            </>
          )}
        </Link>
      </div>

      {Object.keys(groupedStudents).length === 0 && (searchTerm !== '' || selectedGrade !== '') ? (
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
            <h3 className="text-lg font-semibold mb-2 text-blue-800">
              {t('studentsTable.gradePrefix')}{' '}
              {gradeOptions.includes(gradeKey) ? t(`grades.${gradeKey.toLowerCase().replace(/ /g, '')}`) : gradeKey === 'unspecified' ? t('studentsTable.unknownGrade') : gradeKey}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
              <table className="min-w-full border-collapse border border-gray-300 divide-y divide-gray-300">
                <thead className="bg-blue-100">
                  <tr>
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
                      <td className="px-4 py-2 border-r">
                        {s.grade && gradeOptions.includes(s.grade) ? t(`grades.${s.grade.toLowerCase().replace(/ /g, '')}`) : s.grade || t('studentsTable.unknownGrade')}
                      </td>
                      <td className="px-4 py-2 border-r">{s.guardian_phone}</td>
                      <td className="px-4 py-2 text-center border-r">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${s.fees_paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {s.fees_paid ? t('studentsTable.yes') : t('studentsTable.no')}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center flex flex-wrap justify-center gap-2">
                        <Link
                          to={`/students/${s.id}/details`}
                          className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-xs transition-transform hover:scale-110"
                          title={t('studentsTable.view')}
                          aria-label={`${t('studentsTable.view')} ${s.name}`}
                        >
                          <FaEye className="mr-1" /> {t('studentsTable.view')}
                        </Link>
                        <Link
                          to={`/edit-student/${s.id}`}
                          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition-transform hover:scale-110"
                          title={t('studentsTable.edit')}
                          aria-label={`${t('studentsTable.edit')} ${s.name}`}
                        >
                          <FaEdit className="mr-1" /> {t('studentsTable.edit')}
                        </Link>
                        <button
                          onClick={() => handleDelete(s.id)}
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
