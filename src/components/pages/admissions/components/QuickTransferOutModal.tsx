import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { Enrollment } from '../types';

interface TransferOutModalProps {
  show: boolean;
  enrollment: Enrollment | null;
  onHide: () => void;
  onConfirm: (payload: {
    enrollmentId: string;
    transferDate: string;
    transferReason: string;
    transferCertificateNumber?: string;
    remarks?: string;
  }) => void;
}

export const QuickTransferOutModal: React.FC<TransferOutModalProps> = ({
  show,
  enrollment,
  onHide,
  onConfirm,
}) => {
  const [formData, setFormData] = useState({
    transferDate: new Date().toISOString().split('T')[0],
    transferReason: 'Family relocation / parent transfer',
    transferCertificateNumber: `TC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    remarks: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!enrollment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onConfirm({
      enrollmentId: enrollment.enrollmentId,
      transferDate: formData.transferDate,
      transferReason: formData.transferReason,
      transferCertificateNumber: formData.transferCertificateNumber,
      remarks: formData.remarks,
    });
    setIsSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="py-2">
        <Modal.Title className="h6 mb-0 d-flex align-items-center gap-2 text-danger">
          <ArrowLeftRight size={16} />
          <span>Transfer Student Out</span>
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-3">
          <Alert variant="warning" className="small py-2 mb-3 d-flex align-items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              Transferring out marks this enrollment record as <strong>TRANSFERRED</strong>. The
              student profile and all historical records are safely retained.
            </div>
          </Alert>

          {/* Student & Enrollment Info Card */}
          <div className="bg-body-tertiary p-2 rounded border mb-3 small">
            <Row className="g-2">
              <Col xs={6}>
                <span className="text-muted">Student:</span>{' '}
                <strong>{enrollment.studentName}</strong>
              </Col>
              <Col xs={6}>
                <span className="text-muted">Student Code:</span>{' '}
                <span className="font-monospace fw-semibold">{enrollment.studentCode}</span>
              </Col>
              <Col xs={6}>
                <span className="text-muted">Current Enrollment:</span>{' '}
                <span className="font-monospace text-primary fw-bold">
                  {enrollment.enrollmentId}
                </span>
              </Col>
              <Col xs={6}>
                <span className="text-muted">Class & Section:</span>{' '}
                <strong>
                  {enrollment.className} ({enrollment.sectionName})
                </strong>
              </Col>
            </Row>
          </div>

          <Form.Group className="mb-2">
            <Form.Label className="small fw-medium mb-1">
              Transfer Effective Date <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              size="sm"
              required
              value={formData.transferDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, transferDate: e.target.value }))}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="small fw-medium mb-1">
              Transfer Reason <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              size="sm"
              required
              value={formData.transferReason}
              onChange={(e) => setFormData((prev) => ({ ...prev, transferReason: e.target.value }))}
            >
              <option value="Family relocation / parent transfer">
                Family relocation / parent transfer
              </option>
              <option value="Admission into another institution">
                Admission into another institution
              </option>
              <option value="Boarding school placement">Boarding school placement</option>
              <option value="International relocation">International relocation</option>
              <option value="Personal / Medical reasons">Personal / Medical reasons</option>
              <option value="Course completion">Course completion</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="small fw-medium mb-1">
              Transfer Certificate (TC) Number
            </Form.Label>
            <Form.Control
              type="text"
              size="sm"
              placeholder="e.g. TC-2026-489"
              value={formData.transferCertificateNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, transferCertificateNumber: e.target.value }))
              }
            />
          </Form.Group>

          <Form.Group className="mb-0">
            <Form.Label className="small fw-medium mb-1">Destination School / Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              size="sm"
              placeholder="Optional destination school name or remarks"
              value={formData.remarks}
              onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="py-2">
          <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Confirm Transfer Out'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
