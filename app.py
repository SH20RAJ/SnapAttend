from flask import Flask, request, jsonify, render_template, send_file
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import face_recognition
import cv2
import numpy as np
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///snapattend.db'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

db = SQLAlchemy(app)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'students'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'class_photos'), exist_ok=True)

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    roll_number = db.Column(db.String(20), unique=True, nullable=False)
    face_encoding = db.Column(db.PickleType)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg'}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/students', methods=['POST'])
def register_student():
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo provided'}), 400
    
    photo = request.files['photo']
    name = request.form.get('name')
    roll_number = request.form.get('roll_number')
    
    if not all([photo, name, roll_number]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if not allowed_file(photo.filename):
        return jsonify({'error': 'Invalid file type'}), 400
    
    try:
        # Save photo
        filename = secure_filename(f"{roll_number}_{photo.filename}")
        photo_path = os.path.join(app.config['UPLOAD_FOLDER'], 'students', filename)
        photo.save(photo_path)
        
        # Generate face encoding
        image = face_recognition.load_image_file(photo_path)
        face_encodings = face_recognition.face_encodings(image)
        
        if not face_encodings:
            os.remove(photo_path)
            return jsonify({'error': 'No face detected in the photo'}), 400
        
        # Create student record
        student = Student(
            name=name,
            roll_number=roll_number,
            face_encoding=face_encodings[0]
        )
        db.session.add(student)
        db.session.commit()
        
        return jsonify({
            'message': 'Student registered successfully',
            'student_id': student.id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance', methods=['POST'])
def mark_attendance():
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo provided'}), 400
    
    photo = request.files['photo']
    if not allowed_file(photo.filename):
        return jsonify({'error': 'Invalid file type'}), 400
    
    try:
        # Save class photo
        filename = secure_filename(f"class_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{photo.filename}")
        photo_path = os.path.join(app.config['UPLOAD_FOLDER'], 'class_photos', filename)
        photo.save(photo_path)
        
        # Load class photo and detect faces
        image = face_recognition.load_image_file(photo_path)
        face_locations = face_recognition.face_locations(image)
        face_encodings = face_recognition.face_encodings(image, face_locations)
        
        # Get all students
        students = Student.query.all()
        known_face_encodings = [student.face_encoding for student in students]
        
        # Mark attendance
        attendance_date = datetime.now().date()
        attendance_records = []
        
        for student in students:
            is_present = False
            for face_encoding in face_encodings:
                matches = face_recognition.compare_faces([student.face_encoding], face_encoding)
                if True in matches:
                    is_present = True
                    break
            
            attendance = Attendance(
                student_id=student.id,
                date=attendance_date,
                status=is_present
            )
            attendance_records.append(attendance)
        
        db.session.bulk_save_objects(attendance_records)
        db.session.commit()
        
        return jsonify({
            'message': 'Attendance marked successfully',
            'present_count': sum(1 for record in attendance_records if record.status),
            'total_count': len(attendance_records)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance/report', methods=['GET'])
def get_attendance_report():
    date = request.args.get('date', datetime.now().date().isoformat())
    
    try:
        attendance_records = db.session.query(
            Student.name,
            Student.roll_number,
            Attendance.status,
            Attendance.created_at
        ).join(
            Attendance,
            Student.id == Attendance.student_id
        ).filter(
            Attendance.date == date
        ).all()
        
        report = [{
            'name': record.name,
            'roll_number': record.roll_number,
            'status': 'Present' if record.status else 'Absent',
            'timestamp': record.created_at.isoformat()
        } for record in attendance_records]
        
        return jsonify(report), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
