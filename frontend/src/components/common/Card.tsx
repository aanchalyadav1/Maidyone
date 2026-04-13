import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div 
      className={clsx('bg-card rounded-2xl shadow-soft border border-border p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};
