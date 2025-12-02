import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import NotesPage from './pages/NotesPage'
import ResourcesPage from './pages/ResourcesPage'
import AdminPanel from './pages/AdminPanel'
import Navbar from './components/Navbar'
import { useAppSelector } from './store/hooks'

const App: React.FC = () => {
  const auth = useAppSelector(s => s.auth)

  const PrivateRoute: React.FC<{ children: any }> = ({ children }) => {
    if (!auth.accessToken) return <Navigate to="/login" replace />
    return children
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {auth.accessToken && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to={auth.accessToken ? "/dashboard" : "/login"} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/notes" element={<PrivateRoute><NotesPage /></PrivateRoute>} />
        <Route path="/resources" element={<PrivateRoute><ResourcesPage /></PrivateRoute>} />
        <Route path="/admin/*" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
      </Routes>
    </Suspense>
  )
}

export default App
