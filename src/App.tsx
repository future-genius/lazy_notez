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

function Login({ onLogin }: { onLogin: (userData: any) => void }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.username === username && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      onLogin(user);
      navigate('/home');
    } else {
      alert('Invalid credentials');
    }
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

    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
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
      <Route path="/login" element={!isLoggedIn ? <Login onLogin={handleLogin} /> : <Navigate to="/home" />} />
      <Route path="/register" element={!isLoggedIn ? <Register onRegister={handleLogin} /> : <Navigate to="/home" />} />
      <Route path="/home" element={<Home isLoggedIn={isLoggedIn} onLogin={handleLogin} user={user} onLogout={handleLogout} />} />
      <Route path="/dashboard" element={isLoggedIn ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
      <Route path="/resources" element={isLoggedIn ? <ResourcesSubpage /> : <Navigate to="/" />} />
      <Route path="/community" element={isLoggedIn ? <Community /> : <Navigate to="/" />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/admin" element={isLoggedIn && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;