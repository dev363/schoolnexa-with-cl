import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Users, AlertCircle } from 'lucide-react';
import { TeacherStatus } from '@/components/pages/teachers/types';
import { TEACHER_STATUS_OPTIONS } from '@/components/pages/teachers/constants';

interface BulkTeacherActionModalProps {
  show: boolean;
  selectedCount: number;
  onHide: () => void;
  onConfirm: (targetStatus: TeacherStatus) => void;
}

export const BulkTeacherActionModal: React.FC<BulkTeacherActionModalProps> = ({
  show,
  selectedCount,
  onHide,
  onConfirm,
}) => {
  const [targetStatus, setTargetStatus] = useState<TeacherStatus>('INACTIVE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(targetStatus);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
            <Users size={18} className="text-primary" />
            <span>Update Status for {selectedCount} Teachers</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="py-3">
          <Alert variant="info" className="small mb-3 py-2">
            <AlertCircle size={15} className="me-1 inline" />
            This will update the active employment status for all {selectedCount} selected teacher
            records.
          </Alert>

          <Form.Group>
            <Form.Label className="small fw-semibold">New Status</Form.Label>
            <Form.Select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as TeacherStatus)}
            >
              {TEACHER_STATUS_OPTIONS.filter((opt) => opt.value !== 'TERMINATED').map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="py-2">
          <Button variant="outline-secondary" size="sm" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Apply Status Update
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
