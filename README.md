# Municipal Complaint Registration Portal
> **"Your Voice, Our Responsibility"**  
> *A Modern Civic Grievance Management and Tracking System designed for College Project Demonstrations.*

---

## 📌 1. Project Overview

The **Municipal Complaint Registration Portal** is a full-stack web application that allows citizens to report civic problems directly to municipal authorities and track their resolution in real time.

Citizens can report problems across six core civic categories:
1. **Damaged roads and potholes**
2. **Garbage collection problems**
3. **Water supply issues**
4. **Streetlight failures**
5. **Drainage and sewage problems**
6. **Public sanitation issues**

Municipal administrators can log into a dedicated administration portal to inspect incoming grievances, filter complaints by ward or category, review citizen details, and update complaint stages with official administrative remarks.

> **ACADEMIC NOTICE:** This portal is an educational demonstration project. It is self-contained and does NOT connect to any actual government department.

---

## ✨ 2. Key Features

### Citizen Portal:
- **Interactive Landing Page**: Modern government aesthetic with live statistics fetched directly from the SQLite database.
- **Civic Complaint Registration**: Real-time form validation (10-digit mobile number, required fields, title/description minimum length).
- **Unique Tracking ID Generator**: Generates codes in the format `MCR-YYYY-XXXXXX` (e.g., `MCR-2026-881204`).
- **Interactive Progress Timeline**:
  - `Submitted` → `Under Review` → `In Progress` → `Resolved`
  - Special disposition flow for `Rejected` complaints with official rejection explanations.
- **Privacy Protection**: Citizens' mobile numbers and email addresses are masked/hidden in public tracking queries.
- **City Transparency Dashboard**: Real-time resolution metrics, category distributions, and ward breakdown.

### Administrator Console:
- **Secure Authentication**: Hashed administrator passwords using `bcrypt` and session cookie authentication via `express-session`.
- **Administrative Dashboard**: Real-time metrics (Total, Pending, In Progress, Resolved, Rejected).
- **Complaint Management Table**:
  - Full-text search by Tracking ID, Citizen Name, Title, and Locality.
  - Category and Status filtering.
- **Status Update & Audit History**:
  - Update complaint status to `Pending`, `In Progress`, `Resolved`, or `Rejected`.
  - Record mandatory official remarks.
  - Automatically appends to the `complaint_status_history` audit table with timestamps.

---

## 🛠️ 3. Technology Stack

- **Frontend**:
  - React.js (v18)
  - Vite (v5)
  - JavaScript (ES6+)
  - React Router DOM (v6)
  - Lucide React (Icons)
  - Plain CSS (Modern Government Theme with responsive design)
  - Axios (API Client)

- **Backend**:
  - Node.js (v18+)
  - Express.js (v4 REST API)
  - `better-sqlite3` (High-performance synchronous SQLite engine)
  - `bcryptjs` (Password hashing)
  - `express-session` (Session management)
  - `cors` & `dotenv`

- **Database**:
  - SQLite 3 (Stored locally at `server/database/municipal.sqlite`)
  - Foreign key enforcement enabled (`PRAGMA foreign_keys = ON;`)
  - WAL mode enabled (`PRAGMA journal_mode = WAL;`)

---

## 📂 4. Project Structure

```
municipal-complaint-portal/
│
├── client/
│   ├── src/
│   │   ├── assets/              # Static icons and assets
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Header with demo indicator
│   │   │   ├── Footer.jsx       # Footer with disclaimer
│   │   │   ├── StatusBadge.jsx  # Reusable status badges
│   │   │   └── Timeline.jsx     # Visual progress timeline
│   │   ├── pages/
│   │   │   ├── HomePage.jsx               # Citizen landing page
│   │   │   ├── RegisterComplaintPage.jsx  # Complaint registration form
│   │   │   ├── TrackComplaintPage.jsx     # Tracking with progress timeline
│   │   │   ├── DashboardPage.jsx          # Public transparency dashboard
│   │   │   ├── AdminLoginPage.jsx         # Administrator login
│   │   │   └── AdminDashboardPage.jsx     # Protected admin management
│   │   ├── services/
│   │   │   └── api.js           # Axios REST API client
│   │   ├── App.jsx              # Application router
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Professional Government Theme CSS
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── database/
│   │   ├── db.js                # SQLite connection and pragma configuration
│   │   └── municipal.sqlite     # Persistent SQLite database file
│   ├── middleware/
│   │   └── auth.js              # Administrator session guard
│   ├── routes/
│   │   ├── complaints.js        # Public citizen complaint endpoints
│   │   └── admin.js             # Protected administrator endpoints
│   ├── scripts/
│   │   └── init-db.js           # Database creation and sample seed script
│   ├── app.js                   # Express application setup
│   ├── server.js                # HTTP server launcher
│   ├── .env                     # Local environment variables
│   ├── .env.example
│   └── package.json
│
├── start.bat                    # One-click Windows startup script
├── stop.bat                     # Safe Windows shutdown script
├── build.bat                    # Production React build script
└── README.md                    # Project documentation
```

---

## 💻 5. System Requirements

- **Operating System**: Windows 10, Windows 11, or Windows Server
- **Required Software**:
  - **Node.js**: Version 18.0.0 or newer (Recommended: Node.js 20 or 22 LTS).
    - Download from: https://nodejs.org/
  - **Web Browser**: Google Chrome, Microsoft Edge, Firefox, or Brave.

