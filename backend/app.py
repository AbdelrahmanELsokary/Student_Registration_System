from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS
from contextlib import closing
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATABASE = 'students.db'

def connect_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# 🧱 إنشاء قاعدة البيانات إذا لم تكن موجودة
def init_db():
    with closing(connect_db()) as conn:
        with conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    grade TEXT NOT NULL,
                    guardian_phone TEXT,
                    fees_paid BOOLEAN NOT NULL DEFAULT 0
                )
            ''')
            conn.execute('''
                CREATE TABLE IF NOT EXISTS attendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL,
                    date TEXT NOT NULL,
                    status TEXT CHECK(status IN ('present', 'absent')),
                    FOREIGN KEY(student_id) REFERENCES students(id)
                )
            ''')

# ✅ عرض كل الطلاب
@app.route('/students', methods=['GET'])
def get_students():
    with closing(connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM students')
        students = [dict(row) for row in cursor.fetchall()]
    return jsonify(students)

# ✅ إضافة طالب
@app.route('/add', methods=['POST'])
def add_student():
    data = request.get_json()
    if not data or 'name' not in data or 'grade' not in data or 'guardian_phone' not in data:
        return jsonify({'error': 'Missing fields'}), 400

    with closing(connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO students (name, grade, guardian_phone, fees_paid)
            VALUES (?, ?, ?, ?)
        ''', (data['name'], data['grade'], data['guardian_phone'], data.get('fees_paid', False)))
        conn.commit()
    return jsonify({'message': 'Student added successfully'}), 201

# ✅ تعديل طالب
@app.route('/student/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.get_json()
    with closing(connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE students
            SET name = ?, grade = ?, guardian_phone = ?, fees_paid = ?
            WHERE id = ?
        ''', (
            data['name'],
            data['grade'],
            data['guardian_phone'],
            data['fees_paid'],
            student_id
        ))
        conn.commit()
    return jsonify({'message': 'Student updated successfully'}), 200

# ✅ حذف طالب
@app.route('/student/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    with closing(connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM students WHERE id = ?', (student_id,))
        conn.commit()
    return jsonify({'message': 'Student deleted successfully'}), 200

# ✅ عرض طالب واحد
@app.route('/student/<int:student_id>', methods=['GET'])
def get_student(student_id):
    with closing(connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM students WHERE id = ?', (student_id,))
        student = cursor.fetchone()
        if student:
            return jsonify(dict(student))
        else:
            return jsonify({'error': 'Student not found'}), 404

# ✅ تسجيل الحضور
@app.route('/attendance', methods=['POST'])
def mark_attendance():
    data = request.get_json()

    if not data or 'student_id' not in data or 'status' not in data:
        return jsonify({'error': 'student_id and status are required'}), 400

    student_id = data['student_id']
    status = data['status']
    date = data.get('date', datetime.today().strftime('%Y-%m-%d'))

    if status not in ['present', 'absent']:
        return jsonify({'error': 'Status must be present or absent'}), 400

    with closing(connect_db()) as conn:
        cursor = conn.cursor()

        # تأكد من وجود الطالب
        cursor.execute('SELECT id FROM students WHERE id = ?', (student_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Student not found'}), 400

        # حذف الحضور القديم لهذا اليوم
        cursor.execute('DELETE FROM attendance WHERE student_id = ? AND date = ?', (student_id, date))

        # إدخال الحضور
        cursor.execute('''
            INSERT INTO attendance (student_id, date, status)
            VALUES (?, ?, ?)
        ''', (student_id, date, status))
        conn.commit()

    return jsonify({'message': f'Attendance marked as {status}'}), 200

# ✅ استرجاع الحضور حسب التاريخ
@app.route('/attendance/date/<date>', methods=['GET'])
def get_attendance_by_date(date):
    with closing(connect_db()) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT s.*, a.status
            FROM students s
            LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
        ''', (date,))
        records = [dict(row) for row in cursor.fetchall()]
    return jsonify(records)

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
