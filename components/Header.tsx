import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { MenuIcon } from './icons/MenuIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { ArrowRightOnRectangleIcon } from './icons/ArrowRightOnRectangleIcon';
import { useEmpresa } from '../context/EmpresaContext';

interface HeaderProps {
  user: User;
  toggleSidebar: () => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
  isAuthenticated: boolean; 
  ThemeToggleButton: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  toggleSidebar,
  onLogout,
  isSidebarOpen,
  isAuthenticated, 
  ThemeToggleButton,
}) => {
  const { empresaInfo } = useEmpresa();
  const [currentUser, setCurrentUser] = useState<{name: string, perfil: string} | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const nombreEmpleado = localStorage.getItem('nombreEmpleado');
      const perfilData = localStorage.getItem('perfil');
      
      if (nombreEmpleado && perfilData) {
        try {
          const perfil = JSON.parse(perfilData);
          setCurrentUser({
            name: nombreEmpleado,
            perfil: perfil.nombrePerfil
          });
        } catch (error) {
          console.error('Error parsing perfil data:', error);
          setCurrentUser({ name: nombreEmpleado, perfil: 'Sin perfil' });
        }
      }
    } else {
      setCurrentUser(null);
    }
  }, [isAuthenticated]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        {isAuthenticated && !isSidebarOpen && ( 
            <button
            onClick={toggleSidebar}
            className="md:hidden p-2 mr-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Open sidebar"
            >
            <MenuIcon className="w-6 h-6" />
            </button>
        )}
         <div className="flex items-center gap-6">
           <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
             Sistema de Facturación Cibercom
           </h1>
           <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-6">
             <div>
               <p className="text-sm font-medium">{empresaInfo.nombre}</p>
               <p className="text-xs">RFC: {empresaInfo.rfc}</p>
             </div>
           </div>
         </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        {ThemeToggleButton}
        {/* {isAuthenticated && SettingsButton} Show settings only if authenticated - Removed */}
        
        {isAuthenticated && ( 
          <div className="relative group">
            <button className="flex items-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" aria-haspopup="true" aria-expanded="false" aria-label={`User menu for ${currentUser?.name || user.name}`}>
              <UserCircleIcon className="w-7 h-7" />
              <span className="hidden md:inline ml-2 text-sm">{currentUser?.name.split(' ')[0] || user.name.split(' ')[0]}</span>
            </button>
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50 hidden group-hover:block ring-1 ring-black ring-opacity-5 dark:ring-gray-700" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate" id="user-name-full">{currentUser?.name || user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Perfil: {currentUser?.perfil || 'Sin perfil'}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                role="menuitem"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                Salir
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};