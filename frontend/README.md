# 🎨 Company Forum - Frontend

Modern React frontend cho hệ thống Company Forum với **Material Dashboard 2** design cho Admin/Manager và giao diện riêng cho Employees.

## 🚀 Tech Stack

- **Framework**: React 19 + Vite
- **UI Library**: Material-UI (MUI) v7
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Form Handling**: React Hook Form
- **Charts**: Chart.js + react-chartjs-2
- **Authentication**: JWT

## 📋 Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Backend API running on `http://localhost:3000`

## 🛠️ Quick Start

```bash
# Already installed! Just start:
npm run dev
```

Server runs on: **http://localhost:5173**

Login with:

- **Email**: `admin@example.com`
- **Password**: `Admin123!`

---

## 🏗️ Project Structure

```
src/
├── components/          # ProtectedRoute
├── layouts/            # AdminLayout (Material Dashboard)
├── pages/
│   ├── Login.jsx
│   └── admin/
│       └── Dashboard.jsx
├── services/           # API calls
├── store/              # Redux (authSlice)
├── config/             # API endpoints
└── utils/              # Axios instance
```

## 🎯 Current Status

**✅ Implemented:**

- Login with JWT authentication
- Admin layout (Material Dashboard)
- Dashboard with stats from backend
- Protected routes with role-based access
- Redux state management
- API integration (59 endpoints ready)

**🚧 Next Steps:**

- Users management page
- Posts CRUD
- Projects & Tasks
- Employee portal
- Real-time features

---

**Backend**: Connect to `http://localhost:3000/api` (59 endpoints, 100% tested)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
