# 💬 Beggtho? Chat & Dashboard App

A full-stack real-time dashboard and chat application built with **React (Vite)** on the frontend and **Node.js (Express & Mongoose)** on the backend[cite: 5, 6]. It features secure session management using JWT stored safely in `HttpOnly` cookies, bcrypt password hashing, and automated 5-second interval message polling[cite: 5, 6].

---

## 🚀 Features

- **Authentication System:** Secure registration (`/signin`) and login (`/login`) flows using hashed passwords (`bcrypt`) and JWT authentication stored via credentials-included cookies[cite: 3, 4, 6].
- **Real-time Chat Dashboard:** Live chat room featuring automatic message scrolling and 5-second polling intervals to keep conversations updated[cite: 5].
- **Quick Shortcut Buttons:** Integrated quick-access navigation buttons pointing to YouTube, Netflix, and external tools like the HIMYM random episode selector[cite: 5].
- **Protected Routing:** React Router guards (`/api/me`) ensuring session security and automated redirection to login when unauthenticated[cite: 2, 5].

---

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**[cite: 5]
- **React Router DOM** (v6 routing for `/`, `/signin`, `/login`)[cite: 2]
- **Custom CSS Styling**[cite: 5]

### Backend
- **Node.js & Express**[cite: 6]
- **MongoDB & Mongoose** (Users and messages schemas/collections)[cite: 6]
- **JSON Web Tokens (JWT)** & **Cookie Parser**[cite: 6]
- **Bcrypt** (Secure password hashing)[cite: 6]
- **CORS** (Configured with credentials support for production and development)[cite: 6]

---

## 📁 Project Structure

```text
├── src/
│   ├── App.jsx        # Main dashboard, quick links, and real-time chat interface[cite: 5]
│   ├── Login.jsx      # Login page component[cite: 4]
│   ├── Signin.jsx     # Registration page component[cite: 3]
│   ├── main.jsx       # React entry point and router definitions[cite: 2]
│   └── App.css        # Global and component styles[cite: 5]
├── server.js          # Express backend, database models, and authentication routes[cite: 6]
└── package.json       # Project dependencies and scripts
```

---

## ⚙️ Environment Variables

To run the backend server locally or configure it for deployment, make sure your `.env` file includes:

```env
PORT=4000
JWT_SECRET=your_super_secret_jwt_key
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development # or 'production'
```

---

## 📦 Getting Started

### 1. Clone the Repository
```bash
git clone [https://github.com/tanilhamdi/beggtho.git](https://github.com/tanilhamdi/beggtho.git)
cd beggtho
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Application
- **Start Backend Server:**
  ```bash
  node server.js
  ```
- **Start Frontend (Vite Dev Server):**
  ```bash
  npm run dev
  ```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
