from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

# إعداد التطبيق
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])  # السماح لتطبيق React

# اسم قاعدة البيانات
DATABASE = 'students.db'

# دالة لإنشاء قاعدة البيانات إن لم تكن موجودة
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

# دالة للمساعدة في الاتصال بالقاعدة
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# جلب جميع الطلاب
@app.route('/students', methods=['GET'])
def get_students():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM students")
        rows = cursor.fetchall()
        students = [dict(row) for row in rows]
        conn.close()
        return jsonify(students)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# إضافة طالب جديد
@app.route('/add', methods=['POST'])
def add_student():
    try:
        data = request.get_json()
        print("Received data:", data)

        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')

        if not name or not email or not phone:
            return jsonify({"error": "Missing data"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO students (name, email, phone) VALUES (?, ?, ?)", (name, email, phone))
        conn.commit()
        conn.close()
        return jsonify({"message": "Student added successfully."}), 201
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 400

# تعديل بيانات طالب
@app.route('/update/<int:id>', methods=['PUT'])
def update_student(id):
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE students SET name=?, email=?, phone=? WHERE id=?", (name, email, phone, id))
        conn.commit()
        conn.close()
        return jsonify({"message": "Student updated successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# حذف طالب
@app.route('/delete/<int:id>', methods=['DELETE'])
def delete_student(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM students WHERE id=?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Student deleted successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# تشغيل السيرفر
if __name__ == '__main__':
    init_db()
    app.run(debug=True)
