import React from 'react';
import { Button, Dropdown, ButtonGroup, Badge } from 'react-bootstrap';
import { CheckSquare, UserCheck, GraduationCap, Archive, X, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface StudentBulkActionBarProps {
  selectedCount: number;
  totalFilteredCount: number;
  allFilteredSelected: boolean;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
  onOpenStatusModal: () => void;
  onOpenAssignClassModal: () => void;
  onOpenArchiveModal: () => void;
  onQuickStatusChange?: (status: 'ACTIVE' | 'INACTIVE') => void;
}

export const StudentBulkActionBar: React.FC<StudentBulkActionBarProps> = ({
  selectedCount,
  totalFilteredCount,
  allFilteredSelected,
  onSelectAllFiltered,
  onClearSelection,
  onOpenStatusModal,
  onOpenAssignClassModal,
  onOpenArchiveModal,
  onQuickStatusChange,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (selectedCount === 0) return null;

  return (
    <div
      className={`d-flex flex-wrap align-items-center justify-content-between gap-2 p-2 px-3 rounded border mb-3 transition-all ${
        isDark
          ? 'bg-primary bg-opacity-15 border-primary border-opacity-30 text-white'
          : 'bg-primary-subtle border-primary-subtle text-primary-emphasis'
      }`}
    >
      {/* Selection Summary & Quick Select/Deselect */}
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <div className="d-flex align-items-center gap-1.5 fw-semibold text-sm">
          <CheckSquare size={16} className="text-primary" />
          <span>
            <Badge bg="primary" className="me-1 px-2 py-1">
              {selectedCount}
            </Badge>
            student{selectedCount > 1 ? 's' : ''} selected
          </span>
        </div>

        {!allFilteredSelected && totalFilteredCount > selectedCount && (
          <Button
            variant="link"
            size="sm"
            onClick={onSelectAllFiltered}
            className="p-0 text-decoration-none small text-primary fw-medium"
            style={{ fontSize: '12px' }}
          >
            Select all {totalFilteredCount} displayed
          </Button>
        )}

        <Button
          variant="link"
          size="sm"
          onClick={onClearSelection}
          className="p-0 text-decoration-none small text-muted hover:text-danger d-inline-flex align-items-center gap-0.5 ms-1"
          style={{ fontSize: '12px' }}
        >
          <X size={13} />
          <span>Clear</span>
        </Button>
      </div>

      {/* Bulk Action Controls */}
      <div className="d-flex align-items-center gap-1.5 flex-wrap">
        {/* Assign Class & Section */}
        <Button
          variant={isDark ? 'outline-light' : 'outline-primary'}
          size="sm"
          onClick={onOpenAssignClassModal}
          className="d-inline-flex align-items-center gap-1 py-1 px-2.5 shadow-none"
        >
          <GraduationCap size={14} />
          <span>Assign Class</span>
        </Button>

        {/* Update Status Dropdown */}
        <Dropdown as={ButtonGroup} size="sm">
          <Button
            variant="primary"
            onClick={onOpenStatusModal}
            className="d-inline-flex align-items-center gap-1 py-1 px-2.5"
          >
            <UserCheck size={14} />
            <span>Update Status</span>
          </Button>
          <Dropdown.Toggle split variant="primary" id="dropdown-bulk-status" />
          <Dropdown.Menu className={isDark ? 'dropdown-menu-dark' : ''} align="end">
            <Dropdown.Header className="small">Quick Status Change</Dropdown.Header>
            <Dropdown.Item
              onClick={() =>
                onQuickStatusChange ? onQuickStatusChange('ACTIVE') : onOpenStatusModal()
              }
              className="d-flex align-items-center gap-2"
            >
              <Check size={14} className="text-success" />
              <span>Mark Active</span>
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() =>
                onQuickStatusChange ? onQuickStatusChange('INACTIVE') : onOpenStatusModal()
              }
              className="d-flex align-items-center gap-2"
            >
              <X size={14} className="text-secondary" />
              <span>Mark Inactive</span>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={onOpenStatusModal}>Custom Status Details...</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {/* Archive Selected */}
        <Button
          variant={isDark ? 'outline-warning' : 'outline-danger'}
          size="sm"
          onClick={onOpenArchiveModal}
          className="d-inline-flex align-items-center gap-1 py-1 px-2.5 shadow-none"
          title="Archive selected students"
        >
          <Archive size={14} />
          <span>Archive</span>
        </Button>
      </div>
    </div>
  );
};
