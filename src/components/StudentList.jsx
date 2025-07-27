import { useState } from 'react';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    name: '',
    level: 'beginner',
    phone: '',
  });

  // إضافة طالب
  const handleSubmit = (e) => {
    e.preventDefault();
    setStudents([...students, { ...form, id: Date.now() }]);
    setForm({ name: '', level: 'beginner', phone: '' });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">نظام إدارة الطلاب</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="اسم الطالب"
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-400"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <select className="p-2 border rounded focus:ring-2 focus:ring-indigo-400" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            <option value="beginner">مبتدئ</option>
            <option value="intermediate">متوسط</option>
            <option value="advanced">متقدم</option>
          </select>

          <input
            type="tel"
            placeholder="رقم الهاتف"
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-400"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <button type="submit" className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition-colors">
            إضافة طالب
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-right">ID</th>
              <th className="py-3 px-4 text-right">الاسم</th>
              <th className="py-3 px-4 text-right">المستوى</th>
              <th className="py-3 px-4 text-right">الهاتف</th>
              <th className="py-3 px-4 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{student.id}</td>
                <td className="py-3 px-4">{student.name}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      student.level === 'beginner' ? 'bg-blue-100 text-blue-800' : student.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {student.level}
                  </span>
                </td>
                <td className="py-3 px-4">{student.phone}</td>
                <td className="py-3 px-4">
                  <button className="text-red-600 hover:text-red-800">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
