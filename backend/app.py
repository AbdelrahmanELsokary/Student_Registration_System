from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# تكوين قاعدة البيانات
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'school.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# نموذج الطالب
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    level = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))

    def __repr__(self):
        return f'<Student {self.name}>'

# إنشاء الجداول
@app.before_first_request
def create_tables():
    db.create_all()

# API Routes
@app.route('/students', methods=['POST'])
def add_student():
    data = request.json
    
    new_student = Student(
        name=data['name'],
        level=data['level'],
        phone=data.get('phone')
    )
    
    db.session.add(new_student)
    db.session.commit()
    
    return jsonify({"message": "تمت إضافة الطالب بنجاح"}), 201

@app.route('/students', methods=['GET'])
def get_students():
    students = Student.query.all()
    output = []
    for student in students:
        student_data = {
            'id': student.id,
            'name': student.name,
            'level': student.level,
            'phone': student.phone
        }
        output.append(student_data)
    
    return jsonify({'students': output})

if __name__ == '__main__':
    app.run(debug=True)