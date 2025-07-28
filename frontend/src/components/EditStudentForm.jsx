import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function EditStudentForm() {
  const { id } = useParams(); // أخذ ID الطالب من URL
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [feesPaid, setFeesPaid] = useState(false);

  // عند تحميل الصفحة، جلب بيانات الطالب
  useEffect(() => {
    axios
      .get(`http://127.0.0.1:5000/student/${id}`)
      .then((res) => {
        const student = res.data;
        setName(student.name);
        setGrade(student.grade);
        setParentPhone(student.guardian_phone);
        setFeesPaid(student.fees_paid);
      })
      .catch(() => {
        toast.error('Failed to fetch student data.');
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedStudent = {
      name,
      grade,
      guardian_phone: parentPhone,
      fees_paid: feesPaid,
    };

    try {
      await axios.put(`http://127.0.0.1:5000/student/${id}`, updatedStudent);
      toast.success('Student updated successfully!');
      navigate('/students');
    } catch {
      toast.error('Failed to update student.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-700">Edit Student</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full px-3 py-2 border rounded" placeholder="Student Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full px-3 py-2 border rounded" placeholder="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} required />
        <input className="w-full px-3 py-2 border rounded" placeholder="Parent Phone Number" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} required />
        <div className="flex items-center space-x-2">
          <input type="checkbox" checked={feesPaid} onChange={(e) => setFeesPaid(e.target.checked)} />
          <label className="text-gray-600">Fees Paid</label>
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Update Student
        </button>
      </form>
    </div>
  );
}
