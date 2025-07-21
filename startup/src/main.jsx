import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signin from './Signin.jsx'
import Login from './Login.jsx'



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/Signin" element={<Signin />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
