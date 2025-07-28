from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from contextlib import closing

# إعداد التطبيق
app = Flask(__name__)
CORS(app)

# اسم قاعدة البيانات
DATABASE = 'students.db'

# دالة الاتصال بقاعدة البيانات
def get_db():
    return sqlite3.connect(DATABASE)

# ========== [مسارات الطلاب] ==========

@app.route('/students', methods=['GET'])
def get_students():
    with closing(get_db()) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute('SELECT * FROM students')
        rows = cur.fetchall()
        return jsonify([dict(row) for row in rows])

@app.route('/student/<int:student_id>', methods=['GET'])
def get_student(student_id):
    with closing(get_db()) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute('SELECT * FROM students WHERE id = ?', (student_id,))
        row = cur.fetchone()
        if row:
            return jsonify(dict(row))
        return jsonify({'error': 'Student not found'}), 404

@app.route('/add', methods=['POST'])
def add_student():
    data = request.get_json()
    with closing(get_db()) as conn:
        cur = conn.cursor()
        cur.execute('''
            INSERT INTO students (name, grade, guardian_phone, fees_paid)
            VALUES (?, ?, ?, ?)
        ''', (
            data['name'],
            data['grade'],
            data['guardian_phone'],
            int(data['fees_paid'])
        ))
        conn.commit()
        return jsonify({'message': 'Student added successfully'}), 201

@app.route('/update/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.get_json()
    with closing(get_db()) as conn:
        cur = conn.cursor()
        cur.execute('''
            UPDATE students SET name = ?, grade = ?, guardian_phone = ?, fees_paid = ?
            WHERE id = ?
        ''', (
            data['name'],
            data['grade'],
            data['guardian_phone'],
            int(data['fees_paid']),
            student_id
        ))
        conn.commit()
        return jsonify({'message': 'Student updated successfully'})

@app.route('/delete/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    with closing(get_db()) as conn:
        cur = conn.cursor()
        cur.execute('DELETE FROM students WHERE id = ?', (student_id,))
        conn.commit()
        return jsonify({'message': 'Student deleted successfully'})

# ========== [مسارات الحضور] ==========

@app.route('/attendance', methods=['POST'])
def mark_attendance():
    data = request.get_json()
    student_id = data['student_id']
    date = data['date']
    status = data['status']

    with closing(get_db()) as conn:
        cur = conn.cursor()
        # حذف القديم (إن وجد) لتحديثه
        cur.execute('DELETE FROM attendance WHERE student_id = ? AND date = ?', (student_id, date))
        cur.execute('''
            INSERT INTO attendance (student_id, date, status)
            VALUES (?, ?, ?)
        ''', (student_id, date, status))
        conn.commit()
        return jsonify({'message': 'Attendance marked successfully'})

@app.route('/attendance/date/<date>', methods=['GET'])
def get_attendance_by_date(date):
    grade = request.args.get('grade')

    with closing(get_db()) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        if grade not in (None, '', 'All'):
            cur.execute('''
                SELECT s.id, s.name, s.grade, s.guardian_phone, s.fees_paid, a.status
                FROM students s
                LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
                WHERE s.grade = ?
            ''', (date, grade))
        else:
            cur.execute('''
                SELECT s.id, s.name, s.grade, s.guardian_phone, s.fees_paid, a.status
                FROM students s
                LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
            ''', (date,))

        students = [dict(row) for row in cur.fetchall()]
        return jsonify(students)

@app.route('/attendance/summary', methods=['GET'])
def attendance_summary():
    with closing(get_db()) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                s.id,
                s.name,
                s.grade,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent
            FROM students s
            LEFT JOIN attendance a ON s.id = a.student_id
            GROUP BY s.id, s.name, s.grade
            ORDER BY s.name
        ''')
        results = cursor.fetchall()
        summary = [
            {
                'id': row[0],
                'name': row[1],
                'grade': row[2],
                'present': row[3],
                'absent': row[4]
            }
            for row in results
        ]
        return jsonify(summary)


# ========== [تشغيل السيرفر] ==========

if __name__ == '__main__':
    app.run(debug=True)
