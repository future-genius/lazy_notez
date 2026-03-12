import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Home, LayoutDashboard, LogOut, Megaphone, Menu, User, Users2, Wrench, X } from 'lucide-react';
import { getStoredCurrentUser } from '../utils/authSession';

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

function isActivePath(current: string, to: string) {
  if (to === '/home' || to === '/') return current === '/' || current === '/home';
  return current === to;
}

export default function GlobalNav({ onLogout }: { onLogout?: () => Promise<void> | void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatar, setAvatar] = useState<string>('');

  useEffect(() => {
    const read = () => {
      const u = getStoredCurrentUser();
      setAvatar(u?.avatar || '');
    };

    read();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'currentUser' || e.key === 'lazyNotezUser') read();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const items: NavItem[] = useMemo(() => {
    const base: NavItem[] = [
      { label: 'Home', to: '/home', icon: Home },
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Resources', to: '/resources', icon: BookOpen },
      { label: 'Announcements', to: '/announcements', icon: Megaphone },
      { label: 'Community', to: '/community', icon: Users2 },
      { label: 'Tools', to: '/tools', icon: Wrench },
      { label: 'Profile', to: '/profile', icon: User }
    ];
    return base;
  }, []);

  return (
    <>
      {/* Mobile: top bar with drawer */}
      <header className="sticky top-0 z-50 border-b border-white/40 bg-white/35 backdrop-blur-xl lg:hidden">
        <div className="px-4 h-14 flex items-center justify-between gap-3">
          <button
            className="rounded-lg border border-slate-300 p-2 text-slate-700"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link to="/home" className="flex items-center gap-2 min-w-0">
            <img src="/images/lazy-notez.png" alt="Lazy Notez" className="w-9 h-9 rounded-lg object-cover shadow-sm" />
            <span className="font-semibold text-slate-900 truncate">Lazy Notez</span>
          </Link>
          <div className="w-10" />
        </div>

        {mobileOpen && (
          <div className="border-t border-white/30 px-4 py-3">
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

            <button
              onClick={async () => {
                setMobileOpen(false);
                await onLogout?.();
                navigate('/', { replace: true });
              }}
              className="mt-3 w-full px-3 py-2 rounded-lg text-sm inline-flex items-center justify-center gap-2 bg-red-500/15 text-red-700 hover:bg-red-500/20 transition"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </header>

      {/* Desktop: top navigation */}
      <header className="hidden lg:block sticky top-0 z-50 border-b border-white/40 bg-white/35 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Link to="/home" className="flex items-center gap-3 min-w-0">
            <img src="/images/lazy-notez.png" alt="Lazy Notez" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">Lazy Notez</p>
              <p className="text-xs text-slate-600 truncate">Student portal</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 flex-1 justify-center">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-xl text-sm inline-flex items-center gap-2 transition ${
                      isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-white/70'
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-xl bg-slate-900 text-white overflow-hidden shadow-sm flex items-center justify-center"
              aria-label="Open profile"
            >
              {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={18} />}
            </button>
            <button
              onClick={async () => {
                await onLogout?.();
                navigate('/', { replace: true });
              }}
              className="rounded-xl border border-red-200 bg-white/60 px-4 py-2 text-sm text-red-700 hover:bg-white/80 transition inline-flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
