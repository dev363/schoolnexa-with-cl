import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { UserCheck, AlertCircle } from 'lucide-react';
import { StudentItem, StudentStatus } from '../types';
import { STUDENT_STATUS } from '@/config/Options';
import { useTheme } from '@/context/ThemeContext';

interface BulkStatusModalProps {
  show: boolean;
  selectedStudents: StudentItem[];
  onHide: () => void;
  onConfirm: (newStatus: StudentStatus) => void;
}

export const BulkStatusModal: React.FC<BulkStatusModalProps> = ({
  show,
  selectedStudents,
  onHide,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [targetStatus, setTargetStatus] = useState<StudentStatus>('ACTIVE');

  const count = selectedStudents.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(targetStatus);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName={isDark ? 'bg-dark text-white border-secondary' : ''}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton closeVariant={isDark ? 'white' : undefined}>
          <Modal.Title className="h5 d-flex align-items-center gap-2">
            <UserCheck size={18} className="text-primary" />
            <span>Update Student Status</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-muted small mb-3">
            Change enrollment or operational status for{' '}
            <strong className="text-body">{count}</strong> selected student{count > 1 ? 's' : ''}.
          </p>

          <Form.Group controlId="bulk-status-select" className="mb-3">
            <Form.Label className="small fw-semibold mb-1">New Status</Form.Label>
            <Form.Select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as StudentStatus)}
              className={isDark ? 'bg-dark text-white border-secondary' : ''}
              autoFocus
            >
              {STUDENT_STATUS.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Student Names Preview */}
          <div
            className={`p-2.5 rounded border small mb-3 ${
              isDark
                ? 'bg-secondary bg-opacity-25 border-secondary'
                : 'bg-light border-light-subtle'
            }`}
            style={{ maxHeight: '130px', overflowY: 'auto' }}
          >
            <div className="text-muted mb-1.5 fw-medium" style={{ fontSize: '11px' }}>
              Selected records ({count}):
            </div>
            <div className="d-flex flex-wrap gap-1">
              {selectedStudents.slice(0, 8).map((s) => (
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
              {count > 8 && (
                <span className="badge bg-secondary text-light align-self-center">
                  +{count - 8} more
                </span>
              )}
            </div>
          </div>

          <Alert variant="info" className="py-2 px-3 small d-flex align-items-start gap-2 mb-0">
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
            <span>
              Setting status to <strong>{targetStatus}</strong> will immediately affect active
              attendance and grade rosters.
            </span>
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Update Status
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
