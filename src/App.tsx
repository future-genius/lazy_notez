import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResourcesSubpage from './pages/ResourcesSubpage';
import AboutUs from './pages/AboutUs';
import Community from './pages/Community';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import { initializeAuthSession, logoutSession, SessionUser } from './utils/authSession';
import { ADMIN_EMAIL, seedResourcesIfEmpty } from './utils/localDb';
import GlobalNav from './components/GlobalNav';

const ADMIN_SESSION_KEY = 'lazyNotezAdmin';
const LAST_AREA_KEY = 'lazyNotez.nav.lastArea.v1';
const LAST_ADMIN_PATH_KEY = 'lazyNotez.nav.lastAdminPath.v1';

const isAdmin = (user?: SessionUser | null) => {
  if (!user) return false;
  return user.role === 'admin' && user.email?.toLowerCase() === ADMIN_EMAIL;
};

function ProtectedRoute({ isAllowed, children, redirectTo = '/auth' }: { isAllowed: boolean; children: React.ReactNode; redirectTo?: string }) {
  return isAllowed ? <>{children}</> : <Navigate to={redirectTo} replace />;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        seedResourcesIfEmpty();
        const initialized = await initializeAuthSession();
        if (initialized) {
          setUser(initialized);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admin')) {
      sessionStorage.setItem(LAST_AREA_KEY, 'admin');
      sessionStorage.setItem(LAST_ADMIN_PATH_KEY, path);
      return;
    }

    if (sessionStorage.getItem(LAST_AREA_KEY) === 'admin' && navigationType === 'POP' && isAdmin(user) && !path.startsWith('/admin')) {
      const lastAdmin = sessionStorage.getItem(LAST_ADMIN_PATH_KEY) || '/admin/dashboard';
      navigate(lastAdmin, { replace: true });
    } else {
      sessionStorage.setItem(LAST_AREA_KEY, 'user');
    }
  }, [location.pathname, navigationType, navigate, user]);

  const handleLogin = (userData: SessionUser) => {
    setUser(userData);
    setIsLoggedIn(true);
    if (isAdmin(userData)) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  };

  const handleLogout = async () => {
    await logoutSession();
    localStorage.removeItem(ADMIN_SESSION_KEY);
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
      <div className="min-h-screen">
        {isLoggedIn && !location.pathname.startsWith('/admin') && (
        <GlobalNav />
        )}

      <div className={isLoggedIn && !location.pathname.startsWith('/admin') ? 'lg:ml-72' : ''}>
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} onLogin={handleLogin} user={user} onLogout={handleLogout} />} />
        <Route path="/auth" element={!isLoggedIn ? <Auth onLogin={handleLogin} /> : <Navigate to={isAdmin(user) ? '/admin' : '/dashboard'} replace />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={!isLoggedIn ? <Register onRegister={handleLogin} /> : <Navigate to="/dashboard" replace />} />
        <Route path="/home" element={<Home isLoggedIn={isLoggedIn} onLogin={handleLogin} user={user} onLogout={handleLogout} />} />
        <Route path="/dashboard" element={<ProtectedRoute isAllowed={isLoggedIn}><Dashboard user={user as any} onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute isAllowed={isLoggedIn}><Dashboard user={user as any} onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute isAllowed={isLoggedIn}><ResourcesSubpage /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute isAllowed={isLoggedIn}><Community /></ProtectedRoute>} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/admin" element={<ProtectedRoute isAllowed={isAdmin(user)} redirectTo="/"><Navigate to="/admin/dashboard" replace /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute isAllowed={isAdmin(user)} redirectTo="/"><AdminDashboard initialTab="dashboard" /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute isAllowed={isAdmin(user)} redirectTo="/"><AdminDashboard initialTab="users" /></ProtectedRoute>} />
        <Route path="/admin/resources" element={<ProtectedRoute isAllowed={isAdmin(user)} redirectTo="/"><AdminDashboard initialTab="resources" /></ProtectedRoute>} />
        <Route path="/admin/monitor" element={<ProtectedRoute isAllowed={isAdmin(user)} redirectTo="/"><AdminDashboard initialTab="monitor" /></ProtectedRoute>} />
        <Route path="/admin/communities" element={<ProtectedRoute isAllowed={isAdmin(user)} redirectTo="/"><Navigate to="/admin/monitor" replace /></ProtectedRoute>} />
        <Route path="/admin/feedback" element={<ProtectedRoute isAllowed={isAdmin(user)} redirectTo="/"><Navigate to="/admin/monitor" replace /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute isAllowed={isAdmin(user)} redirectTo="/"><Navigate to="/admin/monitor" replace /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute isAllowed={isAdmin(user)} redirectTo="/"><Navigate to="/admin/dashboard" replace /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/'} replace />} />
      </Routes>
      </div>
    </div>
  );
}

export default App;
