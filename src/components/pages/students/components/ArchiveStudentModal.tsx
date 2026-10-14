import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Archive, AlertTriangle } from 'lucide-react';
import { StudentItem } from '../types';
import { useTheme } from '@/context/ThemeContext';

interface ArchiveStudentModalProps {
  show: boolean;
  student: StudentItem | null;
  onHide: () => void;
  onConfirm: (studentId: string) => void;
}

export const ArchiveStudentModal: React.FC<ArchiveStudentModalProps> = ({
  show,
  student,
  onHide,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!student) return null;

  const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;

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
          <span>Archive Student</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-3">Are you sure you want to archive this student?</p>
        <div
          className={`p-3 rounded border mb-3 ${isDark ? 'bg-secondary bg-opacity-25 border-secondary' : 'bg-light border-light-subtle'}`}
        >
          <div className="font-semibold text-base">{fullName}</div>
          <div className="text-muted small">
            Admission No:{' '}
            <span className="font-monospace fw-semibold">{student.admissionNumber}</span>
          </div>
          <div className="text-muted small">
            Student Code: <span className="font-monospace">{student.studentCode}</span>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 text-warning-emphasis small">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span>
            Archiving marks the record as inactive and retains history for legal compliance.
          </span>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="warning"
          size="sm"
          onClick={() => {
            onConfirm(student.id);
            onHide();
          }}
          className="d-inline-flex align-items-center gap-1.5"
        >
          <Archive size={14} />
          <span>Archive Student</span>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
