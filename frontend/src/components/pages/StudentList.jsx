import { useEffect, useState } from "react";
import StudentTable from "../StudentTable";

export default function StudentListPage() {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/students");
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Student List</h2>
      <StudentTable students={students} onRefresh={fetchStudents} />
    </div>
  );
}
