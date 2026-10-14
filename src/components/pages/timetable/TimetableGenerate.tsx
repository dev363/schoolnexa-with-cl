import React from 'react';
import { Card, Row, Col, Badge, Alert, Button, Stack } from 'react-bootstrap';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ValidationCheckResult } from '@/services/timetable/timetableValidator';
import { TimetableSetupConfig } from '@/services/timetable/types';

interface TimetableGenerateProps {
  validation: ValidationCheckResult;
  config: TimetableSetupConfig;
  onStartGeneration: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

export const TimetableGenerate: React.FC<TimetableGenerateProps> = ({
  validation,
  config,
  onStartGeneration,
  onBack,
  isGenerating,
}) => {
  return (
    <div
      id="timetable-generate-container"
      className="d-flex flex-column gap-4 max-w-4xl mx-auto w-100"
    >
      {/* Header */}
      <Card className="shadow-sm border">
        <Card.Body className="p-4">
          <Badge
            bg="primary-subtle"
            text="primary"
            className="mb-2 d-inline-flex align-items-center gap-1"
          >
            <Sparkles size={12} />
            <span>Step 3 of 5</span>
          </Badge>
          <h2 className="h4 fw-bold mb-1">Generate School Timetable</h2>
          <p className="text-muted small mb-0">
            Everything is configured. Review your school summary and trigger the automatic
            clash-free timetable generator.
          </p>
        </Card.Body>
      </Card>

      {/* Summary Metrics Cards */}
      <Row className="g-2">
        <Col xs={6} sm={4} lg>
          <Card className="shadow-sm border text-center h-100">
            <Card.Body className="p-3">
              <div
                className="text-muted small text-uppercase fw-semibold"
                style={{ fontSize: '0.68rem' }}
              >
                Classes
              </div>
              <div className="h4 fw-bold mb-0 mt-1 font-monospace">{validation.totalClasses}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} sm={4} lg>
          <Card className="shadow-sm border text-center h-100">
            <Card.Body className="p-3">
              <div
                className="text-muted small text-uppercase fw-semibold"
                style={{ fontSize: '0.68rem' }}
              >
                Sections
              </div>
              <div className="h4 fw-bold mb-0 mt-1 font-monospace">{validation.totalSections}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} sm={4} lg>
          <Card className="shadow-sm border text-center h-100">
            <Card.Body className="p-3">
              <div
                className="text-muted small text-uppercase fw-semibold"
                style={{ fontSize: '0.68rem' }}
              >
                Teachers
              </div>
              <div className="h4 fw-bold mb-0 mt-1 font-monospace">{validation.totalTeachers}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} sm={4} lg>
          <Card className="shadow-sm border text-center h-100">
            <Card.Body className="p-3">
              <div
                className="text-muted small text-uppercase fw-semibold"
                style={{ fontSize: '0.68rem' }}
              >
                Subjects
              </div>
              <div className="h4 fw-bold mb-0 mt-1 font-monospace">{validation.totalSubjects}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} sm={4} lg>
          <Card className="shadow-sm border text-center h-100">
            <Card.Body className="p-3">
              <div
                className="text-muted small text-uppercase fw-semibold"
                style={{ fontSize: '0.68rem' }}
              >
                Working Days
              </div>
              <div className="h4 fw-bold mb-0 mt-1 font-monospace">{config.workingDays.length}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} sm={4} lg>
          <Card className="shadow-sm border text-center h-100">
            <Card.Body className="p-3">
              <div
                className="text-muted small text-uppercase fw-semibold"
                style={{ fontSize: '0.68rem' }}
              >
                Periods / Day
              </div>
              <div className="h4 fw-bold mb-0 mt-1 font-monospace">{config.periodsPerDay}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={12} lg>
          <Card className="shadow-sm border border-primary-subtle text-center h-100 bg-primary-subtle bg-opacity-25">
            <Card.Body className="p-3">
              <div
                className="text-primary small text-uppercase fw-semibold"
                style={{ fontSize: '0.68rem' }}
              >
                Weekly Slots
              </div>
              <div className="h4 fw-bold text-primary mb-0 mt-1 font-monospace">
                {validation.totalWeeklySlotsAllSections}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ready to Generate Checklist Card */}
      <Card className="shadow-sm border">
        <Card.Body className="p-4 d-flex flex-column gap-3">
          <div className="d-flex align-items-center justify-content-between">
            <h3 className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
              <ShieldCheck size={18} className="text-success" />
              <span>Pre-Generation Health Check</span>
            </h3>
            <Badge bg={validation.readyToGenerate ? 'success' : 'danger'}>
              {validation.readyToGenerate ? 'Ready to Generate ✓' : 'Action Required'}
            </Badge>
          </div>

          <Row className="g-2 pt-1">
            <Col sm={6}>
              <div className="d-flex align-items-center gap-2.5 p-2.5 rounded bg-body-tertiary border">
                {validation.checklist.classesConfigured ? (
                  <CheckCircle2 size={16} className="text-success shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-danger shrink-0" />
                )}
                <div className="small fw-medium">All classes & sections configured</div>
              </div>
            </Col>

            <Col sm={6}>
              <div className="d-flex align-items-center gap-2.5 p-2.5 rounded bg-body-tertiary border">
                {validation.checklist.subjectsAssigned ? (
                  <CheckCircle2 size={16} className="text-success shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-danger shrink-0" />
                )}
                <div className="small fw-medium">Subjects assigned to sections</div>
              </div>
            </Col>

            <Col sm={6}>
              <div className="d-flex align-items-center gap-2.5 p-2.5 rounded bg-body-tertiary border">
                {validation.checklist.teachersAssigned ? (
                  <CheckCircle2 size={16} className="text-success shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-warning shrink-0" />
                )}
                <div className="small fw-medium">Teachers assigned to subjects</div>
              </div>
            </Col>

            <Col sm={6}>
              <div className="d-flex align-items-center gap-2.5 p-2.5 rounded bg-body-tertiary border">
                {validation.checklist.weeklyPeriodsConfigured ? (
                  <CheckCircle2 size={16} className="text-success shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-danger shrink-0" />
                )}
                <div className="small fw-medium">Weekly periods configured</div>
              </div>
            </Col>

            <Col sm={12}>
              <div className="d-flex align-items-center gap-2.5 p-2.5 rounded bg-body-tertiary border">
                {validation.checklist.workloadBalanced ? (
                  <CheckCircle2 size={16} className="text-success shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-warning shrink-0" />
                )}
                <div className="small fw-medium">No obvious teacher workload conflicts</div>
              </div>
            </Col>
          </Row>

          {/* Warnings or Notes */}
          {validation.warnings.length > 0 && (
            <Alert variant="warning" className="mb-0 py-2.5 px-3 small">
              <div className="fw-bold d-flex align-items-center gap-1.5 mb-1">
                <AlertTriangle size={14} />
                <span>Notes & Suggestions:</span>
              </div>
              <ul className="mb-0 ps-3">
                {validation.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </Alert>
          )}

          {validation.errors.length > 0 && (
            <Alert variant="danger" className="mb-0 py-2.5 px-3 small">
              <div className="fw-bold d-flex align-items-center gap-1.5 mb-1">
                <AlertTriangle size={14} />
                <span>Please resolve before generating:</span>
              </div>
              <ul className="mb-0 ps-3">
                {validation.errors.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Large Primary Generate Button Card */}
      <Card className="shadow-lg border-0 bg-primary text-white text-center">
        <Card.Body className="p-5 d-flex flex-column align-items-center gap-3">
          <div style={{ maxWidth: '440px' }}>
            <h3 className="h4 fw-bold mb-1">Ready to build your timetable</h3>
            <p className="small text-white-50 mb-0">
              SchoolNexa will inspect all requirements, resolve teacher and class clashes, and
              balance periods evenly across the week.
            </p>
          </div>

          <div>
            <Button
              id="btn-trigger-generate"
              variant="light"
              size="lg"
              onClick={onStartGeneration}
              disabled={!validation.readyToGenerate || isGenerating}
              className="px-4 py-2.5 fw-bold d-inline-flex align-items-center gap-2 shadow"
            >
              <Sparkles size={18} className="text-warning" />
              <span>Generate Timetable</span>
            </Button>
          </div>

          <div
            className="small text-white-50 d-flex align-items-center justify-content-center gap-1.5"
            style={{ fontSize: '0.75rem' }}
          >
            <ShieldCheck size={14} />
            <span>
              Generates a draft preview first. Nothing is overwritten until you click Save &
              Publish.
            </span>
          </div>
        </Card.Body>
      </Card>

      {/* Footer Navigation */}
      <div className="d-flex align-items-center justify-content-between pt-2">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onBack}
          className="d-inline-flex align-items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Back to Requirements</span>
        </Button>
      </div>
    </div>
  );
};
