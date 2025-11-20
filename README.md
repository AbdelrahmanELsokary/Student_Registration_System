# Student Registration System

A full-stack student management system built with **React (Frontend)** and **Flask (Backend)** using **SQLite** as the database. This system manages students, attendance, grades, summaries, and student details.

---

## 🚀 Features

* Add, edit, and delete students
* Track student attendance (Present / Absent)
* Add memorization & test scores
* Attendance summary per student
* Detailed student profile page
* Export PDF for student details
* Multi-language support (i18n)
* React Router navigation
* Tailwind CSS UI
* SQLite backend with Flask API

---

## 📁 Project Structure

```
Student_Registration_System/
│
├── backend/               # Flask API
│   ├── app.py
│   ├── database.db
│   └── ...
│
├── frontend/              # React App
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## 🔧 Installation & Setup

### 1️⃣ Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend will run on: **[http://localhost:5000](http://localhost:5000)**

---

### 2️⃣ Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: **[http://localhost:5173](http://localhost:5173)**

Make sure both backend and frontend are running.

---

## 🗄️ Database

SQLite database file: `database.db` is automatically created when backend runs.

Tables include:

* **students**
* **attendance**
* **grades**

---

## 🌍 Environment Variables

Create a `.env` file in the backend folder if needed:

```
FLASK_ENV=development
```

---

## 📜 License

MIT License

---

## 📬 Contact

**Developer:** Abdelrahman Elsokarey
**Email:** [abdalrahmanelsokarey@gmail.com](mailto:abdalrahmanelsokarey@gmail.com)

If you have any questions or want new features, feel free to contact me!

---

## ⭐ Contribution

Feel free to fork the repo and submit pull requests.

---

Thanks for using the Student Registration System! 🎓
