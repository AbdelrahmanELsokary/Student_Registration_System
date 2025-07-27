from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import sqlite3
import os
import logging
from werkzeug.exceptions import HTTPException
from contextlib import closing

# Initialize Flask app
app = Flask(__name__)

# Enhanced CORS configuration
app.config['CORS_SUPPORTS_CREDENTIALS'] = True
cors = CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://student-registration-system-black-three.vercel.app",
            "http://localhost:3000",
            "http://localhost:5173"  # Vite default port
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Length", "X-Total-Count"],
        "max_age": 3600
    }
})

# Database configuration
DATABASE = os.path.join(os.path.dirname(__file__), 'students.db')

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    with closing(get_db()) as db:
        db.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER NOT NULL CHECK(age >= 5 AND age <= 25),
                grade REAL NOT NULL CHECK(grade >= 0 AND grade <= 100),
                paid BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        db.commit()

# Error handling
class APIError(Exception):
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

@app.errorhandler(APIError)
def handle_api_error(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# Middleware
@app.before_request
def before_request():
    logging.info(f"Incoming request: {request.method} {request.path}")

@app.after_request
def after_request(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

# API Endpoints
@app.route('/api/students', methods=['GET'])
def get_students():
    try:
        with closing(get_db()) as db:
            students = db.execute('SELECT * FROM students').fetchall()
            return jsonify({
                "data": [dict(student) for student in students],
                "count": len(students)
            })
    except Exception as e:
        logging.error(f"Database error: {str(e)}")
        raise APIError("Failed to fetch students", 500)

@app.route('/api/students', methods=['POST'])
def create_student():
    try:
        data = request.get_json()
        
        if not data:
            raise APIError("No data provided", 400)
        
        required_fields = ['name', 'age', 'grade']
        if not all(field in data for field in required_fields):
            raise APIError("Missing required fields", 400)

        with closing(get_db()) as db:
            cursor = db.cursor()
            cursor.execute(
                '''INSERT INTO students (name, age, grade, paid)
                VALUES (?, ?, ?, ?)''',
                (data['name'], data['age'], data['grade'], data.get('paid', False))
            )
            db.commit()
            student_id = cursor.lastrowid
            
            # Return the created student
            student = db.execute(
                'SELECT * FROM students WHERE id = ?',
                (student_id,)
            ).fetchone()
            
            return jsonify({"data": dict(student)}), 201
    except sqlite3.IntegrityError as e:
        raise APIError("Invalid data: " + str(e), 400)
    except Exception as e:
        logging.error(f"Creation error: {str(e)}")
        raise APIError("Failed to create student", 500)

@app.route('/api/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    try:
        data = request.get_json()
        
        if not data:
            raise APIError("No data provided", 400)
        
        with closing(get_db()) as db:
            # Check if student exists
            student = db.execute(
                'SELECT * FROM students WHERE id = ?',
                (student_id,)
            ).fetchone()
            
            if not student:
                raise APIError("Student not found", 404)
            
            # Update student
            db.execute(
                '''UPDATE students
                SET name = ?, age = ?, grade = ?, paid = ?
                WHERE id = ?''',
                (
                    data.get('name', student['name']),
                    data.get('age', student['age']),
                    data.get('grade', student['grade']),
                    data.get('paid', student['paid']),
                    student_id
                )
            )
            db.commit()
            
            # Return updated student
            updated = db.execute(
                'SELECT * FROM students WHERE id = ?',
                (student_id,)
            ).fetchone()
            
            return jsonify({"data": dict(updated)})
    except sqlite3.IntegrityError as e:
        raise APIError("Invalid data: " + str(e), 400)
    except Exception as e:
        logging.error(f"Update error: {str(e)}")
        raise APIError("Failed to update student", 500)

@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        with closing(get_db()) as db:
            # Check if student exists
            student = db.execute(
                'SELECT * FROM students WHERE id = ?',
                (student_id,)
            ).fetchone()
            
            if not student:
                raise APIError("Student not found", 404)
            
            db.execute(
                'DELETE FROM students WHERE id = ?',
                (student_id,)
            )
            db.commit()
            
            return jsonify({"message": "Student deleted successfully"})
    except Exception as e:
        logging.error(f"Deletion error: {str(e)}")
        raise APIError("Failed to delete student", 500)

# Initialize the app
with app.app_context():
    init_db()
    logging.info("Database initialized")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)