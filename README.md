# 🪖 Military Asset Management System

A full-stack web application for managing military assets (vehicles, weapons, ammunition) across multiple army bases. Built with Node.js, Express, MongoDB Atlas, React, Vite, and Tailwind CSS.

## 🔗 Project Links

- **Live Demo Video:** [Watch on Google Drive](https://drive.google.com/file/d/1olQGA-in64gu4YecJ8DilxRGe8jx0ab_/view)
- **Live Website (Frontend):** [Vercel App](https://military-asset-management-system-phi-one.vercel.app)
- **API (Backend):** [Render App](https://military-asset-management-system-9dlr.onrender.com)
- **GitHub Repository:** [military_asset_management-_system](https://github.com/PrabhavRathi06/military_asset_management-_system)

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@military.com | Admin@123 |
| **Base Commander** | commander@military.com | Commander@123 |
| **Logistics Officer** | logistics@military.com | Logistics@123 |

---

## 📋 Features

- **Dashboard** — Opening Balance, Closing Balance, Net Movement (clickable popup), Assigned, Expended with date/base/type filters
- **Purchases** — Record asset purchases, auto-updates inventory stock
- **Transfers** — Move assets between bases with stock validation
- **Assignments** — Issue assets to personnel / units
- **Expenditures** — Record assets used, damaged, destroyed, expired, or lost
- **Audit Logs** — Full activity trail (Admin only)
- **Admin Panel** — Manage users, bases, and asset types (Admin only)

### Role-Based Access Control (RBAC)

| Feature | Admin | Base Commander | Logistics Officer |
|---|:---:|:---:|:---:|
| Dashboard (all bases) | ✅ | ❌ (own base) | ❌ (own base) |
| Purchases | ✅ | ✅ | ✅ |
| Transfers | ✅ | ✅ | ✅ |
| Assignments & Expenditures | ✅ | ✅ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ |
| Admin Panel | ✅ | ❌ | ❌ |

---

## 📸 Screenshots

### Login & Dashboard
![Login Page](./images/01-login.png)
![Admin Dashboard](./images/02-dashboard-admin.png)
![Net Movement Breakdown](./images/10-net-movement-breakdown.png)

### Core Modules
![Purchases](./images/03-purchases.png)
![Transfers](./images/04-transfers.png)
![Assignments](./images/05-assignments.png)
![Audit Logs](./images/06-audit-logs.png)

### Admin Panel
![Manage Users](./images/07-admin-users.png)
![Manage Bases](./images/08-admin-bases.png)
![Manage Asset Types](./images/09-admin-asset-types.png)

### Role-Based Views
![Base Commander Dashboard](./images/11-dashboard-commander.png)
![Logistics Officer Dashboard](./images/12-dashboard-logistics.png)

### Database (MongoDB Atlas)
![MongoDB Atlas Database](./images/13-mongodb-atlas.png)

---

## 🗂️ Project Structure

```
military_asset_management_system/
├── backend/                  # Node.js + Express API
│   ├── config/
│   │   └── db.js             # MongoDB Atlas connection
│   ├── controllers/          # Route logic
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── dashboardController.js
│   │   ├── purchaseController.js
│   │   ├── transferController.js
│   │   ├── assignmentController.js
│   │   ├── expenditureController.js
│   │   └── auditLogController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   └── rbac.js           # Role-based authorization
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Base.js
│   │   ├── Asset.js
│   │   ├── Inventory.js
│   │   ├── Purchase.js
│   │   ├── Transfer.js
│   │   ├── Assignment.js
│   │   ├── Expenditure.js
│   │   └── AuditLog.js
│   ├── routes/               # Express routers
│   ├── utils/
│   │   ├── auditLogger.js    # Audit log helper
│   │   └── seed.js           # Database seeding script
│   ├── .env                  # Environment variables (not in git)
│   ├── .env.example          # Environment template
│   ├── package.json
│   └── server.js             # App entry point
│
└── frontend/                 # React + Vite + Tailwind
    ├── src/
    │   ├── api/              # Axios API call helpers
    │   ├── components/       # Layout, ProtectedRoute
    │   ├── context/          # AuthContext (JWT storage)
    │   └── pages/            # One file per page/feature
    ├── .env                  # Environment variables (not in git)
    ├── .env.example          # Environment template
    ├── vercel.json           # Vercel SPA routing fix
    └── vite.config.js
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- npm
- MongoDB Atlas account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/PrabhavRathi06/military_asset_management-_system.git
cd "military_asset_management _system"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:
```bash
copy .env.example .env
```

Edit `backend/.env` with your values:
```
MONGO_URI=mongodb+srv://your_user:your_password@cluster0.xxxxx.mongodb.net/?appName=Cluster0
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Seed the database with demo data:
```bash
node utils/seed.js
```

Start the backend server:
```bash
npm run dev
```
Backend runs on → `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create your `.env` file:
```bash
copy .env.example .env
```

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```
Frontend runs on → `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login and get JWT |
| POST | `/api/auth/register` | Public | Register new user |
| GET | `/api/auth/me` | All | Get logged-in user |
| GET | `/api/dashboard` | All | Get KPI metrics |
| GET/POST | `/api/purchases` | All | List / create purchases |
| GET/POST | `/api/transfers` | All | List / create transfers |
| GET/POST | `/api/assignments` | Admin, Commander | List / create assignments |
| GET/POST | `/api/expenditures` | Admin, Commander | List / create expenditures |
| GET | `/api/audit-logs` | Admin | View full audit trail |
| GET/POST | `/api/admin/users` | Admin | Manage users |
| GET/POST | `/api/admin/bases` | Admin | Manage bases |
| GET/POST | `/api/admin/assets` | Admin | Manage asset types |

---

## 🧱 Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas + Mongoose |
| **Authentication** | JWT (JSON Web Tokens) |
| **Frontend** | React 18, Vite |
| **Styling** | Tailwind CSS |
| **HTTP Client** | Axios |
| **Notifications** | react-hot-toast |
| **Icons** | lucide-react |
| **Deployment** | Render (backend) + Vercel (frontend) |

---

## 🔒 Security Notes

- Passwords are hashed using **bcryptjs** (salt rounds: 10)
- JWT tokens are stored in **localStorage** and attached via Axios interceptors
- Route protection is enforced at **both** frontend (ProtectedRoute) and backend (middleware)
- `.env` files are in `.gitignore` — never committed to GitHub

---

## 👨‍💻 Author

**Prabhav Rathi** — [GitHub](https://github.com/PrabhavRathi06)
