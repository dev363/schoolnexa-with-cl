import React, { useState } from 'react';
import { Modal, Alert, Row, Col, Card, Button, Stack, Badge } from 'react-bootstrap';
import { Send, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { TimetableQualityReport } from '@/services/timetable/types';

interface SavePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  quality: TimetableQualityReport;
  totalClasses: number;
  totalTeachers: number;
  totalEntries: number;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export const SavePublishModal: React.FC<SavePublishModalProps> = ({
  isOpen,
  onClose,
  quality,
  totalClasses,
  totalTeachers,
  totalEntries,
  onSaveDraft,
  onPublish,
}) => {
  const [activeTab, setActiveTab] = useState<'PUBLISH' | 'DRAFT'>('PUBLISH');

  const hasConflicts = quality.hardConflicts > 0;

  return (
    <Modal show={isOpen} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <div
            className="rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center p-1.5"
            style={{ width: '32px', height: '32px' }}
          >
            <Send size={16} />
          </div>
          <div>
            <div className="h6 fw-bold mb-0">Save & Publish Timetable</div>
            <div className="text-muted small fw-normal" style={{ fontSize: '0.75rem' }}>
              Choose whether to publish live or keep as draft.
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-3 d-flex flex-column gap-3">
        {/* Quality status summary */}
        <Alert
          variant={hasConflicts ? 'danger' : 'success'}
          className="d-flex align-items-center justify-content-between py-2 px-3 small mb-0"
        >
          <div className="d-flex align-items-center gap-2 fw-semibold">
            {hasConflicts ? (
              <AlertTriangle size={16} className="shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="shrink-0" />
            )}
            <span>
              {hasConflicts
                ? `${quality.hardConflicts} conflict(s) detected.`
                : 'Zero clashes detected. Ready for publication.'}
            </span>
          </div>
          <span className="font-monospace fw-bold">{totalEntries} periods scheduled</span>
        </Alert>

        {/* Options Cards */}
        <Row className="g-3">
          <Col md={6}>
            <Card
              onClick={() => setActiveTab('PUBLISH')}
              className={`h-100 p-3 transition-all ${
                activeTab === 'PUBLISH'
                  ? 'border-primary bg-primary-subtle bg-opacity-25 shadow-sm'
                  : 'border bg-body'
              }`}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center gap-2 mb-1">
                <Send size={16} className="text-primary" />
                <span className="small fw-bold">Save & Publish</span>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
                Makes timetable immediately active for all students, parents, and teachers across
                the ERP.
              </p>
            </Card>
          </Col>

          <Col md={6}>
            <Card
              onClick={() => setActiveTab('DRAFT')}
              className={`h-100 p-3 transition-all ${
                activeTab === 'DRAFT'
                  ? 'border-primary bg-primary-subtle bg-opacity-25 shadow-sm'
                  : 'border bg-body'
              }`}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center gap-2 mb-1">
                <FileText size={16} className="text-secondary" />
                <span className="small fw-bold">Save as Draft</span>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
                Save your progress privately to review or edit later without notifying teachers or
                students.
              </p>
            </Card>
          </Col>
        </Row>

        {/* Details based on selection */}
        {activeTab === 'PUBLISH' ? (
          <div className="p-3 bg-body-tertiary rounded border small text-muted">
            <div className="fw-semibold text-body d-flex align-items-center gap-1.5 mb-2">
              <ShieldCheck size={16} className="text-primary" />
              <span>Publication Impact:</span>
            </div>
            <ul className="mb-0 ps-3 space-y-1">
              <li>
                Applies to <strong>{totalClasses} sections</strong> and{' '}
                <strong>{totalTeachers} faculty members</strong>
              </li>
              <li>Replaces previously published timetable entries for this academic session</li>
              <li>Visible on Teacher and Student daily portals</li>
            </ul>
          </div>
        ) : (
          <div className="p-3 bg-body-tertiary rounded border small text-muted">
            <p className="mb-0">
              Your timetable draft will be saved safely in SchoolNexa. You can resume editing
              anytime from the Timetable Management view.
            </p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="py-2 d-flex justify-content-between">
        <Button variant="outline-secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>

        {activeTab === 'PUBLISH' ? (
          <Button
            id="btn-confirm-publish"
            variant="primary"
            size="sm"
            onClick={() => {
              onPublish();
              onClose();
            }}
            className="d-inline-flex align-items-center gap-1.5 fw-bold"
          >
            <Send size={14} />
            <span>Publish Timetable</span>
          </Button>
        ) : (
          <Button
            id="btn-confirm-draft"
            variant="secondary"
            size="sm"
            onClick={() => {
              onSaveDraft();
              onClose();
            }}
            className="d-inline-flex align-items-center gap-1.5 fw-bold"
          >
            <FileText size={14} />
            <span>Save as Draft</span>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};