---

## 🚀 6. How to Run the Application (Completely Independent of Antigravity)

### Option A: The One-Click Windows Method (Recommended)

1. Open Windows File Explorer and navigate to the project directory:
   `C:\dileep\PROJECT\municipal-complaint-portal` (or `C:\dileep\PROJECT`)
2. Double-click **`start.bat`**.
3. The script will automatically:
   - Check your Node.js installation.
   - Install any missing dependencies.
   - Initialize the SQLite database and seed 8 realistic demonstration complaints.
   - Build the frontend if not already built.
   - Start the Express server on port 5000.
   - Open `http://localhost:5000` in your default browser.
4. When finished, double-click **`stop.bat`** to safely shut down the portal.

---

### Option B: Using Windows PowerShell or Command Prompt

#### Step 1: Open Terminal
Open PowerShell in the `municipal-complaint-portal` folder:
```powershell
cd C:\dileep\PROJECT\municipal-complaint-portal
```

#### Step 2: Install Dependencies
```powershell
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ..\client
npm install
cd ..
```

#### Step 3: Initialize Database
```powershell
cd server
node scripts\init-db.js
cd ..
```

#### Step 4: Build Frontend & Run Production Server
```powershell
# Build frontend
cd client
npm run build
cd ..

# Start unified server
cd server
node server.js
```

The portal is now running at: **`http://localhost:5000`**

---

## 🔑 7. Demonstration Administrator Credentials

- **Admin Login URL**: `http://localhost:5000/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

*(A handy "Auto-Fill" button is also provided on the login page for effortless live presentation).*

---

## 🧪 8. Sample Demonstration Complaints for Presentation

The database comes pre-seeded with 8 sample complaints covering various statuses and categories. You can test these Tracking IDs directly on the **Track Complaint** page (`http://localhost:5000/track`):

| Tracking ID | Category | Status | Scenario |
|---|---|---|---|
| `MCR-2026-881204` | Road Damage | **Pending** | Deep pothole near Green Valley Park entrance |
| `MCR-2026-749102` | Garbage Collection | **In Progress** | Missed garbage truck pickup in Ward 5 |
| `MCR-2026-612398` | Water Supply | **Resolved** | Low pipeline pressure resolved by Water Board |
| `MCR-2026-559104` | Streetlight Issues | **Pending** | Three streetlights non-operational on Cross Road 6 |
| `MCR-2026-443219` | Drainage | **In Progress** | Stormwater drain clogged with plastic debris |
| `MCR-2026-382941` | Sanitation | **Resolved** | Public toilet sanitization completed |
| `MCR-2026-291045` | Road Damage | **Rejected** | Highway stretch falls under National Highway Authority (NHAI) |
| `MCR-2026-193852` | Garbage Collection | **Pending** | Waste bin overflow near Central Market |

---

## 🛑 9. Stopping the Application

To shut down the application:
1. Double-click **`stop.bat`**.
2. Or in PowerShell, run:
```powershell
.\stop.bat
```
`stop.bat` stops only the processes on port 5000 and 5173, without affecting any other running Node.js applications on your machine.

---

## 💾 10. Data Persistence & SQLite Backup

All submitted grievances and status audit trails are permanently stored in:
`server/database/municipal.sqlite`

### How to Back Up the Database:
To create a backup copy of your SQLite database before a demonstration:

```powershell
Copy-Item -Path "server\database\municipal.sqlite" -Destination "server\database\municipal_backup.sqlite"
```

### How to Restore from Backup:
```powershell
Copy-Item -Path "server\database\municipal_backup.sqlite" -Destination "server\database\municipal.sqlite" -Force
```

### How to Reset to Initial Sample Data:
If you want to clear test data and restore the original 8 sample records:
```powershell
Remove-Item -Path "server\database\municipal.sqlite" -ErrorAction SilentlyContinue
cd server
node scripts\init-db.js
cd ..
```

---

## ❓ 11. Troubleshooting & Common Questions

### Q1: "Port 5000 is already in use"
**Solution**: Run `stop.bat` to release port 5000, or run this PowerShell command:
```powershell
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Q2: "Node is not recognized as an internal or external command"
**Solution**: Node.js is not added to your Windows PATH. Reinstall Node.js from https://nodejs.org/ and check the box **"Add to PATH"**.

### Q3: How do I run in Development mode with Hot Reload?
If you want to modify React components with live reload:
1. Terminal 1 (Backend):
   ```powershell
   cd server
   node server.js
   ```
2. Terminal 2 (Frontend):
   ```powershell
   cd client
   npm run dev
   ```
3. Open `http://localhost:5173`. Vite will proxy all `/api` requests to port 5000.

---

## 📜 12. College Project Presentation Summary

- **Architecture**: Decoupled Model-View-Controller (MVC) REST API architecture with a React Single-Page Application (SPA).
- **Security**: Parameterized SQL queries preventing SQL Injection; bcrypt salt rounds for credential hashing; session cookies with HTTP-only flags preventing XSS token leakage.
- **Privacy Compliance**: Citizen mobile and email are stored for administrative verification but stripped from all public tracking API responses.
- **Reliability**: SQLite Write-Ahead Logging (WAL) ensures zero data corruption on sudden shutdown.
