import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

type NavItemProps = {
  title: string;
  path?: string;
  isLast?: boolean;
  onClick?: () => void;
  active?: boolean;
};

// NavItem Component
function NavItem({ title, isLast = false, onClick, active = false }: NavItemProps) {
  return (
    <div className="w-full px-3 sm:px-6 py-1 sm:py-2">
      <div
        className={`w-full flex items-center justify-between cursor-pointer rounded-lg px-3 py-2.5 sm:py-3 transition-all active:scale-95 ${
          active ? 'bg-primary-500 text-white font-semibold shadow-md' : 'hover:bg-gray-100 text-gray-700'
        }`}
        onClick={onClick}
        role="button"
      >
        <p className="text-sm sm:text-md font-medium truncate">{title}</p>
        {!isLast && <ChevronRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />}
      </div>
      {!isLast && <hr className="border-gray-100 w-full mt-1 sm:mt-2" />}
    </div>
  );
}

type NavLinkProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

// NavLink Component
function NavLink({ children, onClick }: NavLinkProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <p
        className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
        onClick={onClick}
      >
        {children}
      </p>
    </div>
  );
}

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
  onNavigate: (path: string) => void;
  isLoggedIn?: boolean;
  onLogin?: (user?: any) => void;
};

// Sidebar Component
function Sidebar({ isOpen, toggleSidebar, onNavigate }: SidebarProps) {
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const location = useLocation();
  const activePath = location.pathname;

  const navigateAndClose = (path: string) => {
    onNavigate(path);
    if (window.matchMedia?.('(max-width: 1023px)')?.matches) {
      toggleSidebar();
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] transition-opacity ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full w-full overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <div className="flex text-lg text-gray-900 font-bold items-center">
              <Brain className="w-10 h-10 mr-2 text-primary-600" />
              <span>Lazy Notez</span>
            </div>
            <button onClick={toggleSidebar} className="rounded-lg p-2 hover:bg-gray-100 lg:hidden" aria-label="Close sidebar">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center flex-col gap-2 w-full py-2">
            <NavItem title="Home" onClick={() => navigateAndClose('/home')} active={activePath === '/home' || activePath === '/'} />

            <div className="w-full px-3 sm:px-6 py-1 sm:py-2">
              <div
                className={`w-full flex items-center justify-between cursor-pointer rounded-lg px-3 py-2.5 transition-colors ${resourcesOpen ? 'bg-surface-muted' : 'hover:bg-surface-muted'}`}
                onClick={() => setResourcesOpen(!resourcesOpen)}
                role="button"
              >
                <p className="text-sm sm:text-md font-medium">Resources</p>
                <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </div>
              {resourcesOpen && (
                <div className="flex flex-col items-start pl-4 pr-2 justify-center w-full gap-2 mt-2">
                  <NavLink onClick={() => navigateAndClose('/resources')}>Resources</NavLink>
                </div>
              )}
              <hr className="border-gray-100 w-full mt-2" />
            </div>

            <NavItem title="Community" onClick={() => navigateAndClose('/community')} active={activePath === '/community'} />
            <NavItem title="Dashboard" onClick={() => navigateAndClose('/dashboard')} active={activePath === '/dashboard'} />
            <NavItem title="About Us" isLast onClick={() => navigateAndClose('/about')} active={activePath === '/about'} />
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
