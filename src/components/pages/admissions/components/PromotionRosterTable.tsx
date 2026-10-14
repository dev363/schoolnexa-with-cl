import React from 'react';
import { Card, Table, Button, Form, Badge, Row, Col } from 'react-bootstrap';
import { Eye, TrendingUp, CheckCircle } from 'lucide-react';
import { Enrollment } from '../types';
import { StatusBadge } from './StatusBadge';

interface RosterProps {
  candidates: Array<{
    enrollment: Enrollment;
    targetSection: string;
    targetRollNumber?: string;
    alreadyEnrolledInTarget?: boolean;
    existingTargetEnrollmentId?: string;
  }>;
  selectedIds: string[];
  targetClass: string;
  targetYear: string;
  availableSections: string[];
  onToggleSelect: (enrollmentId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onUpdateTargetSection: (enrollmentId: string, section: string) => void;
  onUpdateTargetRollNumber: (enrollmentId: string, roll: string) => void;
  onSetGlobalTargetSection: (section: string) => void;
  onOpenPreview: () => void;
}

export const PromotionRosterTable: React.FC<RosterProps> = ({
  candidates,
  selectedIds,
  targetClass,
  targetYear,
  availableSections,
  onToggleSelect,
  onSelectAll,
  onClearAll,
  onUpdateTargetSection,
  onUpdateTargetRollNumber,
  onSetGlobalTargetSection,
  onOpenPreview,
}) => {
  const allEligibleIds = candidates
    .filter((c) => !c.alreadyEnrolledInTarget)
    .map((c) => c.enrollment.enrollmentId);

  const allSelected =
    allEligibleIds.length > 0 && allEligibleIds.every((id) => selectedIds.includes(id));
  const someSelected = allEligibleIds.some((id) => selectedIds.includes(id)) && !allSelected;

  return (
    <Card className="border shadow-none mb-3">
      <Card.Header className="bg-body-tertiary py-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="small fw-semibold">
            Step 2: Select Students & Allocate Target Roster
          </span>
          <Badge bg="primary" className="fw-normal">
            {candidates.length} Students Loaded
          </Badge>
          {selectedIds.length > 0 && (
            <Badge bg="success" className="fw-medium">
              Selected: {selectedIds.length} Student{selectedIds.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Global batch section allocation shortcut */}
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Batch Target Section:</span>
          <Form.Select
            size="sm"
            style={{ width: '130px' }}
            onChange={(e) => onSetGlobalTargetSection(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Set for selected
            </option>
            {availableSections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </Form.Select>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th style={{ width: '40px' }} className="text-center px-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={() => (allSelected ? onClearAll() : onSelectAll())}
                    aria-label="Select all eligible students"
                  />
                </th>
                <th>Student Code</th>
                <th>Student Name</th>
                <th>Current Class & Section</th>
                <th>Current Enrollment ID</th>
                <th>Current Status</th>
                <th>Target Class</th>
                <th style={{ width: '150px' }}>Target Section</th>
                <th style={{ width: '110px' }}>New Roll No.</th>
                <th>Target Eligibility</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-muted">
                    No active student enrollments found matching the criteria.
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => {
                  const isSelected = selectedIds.includes(cand.enrollment.enrollmentId);
                  const isBlocked = cand.alreadyEnrolledInTarget;

                  return (
                    <tr
                      key={cand.enrollment.id}
                      className={
                        isBlocked
                          ? 'table-secondary opacity-75'
                          : isSelected
                            ? 'table-primary-subtle'
                            : undefined
                      }
                    >
                      <td className="text-center px-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          disabled={isBlocked}
                          checked={isSelected}
                          onChange={() => onToggleSelect(cand.enrollment.enrollmentId)}
                          aria-label={`Select ${cand.enrollment.studentName}`}
                        />
                      </td>
                      <td className="font-monospace text-muted small">
                        {cand.enrollment.studentCode}
                      </td>
                      <td className="fw-semibold">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-body-tertiary border text-primary d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}
                          >
                            {cand.enrollment.studentName.charAt(0)}
                          </div>
                          <span>{cand.enrollment.studentName}</span>
                        </div>
                      </td>
                      <td>
                        {cand.enrollment.className} ({cand.enrollment.sectionName})
                      </td>
                      <td className="font-monospace fw-bold text-primary small">
                        {cand.enrollment.enrollmentId}
                      </td>
                      <td>
                        <StatusBadge status={cand.enrollment.status} size="sm" />
                      </td>
                      <td className="fw-bold text-success">{targetClass}</td>
                      <td>
                        <Form.Select
                          size="sm"
                          disabled={isBlocked}
                          value={cand.targetSection}
                          onChange={(e) =>
                            onUpdateTargetSection(cand.enrollment.enrollmentId, e.target.value)
                          }
                        >
                          {availableSections.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          size="sm"
                          disabled={isBlocked}
                          placeholder="Auto / #"
                          value={cand.targetRollNumber || ''}
                          onChange={(e) =>
                            onUpdateTargetRollNumber(cand.enrollment.enrollmentId, e.target.value)
                          }
                        />
                      </td>
                      <td>
                        {isBlocked ? (
                          <Badge bg="secondary" className="text-xs">
                            Already Enrolled ({cand.existingTargetEnrollmentId})
                          </Badge>
                        ) : (
                          <Badge bg="success" className="text-xs">
                            Eligible for AY {targetYear}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>

      <Card.Footer className="bg-body py-2 d-flex flex-wrap align-items-center justify-content-between gap-2 border-top">
        <div className="small text-muted">
          Selected <strong>{selectedIds.length}</strong> of <strong>{allEligibleIds.length}</strong>{' '}
          eligible student(s).
        </div>

        <Button
          variant="success"
          size="sm"
          className="d-flex align-items-center gap-1"
          disabled={selectedIds.length === 0}
          onClick={onOpenPreview}
        >
          <TrendingUp size={14} />
          <span>Preview Promotion ({selectedIds.length})</span>
        </Button>
      </Card.Footer>
    </Card>
  );
};
