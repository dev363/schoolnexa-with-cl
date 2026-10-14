import React from 'react';
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react';

interface CriteriaProps {
  sourceYear: string;
  targetYear: string;
  sourceClass: string;
  targetClass: string;
  selectedSections: string[];
  availableYears: string[];
  availableClasses: string[];
  availableSections: string[];
  onSourceYearChange: (y: string) => void;
  onTargetYearChange: (y: string) => void;
  onSourceClassChange: (c: string) => void;
  onTargetClassChange: (c: string) => void;
  onToggleSection: (s: string) => void;
  onSelectAllSections: () => void;
  onLoadRoster: () => void;
  isLoading: boolean;
}

export const PromotionCriteriaForm: React.FC<CriteriaProps> = ({
  sourceYear,
  targetYear,
  sourceClass,
  targetClass,
  selectedSections,
  availableYears,
  availableClasses,
  availableSections,
  onSourceYearChange,
  onTargetYearChange,
  onSourceClassChange,
  onTargetClassChange,
  onToggleSection,
  onSelectAllSections,
  onLoadRoster,
  isLoading,
}) => {
  const isSameYear = sourceYear === targetYear;

  return (
    <Card className="border shadow-none mb-3">
      <Card.Header className="bg-body-tertiary py-2">
        <span className="small fw-semibold d-flex align-items-center gap-1">
          <TrendingUp size={15} className="text-success" />
          <span>Step 1: Promotion Source & Target Configuration</span>
        </span>
      </Card.Header>

      <Card.Body className="p-3">
        {isSameYear && (
          <Alert variant="danger" className="small py-2 mb-3 d-flex align-items-center gap-2">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span>
              <strong>Invalid Session Transition:</strong> Source and target academic years cannot
              be identical. Promotion requires advancing to a subsequent academic year.
            </span>
          </Alert>
        )}

        <Row className="g-3">
          {/* Source Academic Year */}
          <Col xs={12} sm={6} md={3}>
            <Form.Group>
              <Form.Label className="small fw-medium mb-1 text-muted">
                From Academic Year (Source) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                size="sm"
                value={sourceYear}
                onChange={(e) => onSourceYearChange(e.target.value)}
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    AY {y}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Target Academic Year */}
          <Col xs={12} sm={6} md={3}>
            <Form.Group>
              <Form.Label className="small fw-medium mb-1 text-primary">
                To Academic Year (Target) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                size="sm"
                value={targetYear}
                onChange={(e) => onTargetYearChange(e.target.value)}
                className={isSameYear ? 'is-invalid' : undefined}
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    AY {y}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Source Class */}
          <Col xs={12} sm={6} md={3}>
            <Form.Group>
              <Form.Label className="small fw-medium mb-1 text-muted">
                Source Class <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                size="sm"
                value={sourceClass}
                onChange={(e) => onSourceClassChange(e.target.value)}
              >
                {availableClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Target Class */}
          <Col xs={12} sm={6} md={3}>
            <Form.Group>
              <Form.Label className="small fw-medium mb-1 text-success">
                Promote To Class <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                size="sm"
                value={targetClass}
                onChange={(e) => onTargetClassChange(e.target.value)}
              >
                {availableClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Section Selector Checkboxes */}
          <Col xs={12} md={9}>
            <div className="small fw-medium mb-1 text-muted">Source Sections:</div>
            <div className="d-flex flex-wrap align-items-center gap-3 bg-body-tertiary p-2 rounded border">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onSelectAllSections}
                className="py-0 px-2 text-xs"
              >
                {selectedSections.length === availableSections.length
                  ? 'Clear All'
                  : 'Select All Sections'}
              </Button>
              {availableSections.map((sec) => {
                const isChecked = selectedSections.includes(sec);
                return (
                  <Form.Check
                    key={sec}
                    type="checkbox"
                    id={`sec-chk-${sec}`}
                    label={sec}
                    checked={isChecked}
                    onChange={() => onToggleSection(sec)}
                    className="small mb-0 user-select-none"
                  />
                );
              })}
            </div>
          </Col>

          {/* Load Students Button */}
          <Col xs={12} md={3} className="d-flex align-items-end">
            <Button
              variant="primary"
              size="sm"
              className="w-100 d-flex align-items-center justify-content-center gap-1 py-2"
              onClick={onLoadRoster}
              disabled={isSameYear || selectedSections.length === 0 || isLoading}
            >
              <span>{isLoading ? 'Loading Roster...' : 'Load Eligible Students'}</span>
              <ArrowRight size={14} />
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
