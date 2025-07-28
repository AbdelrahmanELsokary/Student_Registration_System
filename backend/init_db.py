import sqlite3

DATABASE = 'students.db'

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
        print("Database and 'students' table created successfully.")

# شغل الدالة
init_db()
