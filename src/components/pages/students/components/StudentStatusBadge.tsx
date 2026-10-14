import React from 'react';
import { Badge } from 'react-bootstrap';
import { StudentStatus } from '../types';

interface StudentStatusBadgeProps {
  status: StudentStatus;
  className?: string;
}

export const StudentStatusBadge: React.FC<StudentStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const isActive = status === 'ACTIVE';

  return (
    <Badge
      bg={isActive ? 'success' : 'secondary'}
      className={`px-2.5 py-1 text-xs font-medium rounded-pill d-inline-flex align-items-center gap-1.5 ${className}`}
    >
      <span
        className={`d-inline-block rounded-circle ${isActive ? 'bg-white' : 'bg-light'}`}
        style={{ width: '6px', height: '6px' }}
      />
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
};
