from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# إنشاء قاعدة البيانات (مرة واحدة فقط)
def init_db():
    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            grade TEXT NOT NULL,
            paid INTEGER NOT NULL DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# إضافة طالب
@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.get_json()
    name = data.get('name')
    age = data.get('age')
    grade = data.get('grade')
    paid = 1 if data.get('paid') else 0

    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    c.execute('INSERT INTO students (name, age, grade, paid) VALUES (?, ?, ?, ?)', (name, age, grade, paid))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student added successfully'}), 201

# جلب الطلاب
@app.route('/api/students', methods=['GET'])
def get_students():
    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    c.execute('SELECT id, name, age, grade, paid FROM students')
    rows = c.fetchall()
    conn.close()
    return jsonify([
        {'id': r[0], 'name': r[1], 'age': r[2], 'grade': r[3], 'paid': bool(r[4])}
        for r in rows
    ])

# حذف طالب
@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    c.execute('DELETE FROM students WHERE id = ?', (student_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student deleted'})
    
if __name__ == '__main__':
    app.run(debug=True)
