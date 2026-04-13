import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-text-primary">{label}</label>}
      <input
        className={clsx(
          'w-full px-4 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-text-primary',
          error ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};
