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

        conn.commit()
        print("✅ تم إنشاء قاعدة البيانات والجدول بنجاح.")

if __name__ == "__main__":
    init_db()
