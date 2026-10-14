import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';
import { Teacher } from '@/components/pages/teachers/types';

interface DeactivateTeacherModalProps {
  show: boolean;
  teacher: Teacher | null;
  onHide: () => void;
  onConfirm: (teacherId: string, reason: string) => void;
}

export const DeactivateTeacherModal: React.FC<DeactivateTeacherModalProps> = ({
  show,
  teacher,
  onHide,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');

  if (!teacher) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(teacher.teacherId, reason);
    setReason('');
  };

  const fullName = `${teacher.firstName} ${teacher.lastName || ''}`.trim();

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold text-danger d-flex align-items-center gap-2">
            <AlertTriangle size={18} />
            <span>Deactivate Teacher</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="py-3">
          <Alert variant="warning" className="small mb-3 py-2">
            <strong>Note:</strong> Deactivating will set this teacher's status to{' '}
            <strong>Inactive</strong>. Their permanent master record, historical assignments, and
            timetable records will be preserved.
          </Alert>

          <p className="mb-2" style={{ fontSize: '0.9rem' }}>
            Are you sure you want to deactivate <strong>{fullName}</strong> (
            <span className="font-monospace text-primary">{teacher.teacherId}</span>)?
          </p>

          <Form.Group className="mt-3">
            <Form.Label className="small text-muted mb-1">
              Reason for Deactivation (Optional)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="e.g. Sabbatical, transfer, medical leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="small"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="py-2">
          <Button variant="outline-secondary" size="sm" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" type="submit">
            Deactivate Teacher
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
