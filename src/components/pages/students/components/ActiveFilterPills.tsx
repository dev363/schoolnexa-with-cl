import React from 'react';
import { Button } from 'react-bootstrap';
import { X, RotateCcw } from 'lucide-react';
import { StudentFilterState } from '../types';
import {
  STUDENT_STATUS,
  GENDERS,
  ADMISSION_TYPES,
  BLOOD_GROUPS,
  SOCIAL_CATEGORIES,
  ADMISSION_STATUS_OPTIONS,
  GUARDIAN_STATUS_OPTIONS,
  SPECIAL_NEED_FILTER_OPTIONS,
  STUDENT_SORT_OPTIONS,
  getOptionLabel,
} from '@/config/Options';
import { useTheme } from '@/context/ThemeContext';

interface ActiveFilterPillsProps {
  filters: StudentFilterState;
  onChange: (newFilters: Partial<StudentFilterState>) => void;
  onClear: () => void;
}

interface ActivePill {
  key: keyof StudentFilterState;
  label: string;
  valueText: string;
  resetValue: any;
}

export const ActiveFilterPills: React.FC<ActiveFilterPillsProps> = ({
  filters,
  onChange,
  onClear,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const pills: ActivePill[] = [];

  if (filters.searchQuery.trim()) {
    pills.push({
      key: 'searchQuery',
      label: 'Search',
      valueText: `"${filters.searchQuery}"`,
      resetValue: '',
    });
  }

  if (filters.currentClass !== 'ALL') {
    pills.push({
      key: 'currentClass',
      label: 'Class',
      valueText: filters.currentClass === 'UNASSIGNED' ? 'Unassigned' : filters.currentClass,
      resetValue: 'ALL',
    });
  }

  if (filters.currentSection !== 'ALL') {
    pills.push({
      key: 'currentSection',
      label: 'Section',
      valueText: filters.currentSection,
      resetValue: 'ALL',
    });
  }

  if (filters.status !== 'ALL') {
    pills.push({
      key: 'status',
      label: 'Status',
      valueText: getOptionLabel(STUDENT_STATUS, filters.status),
      resetValue: 'ALL',
    });
  }

  if (filters.gender !== 'ALL') {
    pills.push({
      key: 'gender',
      label: 'Gender',
      valueText: getOptionLabel(GENDERS, filters.gender),
      resetValue: 'ALL',
    });
  }

  if (filters.admissionType !== 'ALL') {
    pills.push({
      key: 'admissionType',
      label: 'Type',
      valueText: getOptionLabel(ADMISSION_TYPES, filters.admissionType),
      resetValue: 'ALL',
    });
  }

  if (filters.admissionStatus !== 'ALL') {
    pills.push({
      key: 'admissionStatus',
      label: 'Enrollment',
      valueText: getOptionLabel(ADMISSION_STATUS_OPTIONS, filters.admissionStatus),
      resetValue: 'ALL',
    });
  }

  if (filters.bloodGroup !== 'ALL') {
    pills.push({
      key: 'bloodGroup',
      label: 'Blood',
      valueText: getOptionLabel(BLOOD_GROUPS, filters.bloodGroup),
      resetValue: 'ALL',
    });
  }

  if (filters.specialCategory !== 'ALL') {
    pills.push({
      key: 'specialCategory',
      label: 'Special Need',
      valueText: getOptionLabel(SPECIAL_NEED_FILTER_OPTIONS, filters.specialCategory),
      resetValue: 'ALL',
    });
  }

  if (filters.category !== 'ALL') {
    pills.push({
      key: 'category',
      label: 'Category',
      valueText: getOptionLabel(SOCIAL_CATEGORIES, filters.category),
      resetValue: 'ALL',
    });
  }

  if (filters.guardianStatus !== 'ALL') {
    pills.push({
      key: 'guardianStatus',
      label: 'Guardian',
      valueText: getOptionLabel(GUARDIAN_STATUS_OPTIONS, filters.guardianStatus),
      resetValue: 'ALL',
    });
  }

  if (filters.academicYear !== 'ALL') {
    pills.push({
      key: 'academicYear',
      label: 'Year',
      valueText: filters.academicYear,
      resetValue: 'ALL',
    });
  }

  if (filters.sortBy && filters.sortBy !== 'name_asc') {
    pills.push({
      key: 'sortBy',
      label: 'Sort',
      valueText: getOptionLabel(STUDENT_SORT_OPTIONS, filters.sortBy),
      resetValue: 'name_asc',
    });
  }

  if (pills.length === 0) return null;

  return (
    <div className="d-flex align-items-center flex-wrap gap-1.5 pt-2 border-top border-opacity-25 mt-2">
      <span className="text-muted small me-1 fw-medium" style={{ fontSize: '11px' }}>
        Active filters ({pills.length}):
      </span>
      {pills.map((pill) => (
        <span
          key={pill.key}
          className={`d-inline-flex align-items-center gap-1 px-2 py-0.5 rounded-pill small border ${
            isDark
              ? 'bg-secondary bg-opacity-25 text-light border-secondary'
              : 'bg-light text-dark border-secondary-subtle'
          }`}
          style={{ fontSize: '11.5px' }}
        >
          <span className="text-muted">{pill.label}:</span>
          <span className="fw-semibold">{pill.valueText}</span>
          <button
            type="button"
            className="btn btn-link p-0 text-muted ms-0.5 d-inline-flex align-items-center hover:text-danger"
            onClick={() => onChange({ [pill.key]: pill.resetValue })}
            title={`Remove ${pill.label} filter`}
            aria-label={`Remove ${pill.label} filter`}
          >
            <X size={12} />
          </button>
        </span>
      ))}

      <Button
        variant="link"
        size="sm"
        onClick={onClear}
        className="p-0 text-decoration-none text-danger small ms-1 d-inline-flex align-items-center gap-1"
        style={{ fontSize: '11.5px' }}
      >
        <RotateCcw size={11} />
        <span>Reset all</span>
      </Button>
    </div>
  );
};
