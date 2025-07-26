import sqlite3

def init_db():
    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            grade TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
