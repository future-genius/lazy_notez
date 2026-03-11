import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Home, LayoutDashboard, LogOut, Menu, UploadCloud, User, X } from 'lucide-react';

type Props = {
  userName?: string;
  isAdmin?: boolean;
  onLogout: () => Promise<void> | void;
};

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

function isActivePath(current: string, to: string) {
  if (to === '/home' || to === '/') return current === '/' || current === '/home';
  return current === to;
}

export default function GlobalNav({ userName, isAdmin, onLogout }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items: NavItem[] = useMemo(() => {
    const base: NavItem[] = [
      { label: 'Home', to: '/home', icon: Home },
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Resources', to: '/resources', icon: BookOpen },
      { label: 'Profile', to: '/profile', icon: User }
    ];
    if (isAdmin) {
      base.splice(3, 0, { label: 'Upload', to: '/admin/resources', icon: UploadCloud });
    }
    return base;
  }, [isAdmin]);

  const handleLogout = async () => {
    await onLogout();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/35 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="lg:hidden rounded-lg border border-slate-300 p-2 text-slate-700"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link to="/home" className="flex items-center gap-2 min-w-0">
            <img src="/images/lazy-notez.png" alt="Lazy Notez" className="w-9 h-9 rounded-lg object-cover shadow-sm" />
            <span className="font-semibold text-slate-900 truncate hidden sm:inline">Lazy Notez</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(location.pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded-lg text-sm inline-flex items-center gap-2 transition ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white/60'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-sm text-slate-700 truncate max-w-[16rem]">Hi, {userName || 'Student'}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 text-white px-3 py-2 text-sm inline-flex items-center gap-2"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/30 px-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(location.pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm inline-flex items-center gap-2 transition ${
                    active ? 'bg-slate-900 text-white' : 'bg-white/50 text-slate-700'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
