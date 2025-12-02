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
    <div className="w-full px-6 py-2">
      <div
        className={`w-full flex items-center justify-between cursor-pointer rounded-lg px-3 py-2 transition-colors ${
          active ? 'bg-primary-50 text-primary-700' : 'hover:bg-surface-muted'
        }`}
        onClick={onClick}
        role="button"
      >
        <p className="text-md max-sm:text-base font-medium">{title}</p>
        {!isLast && <ChevronRight className="w-4 h-4 text-gray-400" />}
      </div>
      {!isLast && <hr className="border-gray-100 w-full mt-2" />}
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
    <div className={`flex flex-col bg-white items-center justify-start h-screen fixed left-0 top-0 transition-all duration-300 ${isOpen ? 'w-72' : 'w-0'}`}>
      {isOpen && (
        <div className="flex flex-col mt-2 z-[100] items-center justify-start h-full w-full">
          {/* Header */}
          <div className="flex items-center justify-between w-full pr-8 pl-4 py-4">
            <div className="flex text-xl text-gray-800 font-medium items-center w-full">
              <Brain className="w-14 h-14 mr-2 text-gray-800" />
              Lazy Notez
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