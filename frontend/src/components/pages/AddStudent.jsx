import StudentForm from '../StudentForm';

export default function AddStudentPage() {
  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
      <StudentForm />
    </div>
  );
}
