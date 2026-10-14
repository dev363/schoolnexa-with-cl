import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { GraduationCap, Info } from 'lucide-react';
import { StudentItem } from '../types';
import { useTheme } from '@/context/ThemeContext';

interface BulkAssignClassModalProps {
  show: boolean;
  selectedStudents: StudentItem[];
  availableClasses: string[];
  availableSections: string[];
  availableAcademicYears: string[];
  onHide: () => void;
  onConfirm: (assignment: {
    targetClass: string;
    targetSection: string;
    academicYear: string;
  }) => void;
}

export const BulkAssignClassModal: React.FC<BulkAssignClassModalProps> = ({
  show,
  selectedStudents,
  availableClasses,
  availableSections,
  availableAcademicYears,
  onHide,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [form, setForm] = useState({
    targetClass: availableClasses[0] || 'Class 5',
    targetSection: availableSections[0] || 'Section A',
    academicYear: availableAcademicYears[0] || '2026-2027',
  });

  useEffect(() => {
    if (show) {
      setForm({
        targetClass: availableClasses[0] || 'Class 5',
        targetSection: availableSections[0] || 'Section A',
        academicYear: availableAcademicYears[0] || '2026-2027',
      });
    }
  }, [show, availableClasses, availableSections, availableAcademicYears]);

  const count = selectedStudents.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(form);
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
            <GraduationCap size={18} className="text-primary" />
            <span>Assign Class & Section</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-muted small mb-3">
            Assign classroom cohort and division for <strong className="text-body">{count}</strong>{' '}
            selected student{count > 1 ? 's' : ''}.
          </p>

          <Row className="g-2.5 mb-3">
            {/* Target Class */}
            <Col xs={12} sm={6}>
              <Form.Group controlId="bulk-target-class">
                <Form.Label className="small fw-semibold mb-1">Target Class</Form.Label>
                <Form.Select
                  size="sm"
                  value={form.targetClass}
                  onChange={(e) => setForm((prev) => ({ ...prev, targetClass: e.target.value }))}
                  className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  required
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                  <option value="UNASSIGNED">Unassigned (Clear Class)</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Target Section */}
            <Col xs={12} sm={6}>
              <Form.Group controlId="bulk-target-section">
                <Form.Label className="small fw-semibold mb-1">Section</Form.Label>
                <Form.Select
                  size="sm"
                  value={form.targetSection}
                  onChange={(e) => setForm((prev) => ({ ...prev, targetSection: e.target.value }))}
                  className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  disabled={form.targetClass === 'UNASSIGNED'}
                >
                  {availableSections.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                  <option value="UNASSIGNED">Unassigned (No Section)</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Academic Year */}
            <Col xs={12}>
              <Form.Group controlId="bulk-academic-year">
                <Form.Label className="small fw-semibold mb-1">Academic Year</Form.Label>
                <Form.Select
                  size="sm"
                  value={form.academicYear}
                  onChange={(e) => setForm((prev) => ({ ...prev, academicYear: e.target.value }))}
                  className={isDark ? 'bg-dark text-white border-secondary' : ''}
                >
                  {availableAcademicYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Student Names Preview */}
          <div
            className={`p-2.5 rounded border small mb-3 ${
              isDark
                ? 'bg-secondary bg-opacity-25 border-secondary'
                : 'bg-light border-light-subtle'
            }`}
            style={{ maxHeight: '110px', overflowY: 'auto' }}
          >
            <div className="text-muted mb-1.5 fw-medium" style={{ fontSize: '11px' }}>
              Target students ({count}):
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
                  {s.currentClass ? (
                    <span className="opacity-75 ms-1">({s.currentClass})</span>
                  ) : null}
                </span>
              ))}
              {count > 8 && (
                <span className="badge bg-secondary text-light align-self-center">
                  +{count - 8} more
                </span>
              )}
            </div>
          </div>

          <Alert
            variant="secondary"
            className="py-2 px-3 small d-flex align-items-start gap-2 mb-0"
          >
            <Info size={15} className="mt-0.5 flex-shrink-0 text-primary" />
            <span>
              All {count} student records will be enrolled into{' '}
              <strong>{form.targetClass === 'UNASSIGNED' ? 'Unassigned' : form.targetClass}</strong>
              {form.targetClass !== 'UNASSIGNED' && form.targetSection !== 'UNASSIGNED' && (
                <span> ({form.targetSection})</span>
              )}{' '}
              for the <strong>{form.academicYear}</strong> academic term.
            </span>
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Assign
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
