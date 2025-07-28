import sqlite3

def init_db():
    # الاتصال بقاعدة البيانات (ستُنشأ تلقائيًا إذا لم تكن موجودة)
    with sqlite3.connect("students.db") as conn:
        cursor = conn.cursor()

        # إنشاء جدول الطلاب
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                grade TEXT NOT NULL,
                guardian_phone TEXT NOT NULL,
                fees_paid BOOLEAN NOT NULL
            )
        ''')

        # إنشاء جدول الحضور
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
        print("✅ تم إنشاء قاعدة البيانات والجداول بنجاح.")

if __name__ == "__main__":
    init_db()
