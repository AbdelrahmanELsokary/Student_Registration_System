import sqlite3

def init_db():
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

        # إنشاء جدول الحضور الأساسي
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
                recitation REAL,
                test REAL,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        ''')

        # التحقق من الأعمدة الحالية
        cursor.execute("PRAGMA table_info(attendance);")
        columns = [col[1] for col in cursor.fetchall()]

        # حذف الأعمدة القديمة إذا كانت موجودة
        changes = False
        if 'daily_recitation_score' in columns or 'daily_test_score' in columns:
            print("⏳ جاري إعادة بناء جدول attendance...")
            cursor.execute("DROP TABLE IF EXISTS attendance_new;")
            cursor.execute('''
                CREATE TABLE attendance_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL,
                    date TEXT NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
                    recitation REAL,
                    test REAL,
                    FOREIGN KEY (student_id) REFERENCES students(id)
                )
            ''')
            fields = ['id', 'student_id', 'date', 'status']
            if 'daily_recitation_score' in columns:
                fields.append('daily_recitation_score')
            if 'daily_test_score' in columns:
                fields.append('daily_test_score')

            cursor.execute(f'''
                INSERT INTO attendance_new (id, student_id, date, status, recitation, test)
                SELECT id, student_id, date, status, daily_recitation_score, daily_test_score
                FROM attendance
            ''')

            cursor.execute("DROP TABLE attendance;")
            cursor.execute("ALTER TABLE attendance_new RENAME TO attendance;")
            print("✅ تم تحديث الأعمدة إلى recitation و test.")
            changes = True

        # تأكيد الأعمدة المطلوبة موجودة
        cursor.execute("PRAGMA table_info(attendance);")
        columns = [col[1] for col in cursor.fetchall()]

        if 'recitation' not in columns:
            cursor.execute("ALTER TABLE attendance ADD COLUMN recitation REAL;")
            print("✅ تم إضافة عمود recitation.")
            changes = True

        if 'test' not in columns:
            cursor.execute("ALTER TABLE attendance ADD COLUMN test REAL;")
            print("✅ تم إضافة عمود test.")
            changes = True

        conn.commit()
        if not changes:
            print("✅ لا توجد تغييرات مطلوبة، قاعدة البيانات جاهزة.")
        else:
            print("✅ تم تهيئة/تحديث قاعدة البيانات بنجاح.")

def check_table_schema():
    with sqlite3.connect("students.db") as conn:
        cursor = conn.cursor()
        print("\n--- هيكل جدول Attendance الحالي ---")
        cursor.execute("PRAGMA table_info(attendance);")
        for col in cursor.fetchall():
            print(f"اسم العمود: {col[1]}, النوع: {col[2]}")
        print("---------------------------------------")

if __name__ == "__main__":
    init_db()
    check_table_schema()
