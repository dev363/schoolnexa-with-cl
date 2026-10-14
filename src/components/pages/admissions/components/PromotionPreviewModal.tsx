import React from 'react';
import { Modal, Table, Button, Alert, Badge, Row, Col } from 'react-bootstrap';
import { TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Enrollment } from '../types';
import { StatusBadge } from './StatusBadge';

interface PromotionItemPreview {
  studentName: string;
  studentCode: string;
  studentId: string;
  oldEnrollmentId: string;
  oldAcademicYear: string;
  oldClass: string;
  oldSection: string;
  newAcademicYear: string;
  newClass: string;
  newSection: string;
  newRollNumber?: string;
  prospectiveEnrollmentId: string;
  status: 'PROMOTED';
}

interface PreviewModalProps {
  show: boolean;
  items: PromotionItemPreview[];
  onHide: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export const PromotionPreviewModal: React.FC<PreviewModalProps> = ({
  show,
  items,
  onHide,
  onConfirm,
  isProcessing,
}) => {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="py-2">
        <Modal.Title className="h6 mb-0 d-flex align-items-center gap-2 text-success">
          <TrendingUp size={18} />
          <span>Promotion Verification & Impact Preview ({items.length} Students)</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3">
        {/* Core Architecture Explanation */}
        <Alert variant="info" className="py-2 small mb-3">
          <div className="d-flex align-items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-info" />
            <div>
              <strong>Audit & Historical Integrity:</strong> Existing enrollment records will remain
              intact as immutable historical records. A brand new <strong>Enrollment ID</strong>{' '}
              will be provisioned for each student in the target academic year with status{' '}
              <Badge bg="success" className="ms-1">
                PROMOTED
              </Badge>
              .
            </div>
          </div>
        </Alert>

        {/* Summary Metrics Bar */}
        <div className="bg-body-tertiary p-2 rounded border mb-3">
          <Row className="g-2 text-center small">
            <Col xs={6} sm={3}>
              <span className="text-muted">Total Selected:</span>{' '}
              <strong className="h6 mb-0 d-block">{items.length}</strong>
            </Col>
            <Col xs={6} sm={3}>
              <span className="text-muted">New Enrollments:</span>{' '}
              <strong className="h6 mb-0 d-block text-success">{items.length}</strong>
            </Col>
            <Col xs={6} sm={3}>
              <span className="text-muted">Skipped:</span>{' '}
              <strong className="h6 mb-0 d-block text-muted">0</strong>
            </Col>
            <Col xs={6} sm={3}>
              <span className="text-muted">Potential Issues:</span>{' '}
              <strong className="h6 mb-0 d-block text-muted">0</strong>
            </Col>
          </Row>
        </div>

        {/* Preview Table */}
        <div className="table-responsive border rounded" style={{ maxHeight: '350px' }}>
          <Table hover className="align-middle mb-0 small">
            <thead className="table-light text-nowrap sticky-top">
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Student Code</th>
                <th>Old Enrollment</th>
                <th>Old Class / Sec</th>
                <th className="text-center">Advance</th>
                <th>New Class</th>
                <th>New Section</th>
                <th>New Roll #</th>
                <th>New Enrollment ID</th>
                <th>New Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.oldEnrollmentId}>
                  <td className="text-muted">{idx + 1}</td>
                  <td className="fw-semibold">{item.studentName}</td>
                  <td className="font-monospace text-muted">{item.studentCode}</td>
                  <td className="font-monospace text-muted small">{item.oldEnrollmentId}</td>
                  <td>
                    {item.oldClass} ({item.oldSection})
                  </td>
                  <td className="text-center text-muted">
                    <ArrowRight size={14} className="text-success" />
                  </td>
                  <td className="fw-bold text-success">{item.newClass}</td>
                  <td className="fw-semibold">{item.newSection}</td>
                  <td>{item.newRollNumber || '—'}</td>
                  <td className="font-monospace fw-bold text-primary">
                    {item.prospectiveEnrollmentId}
                  </td>
                  <td>
                    <StatusBadge status="PROMOTED" size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>

      <Modal.Footer className="py-2">
        <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={isProcessing}>
          Back & Adjust
        </Button>
        <Button
          variant="success"
          size="sm"
          onClick={onConfirm}
          disabled={isProcessing || items.length === 0}
          className="d-flex align-items-center gap-1"
        >
          <span>{isProcessing ? 'Processing Promotions...' : 'Confirm & Process Promotions'}</span>
          <ArrowRight size={14} />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
