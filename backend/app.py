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

def init_db():
    with closing(get_db()) as conn:
        with conn:
            cursor = conn.cursor()

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    grade TEXT NOT NULL,
                    guardian_phone TEXT,
                    fees_paid INTEGER NOT NULL DEFAULT 0
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS attendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL,
                    date TEXT NOT NULL,
                    status TEXT NOT NULL,
                    daily_recitation_score INTEGER DEFAULT NULL,
                    test_score INTEGER DEFAULT NULL,
                    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
                    UNIQUE(student_id, date)
                )
            ''')

            cursor.execute("PRAGMA table_info(attendance);")
            columns = [col[1] for col in cursor.fetchall()]

            if 'daily_recitation_score' not in columns:
                print("جاري إضافة عمود 'daily_recitation_score' إلى جدول 'attendance'...")
                cursor.execute("ALTER TABLE attendance ADD COLUMN daily_recitation_score INTEGER DEFAULT NULL;")
                print("✅ تم إضافة عمود 'daily_recitation_score' بنجاح.")
            else:
                print("عمود 'daily_recitation_score' موجود بالفعل.")

            if 'test_score' not in columns:
                print("جاري إضافة عمود 'test_score' إلى جدول 'attendance'...")
                cursor.execute("ALTER TABLE attendance ADD COLUMN test_score INTEGER DEFAULT NULL;")
                print("✅ تم إضافة عمود 'test_score' بنجاح.")
            else:
                print("عمود 'test_score' موجود بالفعل.")

            if 'notes' in columns:
                print("جاري إزالة عمود 'notes' من جدول 'attendance' (مع الحفاظ على البيانات)...")

                cursor.execute("DROP TABLE IF EXISTS attendance_temp;")

                cursor.execute('''
                    CREATE TABLE attendance_temp (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        student_id INTEGER NOT NULL,
                        date TEXT NOT NULL,
                        status TEXT NOT NULL,
                        daily_recitation_score INTEGER DEFAULT NULL,
                        test_score INTEGER DEFAULT NULL,
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                        UNIQUE(student_id, date)
                    )
                ''')

                cursor.execute('''
                    INSERT INTO attendance_temp (id, student_id, date, status, daily_recitation_score, test_score)
                    SELECT id, student_id, date, status, daily_recitation_score, test_score FROM attendance;
                ''')

                cursor.execute("DROP TABLE attendance;")

                cursor.execute("ALTER TABLE attendance_temp RENAME TO attendance;")
                print("✅ تم إزالة عمود 'notes' وتحديث جدول 'attendance' بنجاح، مع الحفاظ على البيانات.")
            else:
                print("عمود 'notes' غير موجود في جدول 'attendance'. لا حاجة للإزالة.")

            conn.commit()
            print("✅ تم إنشاء/تحديث قاعدة البيانات والجداول بنجاح.")

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
    daily_recitation_score = data.get('daily_recitation_score')
    test_score = data.get('test_score')

    if status not in ['present', 'absent']:
        return jsonify({'error': 'Invalid status. Must be "present" or "absent"'}), 400

    try:
        with closing(get_db()) as conn:
            cur = conn.cursor()
            cur.execute('DELETE FROM attendance WHERE student_id = ? AND date = ?', (student_id, date))
            cur.execute('''
                INSERT INTO attendance (student_id, date, status, daily_recitation_score, test_score)
                VALUES (?, ?, ?, ?, ?)
            ''', (student_id, date, status, daily_recitation_score, test_score))
            conn.commit()
            return jsonify({'message': 'Attendance marked successfully'})
    except sqlite3.Error as e:
        print(f"Database error during mark_attendance: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during mark_attendance: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/students/<int:student_id>/scores', methods=['PUT'])
def update_student_scores(student_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON data'}), 400

    date = data.get('date')
    if not date:
        return jsonify({'error': 'Date is required to update scores'}), 400

    daily_recitation_score = data.get('daily_recitation_score')
    test_score = data.get('test_score')

    if daily_recitation_score is not None and not isinstance(daily_recitation_score, (int, float)):
        return jsonify({'error': 'daily_recitation_score must be a number'}), 400
    if test_score is not None and not isinstance(test_score, (int, float)):
        return jsonify({'error': 'test_score must be a number'}), 400

    try:
        with closing(get_db()) as conn:
            cur = conn.cursor()
            cur.execute('''
                UPDATE attendance
                SET daily_recitation_score = ?, test_score = ?
                WHERE student_id = ? AND date = ?
            ''', (daily_recitation_score, test_score, student_id, date))
            conn.commit()

            if cur.rowcount == 0:
                return jsonify({'message': 'Attendance record not found for student on this date or no changes made'}), 404
            return jsonify({'message': 'Student scores updated successfully'})
    except sqlite3.Error as e:
        print(f"Database error during update_student_scores: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during update_student_scores: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/student/<int:student_id>/attendance-records', methods=['GET'])
def get_student_attendance_records(student_id):
    try:
        with closing(get_db()) as conn:
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()

            query = '''
                SELECT
                    a.id,
                    a.date,
                    a.status,
                    a.daily_recitation_score,
                    a.test_score
                FROM attendance a
                WHERE a.student_id = ?
                ORDER BY a.date DESC
            '''
            cur.execute(query, (student_id,))
            attendance_records = [dict(row) for row in cur.fetchall()]
            
            if not attendance_records:
                cur.execute('SELECT id FROM students WHERE id = ?', (student_id,))
                if cur.fetchone() is None:
                    return jsonify({'error': 'Student not found'}), 404
                else:
                    return jsonify([]), 200 

            return jsonify(attendance_records)
    except sqlite3.Error as e:
        print(f"Database error during get_student_attendance_records: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during get_student_attendance_records: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/student/<int:student_id>/attendance-summary', methods=['GET'])
def get_single_student_attendance_summary(student_id):
    try:
        with closing(get_db()) as conn:
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()

            query = '''
                SELECT
                    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
                    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
                    AVG(a.daily_recitation_score) AS avg_recitation,
                    AVG(a.test_score) AS avg_test
                FROM attendance a
                WHERE a.student_id = ?
            '''
            cur.execute(query, (student_id,))
            summary_data = cur.fetchone()

            if summary_data and (summary_data['present_count'] is not None or summary_data['absent_count'] is not None):
                return jsonify(dict(summary_data))
            else:

                cur.execute('SELECT id FROM students WHERE id = ?', (student_id,))
                if cur.fetchone() is None:
                    return jsonify({'error': 'Student not found'}), 404
                else:
                    return jsonify({
                        'present_count': 0,
                        'absent_count': 0,
                        'avg_recitation': None,
                        'avg_test': None
                    }), 200

    except sqlite3.Error as e:
        print(f"Database error during get_single_student_attendance_summary: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during get_single_student_attendance_summary: {e}")
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
                    a.status,
                    a.daily_recitation_score, -- عمود جديد
                    a.test_score              -- عمود جديد
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
            
            base_query += " ORDER BY s.name" 

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
    try:
        with closing(sqlite3.connect(DATABASE)) as conn:
            conn.row_factory = sqlite3.Row
            with conn:
                cur = conn.execute(query, {"grade": grade})
                result = [dict(row) for row in cur.fetchall()]
                return jsonify(result)
    except sqlite3.Error as e:
        print(f"Database error during get_attendance_summary_per_student: {e}")
        return jsonify({'error': 'Database operation failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred during get_attendance_summary_per_student: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/students/<int:student_id>/scores', methods=['PUT'])
def save_student_scores(student_id):
    data = request.get_json()
    date = data.get('date')
    recitation_score = data.get('daily_recitation_score')
    test_score = data.get('test_score')

    if not date:
        return jsonify({'error': 'Date is required'}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT id FROM attendance
            WHERE student_id = ? AND date = ?
        ''', (student_id, date))
        existing = cursor.fetchone()

        if existing:
            cursor.execute('''
                UPDATE attendance
                SET daily_recitation_score = ?, test_score = ?
                WHERE student_id = ? AND date = ?
            ''', (recitation_score, test_score, student_id, date))
        else:
            cursor.execute('''
                INSERT INTO attendance (student_id, date, status, daily_recitation_score, test_score)
                VALUES (?, ?, ?, ?, ?)
            ''', (student_id, date, 'present', recitation_score, test_score))

        conn.commit()
        conn.close()
        return jsonify({'message': 'Scores saved successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':

    init_db() 
    app.run(debug=True, host='127.0.0.1', port=5000)
