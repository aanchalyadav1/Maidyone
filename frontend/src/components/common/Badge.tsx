import React from 'react';
import clsx from 'clsx';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className, ...props }) => {
  const variants: Record<BadgeVariant, string> = {
    success: 'bg-[#E1F7E3] text-[#1E7145]',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-background border border-border text-text-secondary'
  };

  return (
    <span 
      className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};
