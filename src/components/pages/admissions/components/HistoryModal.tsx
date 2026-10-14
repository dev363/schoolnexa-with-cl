import React from 'react';
import { Modal, Table, Button, Badge } from 'react-bootstrap';
import { Enrollment } from '../types';
import { StatusBadge } from './StatusBadge';
import { useNavigate } from 'react-router-dom';

interface HistoryModalProps {
  show: boolean;
  enrollment: Enrollment | null;
  historyList: Enrollment[];
  onHide: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  show,
  enrollment,
  historyList,
  onHide,
}) => {
  const navigate = useNavigate();

  if (!enrollment) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="py-2">
        <Modal.Title className="h6 mb-0">
          Academic Enrollment History — {enrollment.studentName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3">
        <div className="bg-body-tertiary p-2 rounded border mb-3 small d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <span className="text-muted">Student Code:</span>{' '}
            <strong className="font-monospace">{enrollment.studentCode}</strong>
          </div>
          <div>
            <span className="text-muted">Permanent ID:</span>{' '}
            <code className="text-muted">{enrollment.studentId}</code>
          </div>
          <div>
            <span className="text-muted">Total Recorded Enrollments:</span>{' '}
            <Badge bg="primary">{historyList.length}</Badge>
          </div>
        </div>

        <p className="text-muted small mb-2">
          A single student possesses multiple enrollment records over time across academic sessions:
        </p>

        <div className="table-responsive border rounded">
          <Table hover className="align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th>Academic Year</th>
                <th>Class</th>
                <th>Section</th>
                <th>Enrollment ID</th>
                <th>Admission No.</th>
                <th>Roll No.</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((hist) => {
                const isCurrent = hist.enrollmentId === enrollment.enrollmentId;

                return (
                  <tr key={hist.id} className={isCurrent ? 'table-primary-subtle' : undefined}>
                    <td className="fw-semibold">
                      {hist.academicYearName}
                      {isCurrent && (
                        <Badge bg="primary" className="ms-1 text-xs">
                          Current
                        </Badge>
                      )}
                    </td>
                    <td>{hist.className}</td>
                    <td>{hist.sectionName}</td>
                    <td className="font-monospace fw-bold text-primary">{hist.enrollmentId}</td>
                    <td className="font-monospace text-muted">{hist.admissionNumber || '—'}</td>
                    <td>{hist.rollNumber || '—'}</td>
                    <td>
                      <StatusBadge status={hist.status} size="sm" />
                    </td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-decoration-none small"
                        onClick={() => {
                          onHide();
                          navigate(`/admissions/view/${hist.enrollmentId}`);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer className="py-2">
        <Button variant="secondary" size="sm" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
