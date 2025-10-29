
import React from 'react';

interface ChipProps {
  text: string;
  color?: 'gray' | 'green' | 'blue';
  className?: string;
}

const Chip: React.FC<ChipProps> = ({ text, color = 'gray', className = '' }) => {
  const colorStyles = {
    gray: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorStyles[color]} ${className}`}>
      {text}
    </span>
  );
};

export default Chip;
