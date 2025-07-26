from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)

# إعداد CORS لتغطية كل الروابط والإجراءات المطلوبة
CORS(app, resources={r"/api/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

# الاتصال بقاعدة البيانات
def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), 'students.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

# إحضار جميع الطلاب
@app.route('/api/students', methods=['GET'])
def get_students():
    conn = get_db_connection()
    students = conn.execute('SELECT * FROM students').fetchall()
    conn.close()
    return jsonify([
        {
            'id': s['id'],
            'name': s['name'],
            'age': s['age'],
            'grade': s['grade'],
            'paid': bool(s['paid'])
        }
        for s in students
    ])

# إضافة طالب جديد
@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.get_json()
    name = data.get('name')
    age = data.get('age')
    grade = data.get('grade')
    paid = data.get('paid', False)

    if not name or not age or not grade:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO students (name, age, grade, paid) VALUES (?, ?, ?, ?)',
            (name, age, grade, int(paid))
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Student added successfully'}), 201
    except Exception as e:
        print('Error adding student:', e)
        return jsonify({'error': 'Failed to add student'}), 500

# تعديل بيانات طالب
@app.route('/api/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.get_json()
    name = data.get('name')
    age = data.get('age')
    grade = data.get('grade')
    paid = data.get('paid', False)

    if not name or not age or not grade:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE students SET name = ?, age = ?, grade = ?, paid = ? WHERE id = ?',
            (name, age, grade, int(paid), student_id)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Student updated successfully'}), 200
    except Exception as e:
        print('Error updating student:', e)
        return jsonify({'error': 'Failed to update student'}), 500

# حذف طالب
@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM students WHERE id = ?', (student_id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Student deleted successfully'}), 200
    except Exception as e:
        print('Error deleting student:', e)
        return jsonify({'error': 'Failed to delete student'}), 500

# تشغيل التطبيق
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
