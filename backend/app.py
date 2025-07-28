from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DB_NAME = 'students.db'

# إنشاء قاعدة البيانات إذا لم تكن موجودة
def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                grade TEXT NOT NULL,
                guardian_phone TEXT NOT NULL,
                fees_paid INTEGER NOT NULL
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

# إرجاع طالب واحد حسب ID
@app.route('/student/<int:student_id>', methods=['GET'])
def get_student(student_id):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
        row = cursor.fetchone()
        if row:
            student = {
                'id': row[0],
                'name': row[1],
                'grade': row[2],
                'guardian_phone': row[3],
                'fees_paid': bool(row[4])
            }
            return jsonify(student), 200
        return jsonify({'error': 'Student not found'}), 404

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

if __name__ == '__main__':
    app.run(debug=True)
