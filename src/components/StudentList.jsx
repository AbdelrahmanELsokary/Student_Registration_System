import AddStudentForm from './AddStudentForm'; // تأكد أنها موجودة

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);

  const fetchStudents = () => {
    fetch('http://localhost:5000/api/students')
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error('Failed to fetch students', err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAdd = (newStudent) => {
    setStudents((prev) => [...prev, newStudent]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/students/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setStudents(students.filter((s) => s.id !== id));
        alert('Student deleted.');
      } else {
        alert('Failed to delete.');
      }
    } catch (err) {
      console.error(err);
      alert('Server error.');
    }
  };

  const handleUpdateSuccess = () => {
    setEditingStudent(null);
    fetchStudents();
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-8">
      <AddStudentForm onAdd={handleAdd} /> {/* ✅ استدعاء الفورم مع تمرير onAdd */}
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">Registered Students</h2>

        {editingStudent ? (
          <EditStudentForm student={editingStudent} onUpdate={handleUpdateSuccess} onCancel={() => setEditingStudent(null)} />
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Age</th>
                <th className="p-2 border">Grade</th>
                <th className="p-2 border">Paid</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={student.id}>
                  <td className="p-2 border">{idx + 1}</td>
                  <td className="p-2 border">{student.name}</td>
                  <td className="p-2 border">{student.age}</td>
                  <td className="p-2 border">{student.grade}</td>
                  <td className="p-2 border">{student.paid ? '✅' : '❌'}</td>
                  <td className="p-2 border flex gap-2">
                    <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" onClick={() => setEditingStudent(student)}>
                      Edit
                    </button>
                    <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onClick={() => handleDelete(student.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
