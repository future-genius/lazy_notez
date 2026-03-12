import React, { useMemo, useState } from 'react';
import { LayoutDashboard, LogOut, Megaphone, Menu, Shield, Upload, Users, X } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearStoredAuth, getStoredCurrentUser } from '../../utils/authSession';

type AdminNavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ size?: number }>;
};

export default function AdminShell({
  title,
  subtitle,
  actions,
  children
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentAdmin = getStoredCurrentUser();

  const items: AdminNavItem[] = useMemo(
    () => [
      { label: 'Admin Home', to: '/admin/home', icon: Shield },
      { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Resources', to: '/admin/resources', icon: Upload },
      { label: 'Users', to: '/admin/users', icon: Users },
      { label: 'Announcements', to: '/admin/announcements', icon: Megaphone }
    ],
    []
  );

  const handleLogout = async () => {
    clearStoredAuth();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-indigo-100">
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/90 text-white backdrop-blur-xl transform transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2 font-semibold">
              <Shield size={18} /> Lazy Notez Admin
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden" aria-label="Close sidebar">
              <X size={18} />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition ${
                    active ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} /> {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 mt-auto">
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 lg:ml-72 p-4 md:p-6">
          <header className="mb-6 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl p-4 flex items-center justify-between gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg border border-slate-300 p-2 text-slate-700"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">{title}</h1>
              <p className="text-sm text-slate-600 truncate">
                {subtitle || `Welcome, ${currentAdmin?.name || currentAdmin?.email || 'Admin'}`}
              </p>
            </div>
            <div className="shrink-0">{actions}</div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}

