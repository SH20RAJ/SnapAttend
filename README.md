# SnapAttend

**SnapAttend** is an AI-powered attendance system that uses facial recognition to mark attendance from a single or multiple classroom photos. By integrating facial recognition directly into a Next.js application, SnapAttend provides a seamless and efficient solution for managing student attendance.

---

## Features

- **Automated Attendance:** Simply upload a photo of the classroom, and SnapAttend will automatically detect students and mark their attendance.
- **Integrated Backend & Frontend:** Built entirely with JavaScript using the Next.js 15 App Router.
- **Student Registration:** Register students with their names, roll numbers, and face embeddings.
- **Fast & Accurate Facial Recognition:** Uses TensorFlow.js and Face-API.js for real-time face detection and recognition.
- **Database Management:** Stores student data and attendance records in MongoDB.
- **Scalable Solution:** Supports multiple photos for large classrooms and scalable deployments.

---

## Tech Stack

- **Frontend & Backend:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Facial Recognition:** [Face-API.js](https://github.com/justadudewhohacks/face-api.js), [TensorFlow.js](https://www.tensorflow.org/js)
- **Database:** [MongoDB](https://www.mongodb.com/)
- **Image Upload Handling:** [Multer](https://github.com/expressjs/multer)

---

## Installation

### Prerequisites
- Node.js (v18 or above)
- MongoDB (Cloud or Local Instance)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/snapattend.git
   cd snapattend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   MONGO_URI=your_mongodb_connection_string
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

### 1. Register Students
- Navigate to `/register` and fill out the form with the student’s name, roll number, and upload their photo.
- The system will store the face embeddings in the database.

### 2. Mark Attendance
- Navigate to `/attendance` and upload a classroom photo.
- The system will process the image, match the faces, and generate the attendance list.

---

## API Endpoints

### **1. Student Registration**
- **Endpoint:** `/api/register`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "rollNumber": "123",
    "file": "<image_file>"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Student registered successfully"
  }
  ```

### **2. Mark Attendance**
- **Endpoint:** `/api/attendance`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "file": "<classroom_photo_file>"
  }
  ```
- **Response:**
  ```json
  [
    { "rollNumber": "123", "name": "John Doe", "present": true },
    { "rollNumber": "124", "name": "Jane Doe", "present": false }
  ]
  ```

---

## Future Enhancements

- **Real-Time Attendance:** Add support for live video feeds.
- **Performance Optimization:** Improve face detection speed for large classrooms.
- **Admin Dashboard:** Provide an interface to view and export attendance reports.
- **Multi-Class Support:** Allow managing multiple classes and sections.

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add a feature"
   ```
4. Push the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

For any inquiries, contact:
- **Name:** Shaswat Raj
- **Email:** sh20raj@gmail.com

---

## Demo

Coming soon...

---
