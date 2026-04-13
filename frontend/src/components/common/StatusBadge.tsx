import React from 'react';
import clsx from 'clsx';

type Status = 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';

interface StatusBadgeProps {
  status: Status | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Confirmed':
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', getStyles())}>
      {status}
    </span>
  );
};
