import React from 'react';
import { Badge } from 'react-bootstrap';
import { TeacherStatus } from '@/components/pages/teachers/types';

interface TeacherStatusBadgeProps {
  status: TeacherStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const TeacherStatusBadge: React.FC<TeacherStatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const getVariantAndLabel = (): { bg: string; text?: string; label: string } => {
    switch (status) {
      case 'ACTIVE':
        return { bg: 'success', label: 'Active' };
      case 'INACTIVE':
        return { bg: 'secondary', label: 'Inactive' };
      case 'SUSPENDED':
        return { bg: 'warning', text: 'dark', label: 'Suspended' };
      case 'RESIGNED':
        return { bg: 'dark', label: 'Resigned' };
      case 'RETIRED':
        return { bg: 'info', text: 'dark', label: 'Retired' };
      case 'TERMINATED':
        return { bg: 'danger', label: 'Terminated' };
      default:
        return { bg: 'secondary', label: status };
    }
  };

  const { bg, text, label } = getVariantAndLabel();

  return (
    <Badge
      bg={bg}
      text={text}
      className={`fw-normal ${size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'} ${className}`}
      style={{ fontSize: size === 'sm' ? '0.75rem' : '0.8rem' }}
    >
      {label}
    </Badge>
  );
};

export const StatusBadge = TeacherStatusBadge;
export default TeacherStatusBadge;

