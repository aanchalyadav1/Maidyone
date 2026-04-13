import React from 'react';
import clsx from 'clsx';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={clsx('animate-pulse bg-gray-200/60 rounded-md', className)}
      {...props}
    />
  );
};

export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <div className="w-full">
    <div className="h-12 bg-gray-100/80 rounded-t-lg mb-2"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 py-4 px-6 border-b border-border/60">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-6 w-full" />
        ))}
      </div>
    ))}
  </div>
);
