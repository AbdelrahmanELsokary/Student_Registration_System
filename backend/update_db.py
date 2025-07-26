import sqlite3

# Connect to the database
conn = sqlite3.connect('students.db')
c = conn.cursor()

# Add a new column 'paid' to the 'students' table, if not already exists
try:
    c.execute("ALTER TABLE students ADD COLUMN paid BOOLEAN DEFAULT 0")
    print("✅ Column 'paid' added successfully.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("ℹ️ Column 'paid' already exists.")
    else:
        print("❌ Error:", e)

conn.commit()
conn.close()
