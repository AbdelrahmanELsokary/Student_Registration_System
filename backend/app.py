from flask import Flask, request, jsonify
from contextlib import closing
from datetime import datetime
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app) 

DATABASE = 'students.db' 

def get_db():
    return sqlite3.connect(DATABASE)

@app.route('/students', methods=['GET'])
def get_students():
    try:
        with closing(get_db()) as conn:
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute('SELECT * FROM students')
            rows = cur.fetchall()
            return jsonify([dict(row) for row in rows])
    except sqlite3.Error as e:
        print(f"Database error during get_students: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during get_students: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/student/<int:student_id>', methods=['GET'])
def get_student(student_id):
    try:
        with closing(get_db()) as conn:
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute('SELECT * FROM students WHERE id = ?', (student_id,))
            row = cur.fetchone()
            if row:
                return jsonify(dict(row))
            return jsonify({'error': 'Student not found'}), 404
    except sqlite3.Error as e:
        print(f"Database error during get_student: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during get_student: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/add', methods=['POST'])
def add_student():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON data'}), 400

    required_fields = ['name', 'grade', 'guardian_phone', 'fees_paid']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
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
            return jsonify({'message': 'Student added successfully', 'id': cur.lastrowid}), 201 
    except sqlite3.Error as e:
        print(f"Database error during add_student: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during add_student: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/update/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON data'}), 400

    try:
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
            if cur.rowcount == 0:
                return jsonify({'message': 'Student not found or no changes made'}), 404
            return jsonify({'message': 'Student updated successfully'})
    except sqlite3.Error as e:
        print(f"Database error during update_student: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during update_student: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/delete/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        with closing(get_db()) as conn:
            cur = conn.cursor()
            cur.execute('DELETE FROM students WHERE id = ?', (student_id,))
            conn.commit()
            if cur.rowcount == 0:
                return jsonify({'message': 'Student not found'}), 404
            return jsonify({'message': 'Student deleted successfully'})
    except sqlite3.Error as e:
        print(f"Database error during delete_student: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during delete_student: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/students/attendance-summary', methods=['GET'])
def get_students_attendance_summary():
    grade = request.args.get('grade') 
    name = request.args.get('name', '')
    try:
        with closing(get_db()) as conn:
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()

            query = '''
                SELECT
                    s.id,
                    s.name,
                    s.grade,
                    s.guardian_phone,
                    s.fees_paid,
                    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS total_present,
                    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS total_absent
                FROM students s
                LEFT JOIN attendance a ON s.id = a.student_id
            '''
            params = []
            filters = []

            if grade and grade != 'All':
                filters.append("s.grade = ?")
                params.append(grade)
            if name:
                filters.append("s.name LIKE ?")
                params.append(f'%{name}%')

            if filters:
                query += " WHERE " + " AND ".join(filters)

            query += " GROUP BY s.id, s.name, s.grade, s.guardian_phone, s.fees_paid"
            query += " ORDER BY s.name" 

            cur.execute(query, params)
            students_summary = [dict(row) for row in cur.fetchall()]
            return jsonify(students_summary)
    except sqlite3.Error as e:
        print(f"Database error during get_students_attendance_summary: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during get_students_attendance_summary: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/attendance', methods=['POST'])
def mark_attendance():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON data'}), 400

    required_fields = ['student_id', 'date', 'status']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    student_id = data['student_id']
    date = data['date']
    status = data['status']

    if status not in ['present', 'absent']:
        return jsonify({'error': 'Invalid status. Must be "present" or "absent"'}), 400

    try:
        with closing(get_db()) as conn:
            cur = conn.cursor()
            # Delete previous attendance for the student on that date
            cur.execute('DELETE FROM attendance WHERE student_id = ? AND date = ?', (student_id, date))
            # Insert new attendance record without notes
            cur.execute('''
                INSERT INTO attendance (student_id, date, status)
                VALUES (?, ?, ?)
            ''', (student_id, date, status))
            conn.commit()
            return jsonify({'message': 'Attendance marked successfully'})
    except sqlite3.Error as e:
        print(f"Database error during mark_attendance: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during mark_attendance: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/attendance/date/<date>', methods=['GET'])
def get_attendance_by_date(date):
    grade = request.args.get('grade') 
    name = request.args.get('name', '') 

    try:
        with closing(get_db()) as conn:
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()

            base_query = '''
                SELECT
                    s.id, s.name, s.grade, s.guardian_phone, s.fees_paid,
                    a.status
                FROM students s
                LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
            '''

            filters = []
            params = [date]

            if grade and grade != 'All': 
                filters.append("s.grade = ?")
                params.append(grade)
            if name: 
                filters.append("s.name LIKE ?")
                params.append(f'%{name}%') 

            if filters:
                base_query += " WHERE " + " AND ".join(filters)

            cur.execute(base_query, params)
            students = [dict(row) for row in cur.fetchall()] 
            return jsonify(students)
    except sqlite3.Error as e:
        print(f"Database error during get_attendance_by_date: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during get_attendance_by_date: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/attendance/summary', methods=['GET'])
def get_attendance_summary():
    date = request.args.get('date')
    grade = request.args.get('grade')

    try:
        with closing(get_db()) as conn:
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()

            cur.execute('SELECT COUNT(*) FROM students')
            total_students_registered = cur.fetchone()[0]

            query = '''
                SELECT
                    COUNT(DISTINCT s.id) AS total_students_with_records,
                    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
                    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_count
                FROM students s
                LEFT JOIN attendance a ON s.id = a.student_id
            '''
            params = []
            filters = []

            if date:
                filters.append("a.date = ?")
                params.append(date)
            if grade and grade != 'All':
                filters.append("s.grade = ?")
                params.append(grade)

            if filters:
                query += " WHERE " + " AND ".join(filters)

            cur.execute(query, params)
            summary_row = cur.fetchone()

            present_count = summary_row['present_count'] if summary_row['present_count'] is not None else 0
            absent_count = summary_row['absent_count'] if summary_row['absent_count'] is not None else 0
            total_students_with_records = summary_row['total_students_with_records'] if summary_row['total_students_with_records'] is not None else 0

            return jsonify({
                'total_students_registered': total_students_registered,
                'total_students_with_attendance_records': total_students_with_records,
                'present_count': present_count,
                'absent_count': absent_count,
                'date': date if date else 'All Dates',
                'grade': grade if grade else 'All Grades'
            })
    except sqlite3.Error as e:
        print(f"Database error during get_attendance_summary: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during get_attendance_summary: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/attendance/summary/students', methods=['GET'])
def get_attendance_summary_per_student():
    grade = request.args.get('grade', None)
    query = """
        SELECT s.id as student_id, s.name, s.grade,
            SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
            SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_count
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id
        WHERE (:grade IS NULL OR s.grade = :grade)
        GROUP BY s.id, s.name, s.grade
        ORDER BY s.name
    """
    with closing(sqlite3.connect(DATABASE)) as conn:
        conn.row_factory = sqlite3.Row
        with conn:
            cur = conn.execute(query, {"grade": grade})
            result = [dict(row) for row in cur.fetchall()]
            return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
