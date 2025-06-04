
import React, { useState, useContext } from 'react';
import type { NavItem } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { MenuIcon } from './icons/MenuIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { ThemeContext } from '../App';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
  navItems: NavItem[];
  isOpen: boolean;
  toggleSidebar: () => void;
  onNavItemClick: (label: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, path?: string) => void;
  logoUrl: string;
  appName: string;
}

const SidebarNavItem: React.FC<{ 
  item: NavItem; 
  onNavItemClick: (label: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, path?: string) => void;
  activePath?: string; 
}> = ({ item, onNavItemClick, activePath }) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const { theme } = useContext(ThemeContext);

  const hasChildren = item.children && item.children.length > 0;

  const handleItemClick = () => {
    if (hasChildren) {
      setIsSubmenuOpen(!isSubmenuOpen);
    } else {
      onNavItemClick(item.label, item.icon, item.path);
    }
  };
  
  React.useEffect(() => {
    if (hasChildren && item.children?.some(child => child.path === activePath)) {
      setIsSubmenuOpen(true);
    } else if (hasChildren && !item.children?.some(child => child.path === activePath) && item.path !== activePath) {
       const isParentOfActivePath = NAV_ITEMS.find(nav => nav.label === item.label)?.children?.some(child => child.path === activePath);
       if (!isParentOfActivePath) {
        setIsSubmenuOpen(false);
       }
    }
  }, [activePath, hasChildren, item, item.children, item.path]);


  const baseItemClasses = "flex items-center w-full p-3 rounded-lg transition-colors duration-200 ease-in-out";
  const textColor = theme === 'dark' ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900';
  const bgColor = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200';
  
  let isActiveParent = false;
  if (hasChildren && activePath) {
    isActiveParent = item.children?.some(child => child.path === activePath) || false;
  }
  const isDirectlyActive = item.path === activePath;

  const itemIsActiveBasedOnPath = isDirectlyActive || isActiveParent;

  const activeBg = theme === 'dark' ? 'bg-primary-dark' : 'bg-primary';
  const activeText = 'text-white';
  
  const IconComponent = item.icon;

  return (
    <li className="mb-1">
      <button
        onClick={item.path && !hasChildren ? () => onNavItemClick(item.label, item.icon, item.path) : handleItemClick}
        className={`${baseItemClasses} ${textColor} ${bgColor} ${itemIsActiveBasedOnPath ? `${activeBg} ${activeText}` : ''}`}
        aria-expanded={hasChildren ? isSubmenuOpen : undefined}
        aria-current={isDirectlyActive ? 'page' : undefined} 
      >
        {IconComponent && <IconComponent className={`w-5 h-5 mr-3 ${itemIsActiveBasedOnPath ? activeText : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`} />}
        <span className="flex-1 text-left">{item.label}</span>
        {hasChildren && (
          <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''} ${itemIsActiveBasedOnPath ? activeText : ''}`} />
        )}
      </button>
      {hasChildren && isSubmenuOpen && (
        <ul className="pl-6 mt-1 space-y-1">
          {item.children?.map((child) => (
            <SidebarNavItemChild 
              key={child.path || child.label} 
              item={child} 
              onNavItemClick={onNavItemClick} 
              activePath={activePath}
            />
          ))}
        </ul>
      )}
    </li>
  );
};


const SidebarNavItemChild: React.FC<{ 
  item: NavItem; 
  onNavItemClick: (label: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, path?: string) => void;
  activePath?: string;
}> = ({ item, onNavItemClick, activePath }) => {
  const { theme } = useContext(ThemeContext);
  const isActive = item.path === activePath;

  const baseItemClasses = "flex items-center w-full p-2 pl-5 rounded-md transition-colors duration-200 ease-in-out text-sm";
  const textColor = theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900';
  const bgColor = theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100';
  const activeBgColor = theme === 'dark' ? 'bg-secondary-dark' : 'bg-secondary';
  const activeTextColor = 'text-white';
  
  const IconComponent = item.icon;

  return (
     <li>
        <button
          onClick={() => onNavItemClick(item.label, item.icon, item.path)}
          className={`${baseItemClasses} ${textColor} ${bgColor} ${isActive ? `${activeBgColor} ${activeTextColor}` : ''}`}
          aria-current={isActive ? 'page' : undefined}
        >
          {IconComponent && <IconComponent className={`w-4 h-4 mr-2 ${isActive ? activeTextColor : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`} />}
          {item.label}
        </button>
      </li>
  );
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, isOpen, toggleSidebar, onNavItemClick, logoUrl, appName }) => {
  const { theme } = useContext(ThemeContext);
  const [activePath, setActivePath] = useState('dashboard');

  const handleInternalNavItemClick = (label: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, path?: string) => {
    onNavItemClick(label, icon, path); 
    if(path) setActivePath(path); 
  };
  

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-gray-800 shadow-lg transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 md:w-72 border-r border-gray-200 dark:border-gray-700`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16">
          <div className="flex items-center">
            {logoUrl ? (
              <img src={logoUrl} alt={`${appName} Logo`} className="h-8 mr-3 object-contain" />
            ) : (
              <span className="text-xl font-semibold text-primary dark:text-primary-dark">{appName}</span>
            )}
          </div>
          <button onClick={toggleSidebar} className="md:hidden p-1 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-dark" aria-label="Close sidebar">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <ul>
            {navItems.map((item) => (
               <SidebarNavItem 
                key={item.path || item.label} 
                item={item} 
                onNavItemClick={handleInternalNavItemClick}
                activePath={activePath}
              />
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} {appName}
          </p>
        </div>
      </aside>
    </>
  );
};
