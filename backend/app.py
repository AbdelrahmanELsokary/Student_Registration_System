from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import sqlite3
import os
import logging
from werkzeug.exceptions import HTTPException

# تهيئة التطبيق
app = Flask(__name__)

# إعدادات CORS
cors = CORS(app, resources={
    r"/api/*": {
        "origins": ["https://student-registration-system-pi.vercel.app", "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# إعداد تسجيل الأخطاء
logging.basicConfig(filename='app.log', level=logging.ERROR)

# وظيفة الاتصال بقاعدة البيانات
def get_db_connection():
    try:
        db_path = os.path.join(os.path.dirname(__file__), 'students.db')
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logging.error(f"Database connection error: {e}")
        raise

# تهيئة قاعدة البيانات
def init_db():
    try:
        with get_db_connection() as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    age INTEGER NOT NULL,
                    grade REAL NOT NULL,
                    paid INTEGER DEFAULT 0
                )
            ''')
            conn.commit()
    except sqlite3.Error as e:
        logging.error(f"Database initialization error: {e}")
        raise

# معالجة الأخطاء العامة
@app.errorhandler(Exception)
def handle_exception(e):
    if isinstance(e, HTTPException):
        return e
    logging.error(f"Server Error: {str(e)}")
    return jsonify({"error": "Internal Server Error"}), 500

# مسارات API
@app.route('/api/students', methods=['GET', 'OPTIONS'])
def get_students():
    if request.method == 'OPTIONS':
        return handle_options()
    
    try:
        with get_db_connection() as conn:
            students = conn.execute('SELECT * FROM students').fetchall()
            return jsonify([dict(student) for student in students])
    except Exception as e:
        logging.error(f"Error fetching students: {e}")
        return jsonify({"error": "Failed to fetch students"}), 500

@app.route('/api/students', methods=['POST'])
def add_student():
    try:
        data = request.get_json()
        
        if not data or not all(key in data for key in ['name', 'age', 'grade']):
            return jsonify({"error": "Missing required fields"}), 400
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO students (name, age, grade, paid) VALUES (?, ?, ?, ?)',
                (data['name'], int(data['age']), float(data['grade']), int(data.get('paid', False)))
            )
            conn.commit()
            return jsonify({
                "message": "Student added successfully",
                "id": cursor.lastrowid
            }), 201
    except ValueError:
        return jsonify({"error": "Invalid data types"}), 400
    except Exception as e:
        logging.error(f"Error adding student: {e}")
        return jsonify({"error": "Failed to add student"}), 500

@app.route('/api/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''UPDATE students 
                SET name = ?, age = ?, grade = ?, paid = ? 
                WHERE id = ?''',
                (
                    data.get('name'),
                    int(data.get('age')),
                    float(data.get('grade')),
                    int(data.get('paid', False)),
                    student_id
                )
            )
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({"error": "Student not found"}), 404
            return jsonify({"message": "Student updated successfully"}), 200
    except ValueError:
        return jsonify({"error": "Invalid data types"}), 400
    except Exception as e:
        logging.error(f"Error updating student: {e}")
        return jsonify({"error": "Failed to update student"}), 500

@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM students WHERE id = ?', (student_id,))
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({"error": "Student not found"}), 404
            return jsonify({"message": "Student deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting student: {e}")
        return jsonify({"error": "Failed to delete student"}), 500

# معالجة طلبات OPTIONS
def handle_options():
    response = make_response()
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    return response

# تهيئة التطبيق
with app.app_context():
    init_db()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)