import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { Archive, AlertTriangle } from 'lucide-react';
import { StudentItem } from '../types';
import { useTheme } from '@/context/ThemeContext';

interface BulkArchiveModalProps {
  show: boolean;
  selectedStudents: StudentItem[];
  onHide: () => void;
  onConfirm: () => void;
}

export const BulkArchiveModal: React.FC<BulkArchiveModalProps> = ({
  show,
  selectedStudents,
  onHide,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const count = selectedStudents.length;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName={isDark ? 'bg-dark text-white border-secondary' : ''}
    >
      <Modal.Header closeButton closeVariant={isDark ? 'white' : undefined}>
        <Modal.Title className="h5 d-flex align-items-center gap-2">
          <Archive size={18} className="text-warning" />
          <span>Archive Selected Students</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-3">
          Are you sure you want to archive <strong>{count}</strong> selected student
          {count > 1 ? 's' : ''}?
        </p>

        {/* Selected preview */}
        <div
          className={`p-2.5 rounded border small mb-3 ${
            isDark ? 'bg-secondary bg-opacity-25 border-secondary' : 'bg-light border-light-subtle'
          }`}
          style={{ maxHeight: '120px', overflowY: 'auto' }}
        >
          <div className="text-muted mb-1.5 fw-medium" style={{ fontSize: '11px' }}>
            Records to archive ({count}):
          </div>
          <div className="d-flex flex-wrap gap-1">
            {selectedStudents.slice(0, 10).map((s) => (
              <span
                key={s.id}
                className={`badge font-normal px-2 py-1 ${
                  isDark ? 'bg-secondary text-light' : 'bg-white text-dark border'
                }`}
                style={{ fontSize: '11.5px' }}
              >
                {s.firstName} {s.lastName}
              </span>
            ))}
            {count > 10 && (
              <span className="badge bg-secondary text-light align-self-center">
                +{count - 10} more
              </span>
            )}
          </div>
        </div>

        <Alert variant="warning" className="py-2 px-3 small d-flex align-items-start gap-2 mb-0">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-warning" />
          <span>
            Archived students will be marked as inactive and removed from active classroom rosters,
            while preserving their historical grades and attendance records.
          </span>
        </Alert>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="warning" size="sm" onClick={onConfirm}>
          Archive
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
