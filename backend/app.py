from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_NAME = 'students.db'

# إنشاء قاعدة البيانات والجداول إذا لم تكن موجودة
def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        # جدول الطلاب
        conn.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                grade TEXT NOT NULL,
                guardian_phone TEXT NOT NULL,
                fees_paid INTEGER NOT NULL
            )
        ''')

        # جدول الحضور
        conn.execute('''
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')
        conn.commit()

# استدعاء إنشاء قاعدة البيانات عند التشغيل
init_db()

# إرجاع كل الطلاب
@app.route('/students', methods=['GET'])
def get_students():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM students")
        rows = cursor.fetchall()
        students = []
        for row in rows:
            students.append({
                'id': row[0],
                'name': row[1],
                'grade': row[2],
                'guardian_phone': row[3],
                'fees_paid': bool(row[4])
            })
        return jsonify(students), 200

# إرجاع طالب حسب ID
@app.route('/attendance/date/<date>', methods=['GET'])
def get_attendance_by_date(date):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute('''
        SELECT s.id, s.name, s.grade, s.guardian_phone, s.fees_paid,
               COALESCE(a.status, '') as status
        FROM students s
        LEFT JOIN attendance a
        ON s.id = a.student_id AND a.date = ?
    ''', (date,))

    rows = cursor.fetchall()
    conn.close()

    students = []
    for row in rows:
        students.append({
            'id': row[0],
            'name': row[1],
            'grade': row[2],
            'guardian_phone': row[3],
            'fees_paid': bool(row[4]),
            'status': row[5] if row[5] else 'absent'
        })

    return jsonify(students)

# إضافة طالب جديد
@app.route('/add', methods=['POST'])
def add_student():
    data = request.get_json()
    name = data['name']
    grade = data['grade']
    guardian_phone = data['guardian_phone']
    fees_paid = 1 if data['fees_paid'] else 0

    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO students (name, grade, guardian_phone, fees_paid) VALUES (?, ?, ?, ?)",
                       (name, grade, guardian_phone, fees_paid))
        conn.commit()
        return jsonify({'message': 'Student added successfully'}), 201

# تعديل بيانات طالب
@app.route('/student/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.get_json()
    name = data['name']
    grade = data['grade']
    guardian_phone = data['guardian_phone']
    fees_paid = 1 if data['fees_paid'] else 0

    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE students SET name = ?, grade = ?, guardian_phone = ?, fees_paid = ? WHERE id = ?",
                       (name, grade, guardian_phone, fees_paid, student_id))
        conn.commit()
        return jsonify({'message': 'Student updated successfully'}), 200

# حذف طالب
@app.route('/delete/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
        conn.commit()
        return jsonify({'message': 'Student deleted successfully'}), 200

# تسجيل حضور لطالب مع منع التكرار في نفس اليوم
@app.route('/attendance', methods=['POST'])
def add_attendance():
    data = request.get_json()
    student_id = data['student_id']
    status = data['status']  # 'present' or 'absent'
    date = data.get('date') or datetime.now().strftime('%Y-%m-%d')

    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()

        # منع التكرار: تأكد أن الطالب لم يُسجل له حضور بالفعل في نفس اليوم
        cursor.execute("SELECT * FROM attendance WHERE student_id = ? AND date = ?", (student_id, date))
        existing = cursor.fetchone()
        if existing:
            return jsonify({'error': 'Attendance already recorded for this student today'}), 400

        # تسجيل الحضور
        cursor.execute("INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)",
                       (student_id, date, status))
        conn.commit()
        return jsonify({'message': 'Attendance recorded'}), 201

# الحصول على حضور طالب معين
@app.route('/attendance/<int:student_id>', methods=['GET'])
def get_attendance(student_id):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT date, status FROM attendance WHERE student_id = ? ORDER BY date DESC", (student_id,))
        rows = cursor.fetchall()
        attendance_list = [{'date': row[0], 'status': row[1]} for row in rows]
        return jsonify(attendance_list), 200


# فلترة حضور طالب معين حسب شهر وسنة
@app.route('/attendance/monthly/<int:student_id>/<int:year>/<int:month>', methods=['GET'])
def get_monthly_attendance(student_id, year, month):
    month_str = f"{year:04d}-{month:02d}"
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT date, status FROM attendance WHERE student_id = ? AND date LIKE ? ORDER BY date ASC",
            (student_id, f"{month_str}-%")
        )
        rows = cursor.fetchall()
        attendance_list = [{'date': row[0], 'status': row[1]} for row in rows]
        return jsonify(attendance_list), 200

if __name__ == '__main__':
    app.run(debug=True)
