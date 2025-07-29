import { FaEdit, FaTrash, FaSearch, FaSyncAlt, FaFileCsv } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function StudentsTable({ students, onDelete, onRefresh }) {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const isRTL = i18n.language === 'ar';

  const allGrades = [...new Set(students.map((s) => s.grade))];

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'All' || s.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const groupedStudents = filteredStudents.reduce((groups, student) => {
    const grade = student.grade || 'Unknown';
    if (!groups[grade]) groups[grade] = [];
    groups[grade].push(student);
    return groups;
  }, {});

  const exportToCSV = () => {
    const headers = [t('studentsTable.tableName'), t('studentsTable.tableGrade'), t('studentsTable.tableParentPhone'), t('studentsTable.tableFeesPaid')];
    const rows = filteredStudents.map((s) => [s.name, s.grade, s.guardian_phone, s.fees_paid ? t('studentsTable.yes') : t('studentsTable.no')]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = selectedGrade === 'All' ? 'students.csv' : `students_${selectedGrade}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Summary cards */}
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

      {/* Search & Filters */}
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
          <option value="All">{t('studentsTable.allGrades')}</option>
          {allGrades.map((g) => (
            <option key={g} value={g}>
              {t(`grades.${g.toLowerCase().replace(/ /g, '')}`)}
            </option>
          ))}
        </select>

        <button onClick={onRefresh} className="flex items-center bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm shadow-sm">
          {isRTL ? (
            <>
              {t('studentsTable.refresh')} <FaSyncAlt className="ml-2" />
            </>
          ) : (
            <>
              <FaSyncAlt className="mr-2" /> {t('studentsTable.refresh')}
            </>
          )}
        </button>

        <button onClick={exportToCSV} className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm shadow-sm">
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

      {/* Table */}
      {Object.keys(groupedStudents).length === 0 ? (
        <div className="text-center text-gray-500 py-10">{t('studentsTable.noStudentsFound')}</div>
      ) : (
        Object.entries(groupedStudents).map(([grade, studentsInGrade]) => (
          <div key={grade} className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">
              {t('studentsTable.gradePrefix')} {t(`grades.${grade.toLowerCase().replace(/ /g, '')}`)}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 divide-y divide-gray-300 shadow-md rounded-lg">
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
                      <td className="px-4 py-2 border-r">{t(`grades.${s.grade.toLowerCase().replace(/ /g, '')}`)}</td>
                      <td className="px-4 py-2 border-r">{s.guardian_phone}</td>
                      <td className="px-4 py-2 text-center border-r">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${s.fees_paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {s.fees_paid ? t('studentsTable.yes') : t('studentsTable.no')}
                        </span>
                      </td>
                      <td className={`px-4 py-2 text-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                        <Link to={`/edit/${s.id}`} className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs">
                          {isRTL ? (
                            <>
                              {t('studentsTable.edit')} <FaEdit className="ml-1" />
                            </>
                          ) : (
                            <>
                              <FaEdit className="mr-1" /> {t('studentsTable.edit')}
                            </>
                          )}
                        </Link>
                        <button onClick={() => onDelete(s.id)} className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs">
                          {isRTL ? (
                            <>
                              {t('studentsTable.delete')} <FaTrash className="ml-1" />
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
