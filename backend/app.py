from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])  # السماح فقط للفرونت إند بتاعك

# إنشاء قاعدة البيانات لو مش موجودة
def init_db():
    conn = sqlite3.connect("students.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            grade TEXT NOT NULL,
            guardian_phone TEXT NOT NULL,
            fees_paid INTEGER NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# تشغيل الدالة مرة واحدة فقط عند بداية التشغيل
init_db()

# إضافة طالب
@app.route("/add", methods=["POST"])
def add_student():
    data = request.json
    name = data.get("name")
    grade = data.get("grade")
    guardian_phone = data.get("guardian_phone") or data.get("guardianPhone")
    fees_paid = 1 if data.get("fees_paid") or data.get("feesPaid") else 0

    if not all([name, grade, guardian_phone]):
        return jsonify({"error": "Missing data"}), 400

    conn = sqlite3.connect("students.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO students (name, grade, guardian_phone, fees_paid) VALUES (?, ?, ?, ?)",
                   (name, grade, guardian_phone, fees_paid))
    conn.commit()
    conn.close()
    return jsonify({"message": "Student added successfully"}), 201
# عرض كل الطلاب
@app.route("/students", methods=["GET"])
def get_students():
    conn = sqlite3.connect("students.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students")
    rows = cursor.fetchall()
    conn.close()

    students = []
    for row in rows:
        students.append({
            "id": row[0],
            "name": row[1],
            "grade": row[2],
            "guardianPhone": row[3],
            "feesPaid": bool(row[4])
        })

    return jsonify(students)

# تحديث بيانات طالب
@app.route('/student/<int:id>', methods=['PUT'])
def update_student(id):
    data = request.get_json()
    with sqlite3.connect("students.db") as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE students 
            SET name = ?, grade = ?, guardian_phone = ?, fees_paid = ?
            WHERE id = ?
        ''', (data['name'], data['grade'], data['guardian_phone'], data['fees_paid'], id))
        conn.commit()
    return jsonify({'message': 'Student updated successfully'})
@app.route("/students/<int:id>", methods=["DELETE"])
def delete_student(id):
    conn = sqlite3.connect("students.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM students WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Student deleted successfully"})

if __name__ == "__main__":
    app.run(debug=True)
