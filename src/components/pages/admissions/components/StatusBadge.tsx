import React from 'react';
import { Badge } from 'react-bootstrap';
import { EnrollmentStatus } from '../types';

interface StatusBadgeProps {
  status: EnrollmentStatus | string;
  size?: 'sm' | 'normal';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'normal' }) => {
  let bg = 'secondary';
  let label = status;

  switch (status) {
    case 'NEW':
      bg = 'primary';
      label = 'New';
      break;
    case 'PROMOTED':
      bg = 'success';
      label = 'Promoted';
      break;
    case 'REPEAT':
      bg = 'warning';
      label = 'Repeat';
      break;
    case 'TRANSFERRED':
      bg = 'danger';
      label = 'Transferred';
      break;
    case 'COMPLETED':
      bg = 'info';
      label = 'Completed';
      break;
    case 'CANCELLED':
      bg = 'secondary';
      label = 'Cancelled';
      break;
    default:
      label = status;
  }

  const isWarning = bg === 'warning';

  return (
    <Badge
      bg={bg}
      text={isWarning ? 'dark' : undefined}
      className={`fw-medium px-2 py-1 ${size === 'sm' ? 'text-xs' : ''}`}
    >
      {label}
    </Badge>
  );
};
