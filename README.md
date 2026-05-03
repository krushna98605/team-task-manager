# TaskFlow — Team Task Manager

A clean, modern, full-stack team task management web application built with React, Node.js, Express, and MongoDB.

---

## 📋 Project Overview

TaskFlow is a collaborative task management tool that allows teams to organize projects, assign tasks to members, and track progress across different statuses. It features JWT-based authentication with role-based access control (Admin/Member).

---

## ✨ Features

- **Authentication** — Register and login with JWT tokens, bcrypt password hashing
- **Role-Based Access** — Admin and Member roles with different permissions
- **Project Management** — Create, view, and delete projects
- **Task Management** — Create, assign, update, and delete tasks
- **Task Statuses** — Pending, In Progress, Completed (with color coding)
- **Task Priority** — Low, Medium, High priority levels
- **Due Date Tracking** — Overdue task detection and highlighting
- **Dashboard** — Live statistics: total, completed, pending, in-progress, overdue tasks
- **Progress Tracking** — Visual progress bar showing completion percentage
- **Team Members** — Assign tasks to any registered user
- **Filter Tasks** — Filter by status and project
- **Protected Routes** — All app routes require authentication
- **Responsive UI** — Works on desktop and mobile

---

## 🛠 Tech Stack

### Frontend
- React.js 18 (functional components + hooks)
- React Router v6 (client-side routing, protected routes)
- Axios (HTTP client with interceptors)
- CSS Variables (custom dark theme)
- Google Fonts (Sora + DM Sans)

### Backend
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT (jsonwebtoken) for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests
- dotenv for environment variables

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile
│   │   ├── projectController.js  # CRUD for projects
│   │   ├── taskController.js     # CRUD + stats for tasks
│   │   └── userController.js     # Get all users
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js               # User schema (name, email, password, role)
│   │   ├── Project.js            # Project schema (name, description, owner, members)
│   │   └── Task.js               # Task schema (title, status, priority, dueDate...)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── server.js                 # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Layout.js         # Sidebar navigation layout
    │   ├── context/
    │   │   └── AuthContext.js    # Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── ProjectsPage.js
    │   │   └── TasksPage.js
    │   ├── utils/
    │   │   └── api.js            # Axios instance with auth interceptors
    │   ├── App.js                # Routes + protected route wrappers
    │   ├── index.css             # Global dark theme styles
    │   └── index.js
    ├── .env.example
    └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v16 or higher
- MongoDB Atlas account (free tier works) OR local MongoDB
- npm or yarn

---

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file (copy from example):
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and fill in your values:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/team-task-manager
   JWT_SECRET=your_super_secret_key_change_this_in_production
   NODE_ENV=development
   ```

   > **MongoDB Atlas Setup:**  
   > 1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)  
   > 2. Create a free cluster  
   > 3. Create a database user  
   > 4. Whitelist IP `0.0.0.0/0` (or your specific IP)  
   > 5. Copy the connection string and replace `<username>` and `<password>`

5. Start the backend:
   ```bash
   # Development (with auto-restart)
   npm run dev

   # Production
   npm start
   ```

   The API will run on `http://localhost:5000`

---

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. Start the frontend:
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

---

## 🔌 API Reference

### Auth Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Project Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/projects` | Create project | Yes |
| GET | `/api/projects` | Get user's projects | Yes |
| GET | `/api/projects/:id` | Get single project | Yes |
| DELETE | `/api/projects/:id` | Delete project | Yes (owner/admin) |

### Task Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/tasks` | Create task | Yes |
| GET | `/api/tasks` | Get tasks (with filters) | Yes |
| GET | `/api/tasks/stats` | Get dashboard stats | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |

### User Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | Yes |

---

## 🚢 Deployment

### Backend — Deploy to Railway

1. Sign up at [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Set the **Root Directory** to `/backend`
5. Add environment variables in Railway dashboard:
   - `MONGO_URI` → your MongoDB Atlas connection string
   - `JWT_SECRET` → a long random string
   - `NODE_ENV` → `production`
   - `CLIENT_URL` → your Vercel frontend URL (e.g. `https://your-app.vercel.app`)
6. Railway will auto-detect Node.js and deploy
7. Copy the Railway URL (e.g. `https://your-app.railway.app`)

---

### Frontend — Deploy to Vercel

1. Sign up at [vercel.com](https://vercel.com)
2. Click **"New Project"** → Import from GitHub
3. Set the **Root Directory** to `/frontend`
4. Add environment variable:
   - `REACT_APP_API_URL` → `https://your-railway-url.railway.app/api`
5. Click Deploy

> Make sure to update the backend `CLIENT_URL` env var to your Vercel URL for CORS to work.

---

## 🔐 Default Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Create/delete any project or task, manage all resources |
| **Member** | Create projects, create tasks, edit/delete own resources |

Register with role **"Admin"** on the register page to get admin access.

---

## 📝 License

MIT — free to use for any purpose.
