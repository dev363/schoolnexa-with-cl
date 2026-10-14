import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { Edit2 } from 'lucide-react';
import { Enrollment, EnrollmentStatus } from '../types';
import { identifierConfig } from '@/config/identifiers';

interface EditModalProps {
  show: boolean;
  enrollment: Enrollment | null;
  availableClasses: string[];
  availableSections: string[];
  onHide: () => void;
  onSave: (id: string, updates: Partial<Enrollment>) => void;
}

export const EditEnrollmentModal: React.FC<EditModalProps> = ({
  show,
  enrollment,
  availableClasses,
  availableSections,
  onHide,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    className: '',
    sectionName: '',
    rollNumber: '',
    admissionNumber: '',
    status: 'NEW' as EnrollmentStatus,
    remarks: '',
  });

  useEffect(() => {
    if (enrollment) {
      setFormData({
        className: enrollment.className,
        sectionName: enrollment.sectionName,
        rollNumber: enrollment.rollNumber || '',
        admissionNumber: enrollment.admissionNumber || '',
        status: enrollment.status,
        remarks: enrollment.remarks || '',
      });
    }
  }, [enrollment]);

  if (!enrollment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(enrollment.id, formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="py-2">
        <Modal.Title className="h6 mb-0 d-flex align-items-center gap-2">
          <Edit2 size={16} />
          <span>Edit Enrollment — {enrollment.enrollmentId}</span>
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-3">
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
                <span className="text-muted">Academic Year:</span>{' '}
                <span className="fw-semibold">{enrollment.academicYearName}</span>
              </Col>
              <Col xs={6}>
                <span className="text-muted">Enrollment ID:</span>{' '}
                <span className="font-monospace text-primary fw-bold">
                  {enrollment.enrollmentId}
                </span>
              </Col>
            </Row>
          </div>

          <Row className="g-2 mb-2">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">Class</Form.Label>
                <Form.Select
                  size="sm"
                  value={formData.className}
                  onChange={(e) => setFormData((prev) => ({ ...prev, className: e.target.value }))}
                >
                  {availableClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">Section</Form.Label>
                <Form.Select
                  size="sm"
                  value={formData.sectionName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sectionName: e.target.value }))
                  }
                >
                  {availableSections.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-2 mb-2">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">Roll Number</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="e.g. 15"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, rollNumber: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">Admission Number</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder={`e.g. ${identifierConfig.businessCodes.admission.examples[0]}`}
                  value={formData.admissionNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, admissionNumber: e.target.value }))
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-2">
            <Form.Label className="small fw-medium mb-1">Enrollment Status</Form.Label>
            <Form.Select
              size="sm"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value as EnrollmentStatus }))
              }
            >
              <option value="NEW">NEW (New Admission)</option>
              <option value="PROMOTED">PROMOTED (Promoted Student)</option>
              <option value="REPEAT">REPEAT (Year Repeat)</option>
              <option value="TRANSFERRED">TRANSFERRED (Transferred Out)</option>
              <option value="COMPLETED">COMPLETED (Academic Session Finished)</option>
              <option value="CANCELLED">CANCELLED (Admission Cancelled)</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-0">
            <Form.Label className="small fw-medium mb-1">Remarks</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              size="sm"
              placeholder="Internal remarks regarding this enrollment"
              value={formData.remarks}
              onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="py-2">
          <Button variant="outline-secondary" size="sm" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
