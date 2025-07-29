import sqlite3

def init_db():
    # الاتصال بقاعدة البيانات (هيتم إنشائها تلقائيًا لو مش موجودة)
    with sqlite3.connect("students.db") as conn:
        cursor = conn.cursor()

        # إنشاء جدول الطلاب (بدون تغيير)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                grade TEXT NOT NULL,
                guardian_phone TEXT NOT NULL,
                fees_paid BOOLEAN NOT NULL
            )
        ''')

        # --- خطوات قوية لإزالة عمود 'notes' مع الحفاظ على البيانات ---

        # التحقق إذا كان عمود 'notes' موجود في جدول 'attendance'
        cursor.execute("PRAGMA table_info(attendance);")
        columns = [col[1] for col in cursor.fetchall()]

        if 'notes' in columns:
            print("جاري إزالة عمود 'notes' من جدول 'attendance' (مع الحفاظ على البيانات)...")

            # حذف الجدول المؤقت لو كان موجودًا من تشغيل سابق فاشل
            cursor.execute("DROP TABLE IF EXISTS attendance_new;")

            # 1. إنشاء جدول مؤقت جديد للـ attendance بدون عمود 'notes'
            cursor.execute('''
                CREATE TABLE attendance_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL,
                    date TEXT NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
                    FOREIGN KEY (student_id) REFERENCES students(id)
                )
            ''')

            # 2. نسخ البيانات من جدول الـ attendance القديم للجدول الجديد
            cursor.execute('''
                INSERT INTO attendance_new (id, student_id, date, status)
                SELECT id, student_id, date, status FROM attendance;
            ''')

            # 3. حذف جدول الـ attendance القديم
            cursor.execute("DROP TABLE attendance;")

            # 4. إعادة تسمية الجدول الجديد ليصبح attendance
            cursor.execute("ALTER TABLE attendance_new RENAME TO attendance;")
            print("✅ تم إزالة عمود 'notes' وتحديث جدول 'attendance' بنجاح، مع الحفاظ على البيانات.")
        else:
            # لو عمود 'notes' مش موجود بالفعل، نتأكد إن جدول الـ attendance تم إنشائه
            # بالهيكل المطلوب (بدون 'notes')
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS attendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL,
                    date TEXT NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
                    FOREIGN KEY (student_id) REFERENCES students(id)
                )
            ''')
            print("✅ جدول 'attendance' لا يحتوي على عمود 'notes' بالفعل أو تم إنشاؤه بدونه.")

        conn.commit()
        print("✅ تم إنشاء/تحديث قاعدة البيانات والجداول بنجاح.")

# دالة للتحقق من هيكل الجدول بعد التعديل
def check_table_schema():
    with sqlite3.connect("students.db") as conn:
        cursor = conn.cursor()
        print("\n--- هيكل جدول Attendance الحالي ---")
        cursor.execute("PRAGMA table_info(attendance);")
        for col in cursor.fetchall():
            print(f"اسم العمود: {col[1]}, النوع: {col[2]}")
        print("---------------------------------------")

if __name__ == "__main__":
    init_db() # شغل الدالة اللي بتعدل قاعدة البيانات
    check_table_schema() # ثم شغل الدالة اللي بتعرض هيكل الجدول عشان تتأكد
