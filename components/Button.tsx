
import React, { useContext } from 'react';
import { ThemeContext } from '../App';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'neutral';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const { theme } = useContext(ThemeContext);

  let baseStyle = 'px-4 py-2 rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';
  
  const lightModePrimary = 'bg-primary text-white hover:bg-primary-dark focus:ring-primary';
  const darkModePrimary = 'dark:bg-primary dark:text-white dark:hover:bg-primary-dark dark:focus:ring-primary';

  const lightModeSecondary = 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary';
  const darkModeSecondary = 'dark:bg-secondary dark:text-white dark:hover:bg-secondary-dark dark:focus:ring-secondary';
  
  const lightModeDanger = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
  const darkModeDanger = 'dark:bg-red-500 dark:text-white dark:hover:bg-red-600 dark:focus:ring-red-500';

  const lightModeNeutral = 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400';
  const darkModeNeutral = 'dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 dark:focus:ring-gray-500';


  switch (variant) {
    case 'primary':
      baseStyle += ` ${lightModePrimary} ${darkModePrimary}`;
      break;
    case 'secondary':
      baseStyle += ` ${lightModeSecondary} ${darkModeSecondary}`;
      break;
    case 'danger':
      baseStyle += ` ${lightModeDanger} ${darkModeDanger}`;
      break;
    case 'neutral':
      baseStyle += ` ${lightModeNeutral} ${darkModeNeutral}`;
      break;
  }

  return (
    <button className={`${baseStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};
    