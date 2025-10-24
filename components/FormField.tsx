
import React, { useContext } from 'react';
import { ThemeContext } from '../App';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  maxLength?: number; // Added maxLength prop
  error?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  disabled = false,
  maxLength, // Destructure maxLength
  error = false,
}) => {
  const { theme } = useContext(ThemeContext);
  const baseInputClasses = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-colors duration-200";
  const lightModeClasses = "border-gray-300 placeholder-gray-400 focus:ring-primary focus:border-primary bg-white text-gray-900";
  const darkModeClasses = "dark:border-gray-600 dark:placeholder-gray-500 dark:focus:ring-secondary dark:focus:border-secondary dark:bg-gray-700 dark:text-gray-100";
  const disabledClasses = "disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:text-gray-500 disabled:dark:text-gray-400 disabled:cursor-not-allowed";
  const errorClasses = error ? "border-red-600 focus:ring-red-600 focus:border-red-600" : "";

  return (
    <div className={`mb-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || `Ingrese ${label.toLowerCase()}`}
        required={required}
        disabled={disabled}
        maxLength={maxLength} // Apply maxLength to the input element
        className={`${baseInputClasses} ${theme === 'light' ? lightModeClasses : darkModeClasses} ${disabledClasses} ${errorClasses}`}
      />
    </div>
  );
};
