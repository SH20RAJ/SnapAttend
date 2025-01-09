# SnapAttend

SnapAttend is an AI-powered smart attendance system that leverages facial recognition technology to automate attendance tracking. By simply uploading a photo (or multiple photos) of a classroom, SnapAttend identifies students and marks their attendance with high accuracy.

## Features

- **Face Recognition**: Automatically detect and identify students from a photo.
- **Batch Processing**: Supports single or multiple photos for larger classes.
- **Real-time Attendance**: Option to integrate with webcams for live attendance.
- **User-Friendly Dashboard**: Upload photos, view attendance reports, and export data.
- **Customizable**: Add, update, or delete student profiles easily.
- **Offline/Online Support**: Works offline with pre-stored data or online with cloud-based storage.

---

## How It Works

1. **Student Registration**: Capture and register student photos. The system generates and stores unique face embeddings for each student.
2. **Photo Upload**: Teachers upload class photos to the system.
3. **Face Detection & Recognition**: SnapAttend detects faces in the photos and matches them against the stored embeddings.
4. **Attendance Marking**: The system marks students as "Present" or "Absent" based on the match results.
5. **Export Reports**: Export attendance data in CSV or PDF format for record-keeping.

---

## Tech Stack

- **Frontend**: React.js / React Native for the user interface.
- **Backend**: Flask/Django/FastAPI for API development.
- **Database**: MongoDB/MySQL/PostgreSQL for storing student data.
- **Facial Recognition**: `face_recognition`, OpenCV, TensorFlow.
- **Other Tools**: NumPy, Pandas for data processing.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/snapattend.git
   cd snapattend

2. Install the required dependencies:

pip install -r requirements.txt


3. Set up the database:

Create a database and configure it in the .env file.



4. Run the application:

python app.py


5. Access the app at:

For web: http://localhost:5000

For mobile: Open the React Native app in your emulator.





---

Usage

1. Register students:

Upload individual photos of students.

Enter their names and roll numbers.

The system will save their face embeddings.



2. Upload class photos:

Teachers can upload a photo of the entire classroom.

For larger classes, upload multiple photos from different angles.



3. Generate attendance:

The system will process the photo(s) and identify students.

View attendance records on the dashboard or export them.





---

Future Enhancements

Multi-Class Support: Add attendance for multiple classes in a single session.

Advanced Reporting: Generate detailed analytics like attendance trends and summaries.

Mobile App: A dedicated app for teachers to capture photos and manage attendance on the go.

Integration: Sync with Learning Management Systems (LMS) for seamless attendance tracking.



---

Contributing

Contributions are welcome! Follow these steps to contribute:

1. Fork the repository.


2. Create a new branch:

git checkout -b feature-name


3. Commit your changes:

git commit -m "Added new feature"


4. Push to the branch:

git push origin feature-name


5. Open a pull request.




---

License

This project is licensed under the MIT License. See the LICENSE file for more details.


---

Contact

Author: Shaswat Raj

Email: sh20raj@gmail.com

GitHub: @sh20raj

Portfolio: shaswat.live



---

Screenshots (Optional)

Add screenshots of the app for better understanding.


---

Acknowledgements

Inspired by the need to simplify attendance tracking in classrooms.

Special thanks to the developers and contributors of the libraries and frameworks used.


---

### Why "SnapAttend"?  
The name is catchy, simple, and impactful. It conveys the idea of snapping a photo (Snap) to take attendance (Attend). It's modern, intuitive, and aligns with the functionality of the system.
