import sqlite3

def update_db():
    with sqlite3.connect("students.db") as conn:
        cursor = conn.cursor()

        # إنشاء جدول الحضور فقط
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')

        conn.commit()
        print("✅ تم تحديث قاعدة البيانات وإضافة جدول الحضور.")

if __name__ == "__main__":
    update_db()
