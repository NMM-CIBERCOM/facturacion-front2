import React from 'react';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selected, onChange, className }) => {
  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${className}`}
      dateFormat="dd/MM/yyyy HH:mm"
      showTimeInput
    />
  );
};