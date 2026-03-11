import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, LayoutDashboard, Menu, User, X } from 'lucide-react';

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

function isActivePath(current: string, to: string) {
  if (to === '/home' || to === '/') return current === '/' || current === '/home';
  return current === to;
}

export default function GlobalNav() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items: NavItem[] = useMemo(() => {
    const base: NavItem[] = [
      { label: 'Home', to: '/home', icon: Home },
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Resources', to: '/resources', icon: BookOpen },
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
          </div>
        )}
      </header>

      {/* Desktop: fixed left navigation */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 bg-white/70 backdrop-blur-xl border-r border-white/40">
        <div className="flex flex-col w-full">
          <div className="h-16 flex items-center gap-3 px-5 border-b border-white/40">
            <img src="/images/lazy-notez.png" alt="Lazy Notez" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">Lazy Notez</p>
              <p className="text-xs text-slate-600 truncate">Student portal</p>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(location.pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`w-full px-3 py-2 rounded-xl text-sm inline-flex items-center gap-3 transition ${
                    active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-white/70'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
