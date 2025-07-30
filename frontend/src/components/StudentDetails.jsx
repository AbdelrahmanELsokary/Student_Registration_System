import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/ar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [student, setStudent] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      const sortedRecords = (recordsData || []).sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
      setAttendanceRecords(sortedRecords);
    } catch (err) {
      console.error('Error fetching student details:', err);
      if (err.response) {
        if (err.response.status === 404) {
          setError(t('studentNotFound'));
        } else {
          setError(`${t('failedToLoadData')} ${t('statusCode')}: ${err.response.status}`);
        }
      } else if (err.request) {
        setError(t('noServerResponse'));
      } else {
        setError(`${t('unexpectedError')}: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    dayjs.locale(i18n.language === 'ar' ? 'ar' : 'en');
  }, [i18n.language]);

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

  const exportPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    if (i18n.language === 'ar') {
      doc.setRTL(true);
      doc.text(t('pdfReportTitle'), doc.internal.pageSize.getWidth() - 14, 16, { align: 'right' });
    } else {
      doc.text(t('pdfReportTitle'), 14, 16);
    }

    const tableColumn = [t('dateColumn'), t('statusColumn'), t('recitationColumn'), t('testColumn')];
    const tableRows = filteredRecords.map((rec) => [
      dayjs(rec.date).format('YYYY-MM-DD'),
      t(rec.status === 'present' ? 'presentStatus' : 'absentStatus'),
      rec.recitation ?? t('notApplicable'),
      rec.test ?? t('notApplicable'),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: i18n.language === 'ar' ? 'right' : 'left',
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      didDrawPage: function (data) {
        doc.setFontSize(10);
        const pageCount = doc.internal.pages.length;
        doc.text(t('pageNumber', { page: data.pageNumber, totalPages: pageCount - 1 }), doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      },
    });

    doc.save(`${student?.name}_${t('attendanceReport')}.pdf`);
  }, [filteredRecords, student, t, i18n.language]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center p-8 bg-white rounded-lg shadow-xl animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl font-semibold text-gray-700">{t('loadingTitle')}</p>
          <p className="text-gray-500 mt-2">{t('loadingMessage')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center bg-white p-10 rounded-lg shadow-xl border-t-4 border-red-500">
          <p className="text-3xl font-bold text-red-600 mb-5">{t('errorTitle')}</p>
          <p className="text-lg text-gray-700 mb-8">{error}</p>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-neutral-100 text-gray-800 hover:bg-neutral-200 transition-all shadow">
            <span className="material-icons">arrow_back</span>
            {t('backButton')}
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center bg-white p-10 rounded-lg shadow-xl border-t-4 border-yellow-500">
          <p className="text-3xl font-bold text-yellow-600 mb-5">{t('noStudentFoundTitle')}</p>
          <p className="text-lg text-gray-700 mb-8">{t('noStudentFoundMessage')}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {t('backToList')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-6 font-sans" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">{t('studentDetailsPageTitle')}</h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold shadow-md transition-all duration-300 hover:bg-gray-200 hover:shadow-lg hover:scale-[1.03]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1 ${i18n.language === 'ar' ? 'ml-2 rotate-180' : 'mr-2'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t('backButton')}
          </button>

          <button
            onClick={() => navigate(`/edit-student/${id}`)}
            className="group flex items-center px-6 py-2.5 rounded-xl bg-gray-100 text-gray-800 font-semibold shadow-lg transition-all duration-300 hover:bg-gray-200 hover:shadow-xl hover:scale-[1.03]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-7.793 7.793-2.121.707-.707-2.121 7.793-7.793z" />
            </svg>
            {t('editStudentButton')}
          </button>

          <button
            onClick={exportPDF}
            className="group flex items-center px-6 py-2 rounded-xl bg-gray-100 text-gray-800 font-semibold shadow-md transition-all duration-300 hover:bg-gray-200 hover:shadow-lg hover:scale-[1.03]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.5 17a4.5 4.5 0 01-1.44-8.765A4.5 4.5 0 0110 4.5V11a.5.5 0 00.997.073l.995-2.986A.5.5 0 0012 8V4a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v12a2.5 2.5 0 01-2.5 2.5h-9A2.5 2.5 0 014 17.5V14h1.5a.5.5 0 00.5-.5V13H5v-.5a.5.5 0 00-.5-.5H4v-.5a.5.5 0 00-.5-.5H3V9h.5a.5.5 0 00.5-.5V8H4V7.5a.5.5 0 00-.5-.5H3V6h.5a.5.5 0 00.5-.5V5h-.5A4.5 4.5 0 015.5 1.5zM12 4a.5.5 0 00-.5-.5h-2a.5.5 0 00-.5.5v7a.5.5 0 00.997.073l.995-2.986A.5.5 0 0012 8V4z"
                clipRule="evenodd"
              />
            </svg>
            {t('exportPdfButton')}
          </button>
        </div>
      </div>

      <section className="bg-white shadow-xl rounded-xl p-6 md:p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-3">{t('personalInformationSectionTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-lg">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
            <strong className="text-gray-700">{t('studentName')}:</strong>
            <span className="font-semibold text-gray-900 mt-1">{student.name}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
            <strong className="text-gray-700">{t('studentGrade')}:</strong>
            <span className="font-semibold text-gray-900 mt-1">{t(`grades.${student.grade.toLowerCase().replace(/ /g, '')}`)}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
            <strong className="text-gray-700">{t('guardianPhoneNumber')}:</strong>
            <span className="font-semibold text-gray-900 mt-1">{student.guardian_phone}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
            <strong className="text-gray-700">{t('feesPaymentStatus')}:</strong>
            <span className={`font-bold mt-1 ${student.fees_paid ? 'text-green-600' : 'text-red-600'}`}>{student.fees_paid ? t('feesPaidYes') : t('feesPaidNo')}</span>
          </div>
        </div>
      </section>

      <section className="bg-white shadow-xl rounded-xl p-6 md:p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-3">{t('attendanceSummarySectionTitle')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-lg text-center">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex flex-col items-center justify-center">
            <strong className="text-blue-700 text-lg">{t('presentCount')}:</strong>
            <span className="font-extrabold text-blue-800 text-4xl mt-2">{attendanceSummary.present}</span>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex flex-col items-center justify-center">
            <strong className="text-red-700 text-lg">{t('absentCount')}:</strong>
            <span className="font-extrabold text-red-800 text-4xl mt-2">{attendanceSummary.absent}</span>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex flex-col items-center justify-center">
            <strong className="text-green-700 text-lg">{t('averageRecitationScore')}:</strong>
            <span className="font-extrabold text-green-800 text-4xl mt-2">{attendanceSummary.avg_recitation !== null ? attendanceSummary.avg_recitation.toFixed(2) : t('notApplicable')}</span>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex flex-col items-center justify-center">
            <strong className="text-yellow-700 text-lg">{t('averageTestScore')}:</strong>
            <span className="font-extrabold text-yellow-800 text-4xl mt-2">{attendanceSummary.avg_test !== null ? attendanceSummary.avg_test.toFixed(2) : t('notApplicable')}</span>
          </div>
        </div>
      </section>

      <section className="bg-white shadow-xl rounded-xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">{t('attendanceRecordsSectionTitle')}</h2>
          <div className="flex items-center gap-3">
            <label htmlFor="attendance-filter" className="font-medium text-gray-700 text-lg">
              {t('filterBy')}:
            </label>
            <select
              id="attendance-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-base"
            >
              <option value="all">{t('allRecords')}</option>
              <option value="week">{t('thisWeek')}</option>
              <option value="month">{t('thisMonth')}</option>
            </select>
          </div>
        </div>

        <p className="text-gray-600 mb-4 text-sm md:text-base">{t('showingRecordsCount', { count: filteredRecords.length, total: attendanceRecords.length })}</p>

        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
          {filteredRecords.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 text-sm md:text-base bg-white">
              <thead className="bg-gray-100">
                <tr className="text-left text-gray-700 font-bold">
                  <th className="px-6 py-3 uppercase tracking-wider">{t('dateColumn')}</th>
                  <th className="px-6 py-3 uppercase tracking-wider">{t('statusColumn')}</th>
                  <th className="px-6 py-3 uppercase tracking-wider">{t('recitationColumn')}</th>
                  <th className="px-6 py-3 uppercase tracking-wider">{t('testColumn')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((record, index) => (
                  <tr key={record.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">{dayjs(record.date).format('YYYY-MM-DD')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {t(record.status === 'present' ? 'presentStatus' : 'absentStatus')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.recitation ?? t('notApplicable')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.test ?? t('notApplicable')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-8 text-center text-gray-500 text-lg italic">{t('noRecordsForPeriod')}</p>
          )}
        </div>
      </section>
    </div>
  );
}
