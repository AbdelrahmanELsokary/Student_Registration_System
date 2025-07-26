from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # السماح للفرونت إند بالوصول

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.get_json()
    name = data['name']
    age = data['age']
    grade = data['grade']

    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    c.execute('INSERT INTO students (name, age, grade) VALUES (?, ?, ?)', (name, age, grade))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Student added successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True)
@app.route('/api/students', methods=['GET'])
def get_students():
    conn = sqlite3.connect('students.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, age, grade FROM students')
    students = cursor.fetchall()
    conn.close()

    return jsonify([
        {'id': row[0], 'name': row[1], 'age': row[2], 'grade': row[3]}
        for row in students
    ])
@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    conn = sqlite3.connect('students.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM students WHERE id = ?', (student_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student deleted'})

