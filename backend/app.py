from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

# إعداد التطبيق
app = Flask(__name__)
CORS(app)

# اسم قاعدة البيانات
DATABASE = 'students.db'

# إنشاء قاعدة البيانات لو مش موجودة
def init_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL
            )
        ''')
        conn.commit()

# راوت لإرجاع كل الطلاب
@app.route('/students', methods=['GET'])
def get_students():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM students")
        rows = cursor.fetchall()
        students = [
            {'id': row[0], 'name': row[1], 'email': row[2], 'phone': row[3]}
            for row in rows
        ]
        return jsonify(students)

# راوت لإضافة طالب
@app.route('/add', methods=['POST'])
def add_student():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO students (name, email, phone) VALUES (?, ?, ?)",
                       (name, email, phone))
        conn.commit()
    return jsonify({'message': 'Student added successfully.'}), 201

# راوت لتعديل بيانات طالب
@app.route('/update/<int:id>', methods=['PUT'])
def update_student(id):
    data = request.json
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE students SET name = ?, email = ?, phone = ? WHERE id = ?",
                       (name, email, phone, id))
        conn.commit()
    return jsonify({'message': 'Student updated successfully.'})

# راوت لحذف طالب
@app.route('/delete/<int:id>', methods=['DELETE'])
def delete_student(id):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM students WHERE id = ?", (id,))
        conn.commit()
    return jsonify({'message': 'Student deleted successfully.'})

# ✅ راوت لجلب بيانات طالب واحد (ده المهم عشان EditStudentForm)
@app.route('/student/<int:id>', methods=['GET'])
def get_student(id):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM students WHERE id = ?", (id,))
        row = cursor.fetchone()
        if row:
            student = {
                'id': row[0],
                'name': row[1],
                'email': row[2],
                'phone': row[3]
            }
            return jsonify(student), 200
        else:
            return jsonify({'error': 'Student not found'}), 404

# تشغيل التطبيق
if __name__ == '__main__':
    init_db()  # إنشاء الجدول لو مش موجود
    app.run(debug=True)
