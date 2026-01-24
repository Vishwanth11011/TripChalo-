Here is a professional, ready-to-use **README.md** file for your **TripChalo** project.

You can copy this directly into a file named `README.md` in the root of your GitHub repository.

---

# 🌍 TripChalo! - AI-Powered Group Trip Planner

**TripChalo** is a full-stack web application designed to solve the chaos of group travel planning. It allows friends to join a trip, vote on budgets and dates, and uses **Generative AI (Google Gemini)** to create two distinct, conflict-free itinerary options: a "Crowd Pleaser" and an "Underrated Wildcard."

## 🚀 Features

* **Group Management:** Create trips, generate unique join codes, and manage participants.
* **Democratic Planning:** Users vote on their preferred budget, dates, and "vibe" (Adventure, Chill, Party, etc.).
* **Live Dashboard:** Real-time charts and stats showing the group's voting consensus.
* **AI Itinerary Generation:** Uses Google Gemini to analyze group data and generate detailed day-by-day plans.
* **Smart Chatbot:** Context-aware AI assistant that answers questions about the confirmed trip (e.g., "What is the plan for Day 2?").
* **Secure Authentication:** User signup/login with JWT-based security.

## 🛠️ Tech Stack

### **Frontend**

* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS (Glassmorphism UI)
* **Icons:** Lucide React
* **Charts:** Recharts
* **HTTP Client:** Axios

### **Backend**

* **Framework:** FastAPI (Python)
* **Database:** SQLite (Dev) / PostgreSQL (Prod)
* **ORM:** SQLAlchemy
* **AI Engine:** Google Gemini API (`gemini-1.5-flash`)
* **Validation:** Pydantic & Email-Validator

---

## 🏗️ Project Structure

```bash
TripChalo/
├── backend/             # FastAPI Backend
│   ├── main.py          # Entry point & API Routes
│   ├── models.py        # Database Tables
│   ├── schemas.py       # Pydantic Models
│   ├── database.py      # DB Connection
│   ├── recommendation_service.py # AI Logic
│   └── requirements.txt # Python Dependencies
│
├── frontend/            # React Frontend
│   ├── src/
│   │   ├── components/  # Navbar, AuthModal, Charts
│   │   ├── pages/       # CreateTrip, JoinTrip, Dashboard, Itinerary
│   └── package.json     # JS Dependencies
│
└── README.md

```

---

## ⚡ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/tripchalo.git
cd tripchalo

```

### 2. Backend Setup

Navigate to the backend folder and set up the Python environment.

```bash
cd backend

# Create virtual environment (Mac/Linux)
python3 -m venv venv
source venv/bin/activate

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

```

**Configure Environment Variables:**
Create a `.env` file inside the `backend/` folder (or set system variables):

```env
GEMINI_API_KEY=your_actual_google_api_key_here
SECRET_KEY=your_random_secret_string

```

**Run the Server:**

```bash
uvicorn main:app --reload
# Backend will run at: http://localhost:8000

```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend folder.

```bash
cd frontend

# Install dependencies
npm install

# Run the frontend
npm run dev
# Frontend will run at: http://localhost:5173

```

---

## 🚀 Deployment Guide

### **Backend (Render)**

1. Create a **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repo.
3. **Root Directory:** `backend`
4. **Build Command:** `pip install -r requirements.txt`
5. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
6. **Environment Variables:** Add `GEMINI_API_KEY`.

### **Frontend (Vercel)**

1. Import your repo to [Vercel](https://vercel.com/).
2. **Root Directory:** `frontend`
3. **Environment Variables:** Add `VITE_API_URL` with your Render backend URL (e.g., `https://tripchalo-backend.onrender.com`).

---

## 📸 Screenshots

*(You can upload screenshots to your repo and link them here later)*

| Dashboard | Itinerary Voting |
| --- | --- |
| *Stats and Graphs* | *AI Generated Plans* |

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.