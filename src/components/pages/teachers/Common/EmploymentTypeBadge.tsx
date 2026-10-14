import React from 'react';
import { Badge } from 'react-bootstrap';
import { EmploymentType } from '@/components/pages/teachers/types';

interface EmploymentTypeBadgeProps {
  type: EmploymentType;
  className?: string;
}

export const EmploymentTypeBadge: React.FC<EmploymentTypeBadgeProps> = ({
  type,
  className = '',
}) => {
  const getConfig = (): { bg: string; text?: string; label: string } => {
    switch (type) {
      case 'FULL_TIME':
        return { bg: 'primary', label: 'Full Time' };
      case 'PART_TIME':
        return { bg: 'info', text: 'dark', label: 'Part Time' };
      case 'CONTRACT':
        return { bg: 'warning', text: 'dark', label: 'Contract' };
      case 'VISITING':
        return { bg: 'secondary', label: 'Visiting' };
      case 'GUEST':
        return { bg: 'light', text: 'dark', label: 'Guest' };
      case 'TEMPORARY':
        return { bg: 'dark', label: 'Temporary' };
      default:
        return { bg: 'light', text: 'dark', label: type };
    }
  };

  const { bg, text, label } = getConfig();

  return (
    <Badge
      bg={bg}
      text={text}
      className={`fw-normal border ${className}`}
      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
    >
      {label}
    </Badge>
  );
};
