# 🪖 Military Asset Management System

A full-stack web application to help military commanders and logistics teams track and manage military equipment across multiple army bases.

## Tech Stack
- **Frontend**: React.js + Tailwind CSS (Vite)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas
- **Auth**: JWT (JSON Web Tokens)

## Project Structure
```
military_asset_management_system/
├── backend/     → Node.js + Express API
└── frontend/    → React.js app
```

## Setup Instructions

### Backend
```bash
cd backend
npm install
# Create a .env file with your MongoDB URI and JWT_SECRET
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Login Credentials (Demo)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@military.com | Admin@123 |
| Base Commander | commander@military.com | Commander@123 |
| Logistics Officer | logistics@military.com | Logistics@123 |
