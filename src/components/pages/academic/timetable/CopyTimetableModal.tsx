import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Nav, Spinner } from 'react-bootstrap';
import { Copy } from 'lucide-react';
import { AcademicYearSectionItem, DayOfWeek } from '@/types';
import { TIMETABLE_DAYS } from '@/services/academicService';

interface CopyTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: AcademicYearSectionItem | undefined;
  sections: AcademicYearSectionItem[];
  onCopySection: (targetSectionId: string) => void;
  onCopyDay: (fromDay: DayOfWeek, toDay: DayOfWeek) => void;
  isProcessing: boolean;
}

export const CopyTimetableModal: React.FC<CopyTimetableModalProps> = ({
  isOpen,
  onClose,
  currentSection,
  sections,
  onCopySection,
  onCopyDay,
  isProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'SECTION' | 'DAY'>('SECTION');
  const [targetSectionId, setTargetSectionId] = useState<string>('');
  const [fromDay, setFromDay] = useState<DayOfWeek>('MONDAY');
  const [toDay, setToDay] = useState<DayOfWeek>('TUESDAY');

  if (!currentSection) return null;

  const handleCopySection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSectionId) return;
    onCopySection(targetSectionId);
  };

  const handleCopyDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromDay === toDay) {
      alert('Source and target days must be different.');
      return;
    }
    onCopyDay(fromDay, toDay);
  };

  const otherSections = sections.filter((s) => s.id !== currentSection.id);

  return (
    <Modal show={isOpen} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="h6 mb-0 d-flex align-items-center gap-2">
          <Copy size={18} className="text-primary" />
          <div>
            <div className="fw-bold">Duplicate Timetable Schedule</div>
            <div className="text-muted small fw-normal" style={{ fontSize: '0.75rem' }}>
              Source: {currentSection.className} — Section {currentSection.sectionName}
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Tab switch: Section vs Day */}
        <Nav variant="pills" className="nav-fill mb-3" style={{ fontSize: '0.8rem' }}>
          <Nav.Item>
            <Nav.Link
              active={activeTab === 'SECTION'}
              onClick={() => setActiveTab('SECTION')}
              className="py-1"
            >
              Duplicate to Another Section
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === 'DAY'}
              onClick={() => setActiveTab('DAY')}
              className="py-1"
            >
              Duplicate Day to Day
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Tab 1: Section to Section */}
        {activeTab === 'SECTION' && (
          <Form onSubmit={handleCopySection}>
            <p className="small text-muted mb-3" style={{ fontSize: '0.8rem' }}>
              Copy all scheduled periods from{' '}
              <strong className="text-dark">
                {currentSection.className} - {currentSection.sectionName}
              </strong>{' '}
              to a target section. Any periods currently scheduled in the target will be
              overwritten.
            </p>

            <Form.Group controlId="targetSectionSelect" className="mb-2.5">
              <Form.Label className="small fw-semibold mb-1">Target Section: *</Form.Label>
              <Form.Select
                size="sm"
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                required
              >
                <option value="">-- Choose Target Section --</option>
                {otherSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.className} — Section {sec.sectionName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={!targetSectionId || isProcessing}
                className="d-inline-flex align-items-center gap-1"
              >
                {isProcessing ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-1" />
                    <span>Duplicating...</span>
                  </>
                ) : (
                  'Duplicate Schedule'
                )}
              </Button>
            </div>
          </Form>
        )}

        {/* Tab 2: Day to Day */}
        {activeTab === 'DAY' && (
          <Form onSubmit={handleCopyDay}>
            <p className="small text-muted mb-2.5" style={{ fontSize: '0.8rem' }}>
              Copy periods from one day (e.g. Monday) to another day in this section. Existing
              periods on the target day will be replaced.
            </p>

            <Row className="g-2 mb-3">
              <Col sm={6}>
                <Form.Group controlId="fromDaySelect" className="mb-2.5">
                  <Form.Label className="small fw-semibold mb-1">From Day:</Form.Label>
                  <Form.Select
                    size="sm"
                    value={fromDay}
                    onChange={(e) => setFromDay(e.target.value as DayOfWeek)}
                  >
                    {TIMETABLE_DAYS.map((d) => (
                      <option key={d.day} value={d.day}>
                        {d.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group controlId="toDaySelect" className="mb-2.5">
                  <Form.Label className="small fw-semibold mb-1">To Day:</Form.Label>
                  <Form.Select
                    size="sm"
                    value={toDay}
                    onChange={(e) => setToDay(e.target.value as DayOfWeek)}
                  >
                    {TIMETABLE_DAYS.map((d) => (
                      <option key={d.day} value={d.day}>
                        {d.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={fromDay === toDay || isProcessing}
                className="d-inline-flex align-items-center gap-1"
              >
                {isProcessing ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-1" />
                    <span>Duplicating...</span>
                  </>
                ) : (
                  'Duplicate Day Schedule'
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};
