import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronRight, Users } from 'lucide-react';
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

  return (
    <div className={`flex flex-col bg-white items-center justify-start h-screen fixed left-0 top-0 transition-all duration-300 z-50 shadow-lg ${isOpen ? 'w-64 sm:w-72' : 'w-0'} overflow-hidden`}>
      {isOpen && (
        <div className="flex flex-col mt-2 z-[100] items-center justify-start h-full w-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between w-full pr-4 sm:pr-8 pl-3 sm:pl-4 py-3 sm:py-4 border-b border-gray-100">
            <div className="flex text-lg sm:text-xl text-gray-800 font-bold items-center w-full">
              <Brain className="w-10 sm:w-14 h-10 sm:h-14 mr-2 text-primary-600" />
              <span className="hidden sm:inline">Lazy Notez</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center flex-col gap-3 w-full">
            <NavItem title="Home" onClick={() => onNavigate('/home')} active={activePath === '/home'} />

            {/* Resources Section */}
            <div className="w-full px-6 py-2">
              <div
                className={`w-full flex items-center justify-between cursor-pointer rounded-lg px-3 py-2 transition-colors ${
                  resourcesOpen ? 'bg-surface-muted' : 'hover:bg-surface-muted'
                }`}
                onClick={() => setResourcesOpen(!resourcesOpen)}
              >
                <p className="text-md max-sm:text-base font-medium">Resources</p>
                <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </div>
              {resourcesOpen && (
                <div className="flex flex-col items-start pl-4 justify-center w-full gap-2 mt-2">
                  <NavLink onClick={() => onNavigate('/resources')}>Resources</NavLink>
                </div>
              )}
              <hr className="border-gray-100 w-full mt-2" />
            </div>

            <NavItem title="Community" onClick={() => onNavigate('/community')} active={activePath === '/community'} />

            <NavItem title="Dashboard" onClick={() => onNavigate('/dashboard')} active={activePath === '/dashboard'} />

            <NavItem title="About Us" isLast onClick={() => onNavigate('/about')} active={activePath === '/about'} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;