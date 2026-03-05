import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResourcesSubpage from './pages/ResourcesSubpage';
import AboutUs from './pages/AboutUs';
import Community from './pages/Community';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import { getStoredUser } from './utils/googleAuth';

const ADMIN_SESSION_KEY = 'lazyNotezAdmin';

const setAdminSession = (isAdmin: boolean) => {
  if (isAdmin) {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return;
  }
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

const hasValidAdminSession = () => {
  if (localStorage.getItem(ADMIN_SESSION_KEY) !== 'true') return false;
  const currentUserRaw = localStorage.getItem('currentUser');
  if (!currentUserRaw) return false;

  try {
    const currentUser = JSON.parse(currentUserRaw);
    return currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  } catch {
    return false;
  }
};

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  return hasValidAdminSession() ? <>{children}</> : <Navigate to="/login" replace />;
}

function Login({ onLogin }: { onLogin: (userData: any) => void }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const API_BASE = (window as any).__API_BASE__ || 'http://localhost:4000/api';
    const finalizeLogin = (current: any) => {
      localStorage.setItem('currentUser', JSON.stringify(current));
      if (current?.accessToken) {
        sessionStorage.setItem('lazyNotezAccessToken', current.accessToken);
      }
      onLogin(current);
      if (current?.role === 'admin' || current?.role === 'super_admin') {
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        window.location.replace('/admin/dashboard');
        return;
      }
      localStorage.removeItem(ADMIN_SESSION_KEY);
      navigate('/home', { replace: true });
    };

    // Try backend login first
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        const current = { ...data.user, accessToken: data.accessToken };
        finalizeLogin(current);
      } else {
        // fallback to localStorage-based auth
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find((u: any) => u.username === username && u.password === password);
        if (user) {
          finalizeLogin(user);
        } else {
          const err = await res.json().catch(() => null);
          alert(err?.message || 'Invalid credentials');
        }
      }
    }).catch(() => {
      // network error -> fallback to local
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        finalizeLogin(user);
      } else {
        alert('Invalid credentials (offline)');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Register now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize default admin user - always ensure admin exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminExists = users.some((u: any) => u.username === 'admin');
    
    if (!adminExists) {
      const adminUser = {
        id: 'admin_' + Date.now(),
        name: 'Administrator',
        username: 'admin',
        password: 'admin123',
        email: 'admin@lazynotez.com',
        college: 'Admin College',
        department: 'Administration',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        recentActivity: []
      };
      users.push(adminUser);
      localStorage.setItem('users', JSON.stringify(users));
    }

    // Check for existing user (including Google OAuth users)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        setUser(userData);
        setIsLoggedIn(true);
        if (userData?.accessToken) sessionStorage.setItem('lazyNotezAccessToken', userData.accessToken);
        setAdminSession(userData?.role === 'admin' || userData?.role === 'super_admin');
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    } else {
      // Check for Google login user
      const googleUser = getStoredUser();
      if (googleUser) {
        setUser(googleUser);
        setIsLoggedIn(true);
        setAdminSession(googleUser?.role === 'admin' || googleUser?.role === 'super_admin');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
    setAdminSession(userData?.role === 'admin' || userData?.role === 'super_admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem('lazyNotezAccessToken');
    setUser(null);
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home isLoggedIn={isLoggedIn} onLogin={handleLogin} user={user} onLogout={handleLogout} />} />
      <Route path="/auth" element={!isLoggedIn ? <Auth onLogin={handleLogin} /> : <Navigate to="/home" />} />
      <Route path="/login" element={!isLoggedIn ? <Login onLogin={handleLogin} /> : <Navigate to={user?.role === 'admin' || user?.role === 'super_admin' ? '/admin/dashboard' : '/home'} replace />} />
      <Route path="/register" element={!isLoggedIn ? <Register onRegister={handleLogin} /> : <Navigate to="/home" />} />
      <Route path="/home" element={<Home isLoggedIn={isLoggedIn} onLogin={handleLogin} user={user} onLogout={handleLogout} />} />
      <Route path="/dashboard" element={isLoggedIn ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
      <Route path="/resources" element={isLoggedIn ? <ResourcesSubpage /> : <Navigate to="/" />} />
      <Route path="/community" element={isLoggedIn ? <Community /> : <Navigate to="/" />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/admin" element={<AdminProtectedRoute><Navigate to="/admin/dashboard" replace /></AdminProtectedRoute>} />
      <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard initialTab="dashboard" /></AdminProtectedRoute>} />
      <Route path="/admin/users" element={<AdminProtectedRoute><AdminDashboard initialTab="users" /></AdminProtectedRoute>} />
      <Route path="/admin/resources" element={<AdminProtectedRoute><AdminDashboard initialTab="resources" /></AdminProtectedRoute>} />
      <Route path="/admin/communities" element={<AdminProtectedRoute><AdminDashboard initialTab="communities" /></AdminProtectedRoute>} />
      <Route path="/admin/feedback" element={<AdminProtectedRoute><AdminDashboard initialTab="feedback" /></AdminProtectedRoute>} />
      <Route path="/admin/settings" element={<AdminProtectedRoute><AdminDashboard initialTab="settings" /></AdminProtectedRoute>} />
      <Route path="/admin/*" element={<AdminProtectedRoute><Navigate to="/admin/dashboard" replace /></AdminProtectedRoute>} />
    </Routes>
  );
}

export default App;
