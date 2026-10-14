import React from 'react';
import { Card, Row, Col, Form, Badge } from 'react-bootstrap';
import { Plus, Trash2 } from 'lucide-react';
import { TeacherExperience } from '@/components/pages/teachers/types';
import { ActionButton } from '@/components/common';
import { useTeacherFormContext } from '@/components/pages/teachers/context/TeacherFormContext';
import { useDebouncedTeacherSectionState } from '@/components/pages/teachers/hooks';

export interface FormExperienceTabProps {
  isDark?: boolean;
}

/**
 * Calculates experience duration in years and months from startDate to endDate
 */
export const formatExperienceDuration = (startDate?: string, endDate?: string): string => {
  if (!startDate) return '—';
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return '—';

  const end = endDate ? new Date(endDate) : new Date();
  if (isNaN(end.getTime()) || end < start) return '—';

  let totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) {
    totalMonths = Math.max(0, totalMonths - 1);
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years > 0 && months > 0) return `${years}y ${months}m`;
  if (years > 0) return `${years}y`;
  if (months > 0) return `${months}m`;
  return '< 1m';
};

export const FormExperienceTab: React.FC<FormExperienceTabProps> = ({
  isDark = false,
}) => {
  const { state, handleTopStateChange } = useTeacherFormContext();

  const { localState, setLocalState, syncToContext } =
    useDebouncedTeacherSectionState<TeacherExperience>({
      contextValue: state.experiences,
      onContextChange: (nextExperiences) => {
        handleTopStateChange((prev) => ({
          ...prev,
          experiences: nextExperiences,
        }));
      },
    });

  const handleAdd = () => {
    const newExp: TeacherExperience = {
      id: `exp-${Date.now()}`,
      organization: '',
      designation: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setLocalState((prev) => {
      const nextState = [...prev, newExp];
      syncToContext(nextState);
      return nextState;
    });
  };

  const handleUpdate = <K extends keyof TeacherExperience>(
    id: string,
    field: K,
    value: TeacherExperience[K],
  ) => {
    setLocalState((prev) => {
      const nextState = prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp));
      syncToContext(nextState);
      return nextState;
    });
  };

  const handleRemove = (id: string) => {
    setLocalState((prev) => {
      const nextState = prev.filter((exp) => exp.id !== id);
      syncToContext(nextState);
      return nextState;
    });
  };

  return (
    <Card
      bg={isDark ? 'dark' : 'white'}
      text={isDark ? 'white' : 'dark'}
      className="border shadow-sm"
      onBlur={() => syncToContext.flush()}
    >
      <Card.Header className="py-2.5 px-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold small text-uppercase text-muted">Experience</span>
          {localState.length > 0 && (
            <Badge bg="secondary" pill className="fw-normal" style={{ fontSize: '0.75rem' }}>
              {localState.length}
            </Badge>
          )}
        </div>
        <ActionButton
          name="Add Experience"
          icon={Plus}
          action={handleAdd}
          variant="outline-primary"
          size="sm"
        />
      </Card.Header>
      <Card.Body className="p-3">
        {localState.length === 0 ? (
          <p className="text-muted small text-center py-4 mb-0">No past experience recorded yet.</p>
        ) : (
          <div>
            {/* Desktop Column Headers */}
            <div className="d-none d-md-block px-3 py-1 mb-2 border-bottom bg-light bg-opacity-25 rounded-top">
              <Row className="g-2 text-muted small fw-semibold align-items-center">
                <Col md={3}>Organization</Col>
                <Col md={3}>Designation</Col>
                <Col md={2}>From</Col>
                <Col md={2}>To</Col>
                <Col md={1} className="text-center">
                  Experience
                </Col>
                <Col md={1} className="text-end">
                  Action
                </Col>
              </Row>
            </div>

            {/* Experience Records */}
            <div className="d-flex flex-column gap-2">
              {localState.map((exp) => (
                <div
                  key={exp.id}
                  className={`px-3 py-2 rounded border ${
                    isDark
                      ? 'bg-secondary bg-opacity-10 border-secondary'
                      : 'bg-light bg-opacity-40 border-light-subtle'
                  }`}
                >
                  <Row className="g-2 align-items-center">
                    {/* Organization */}
                    <Col xs={12} md={3}>
                      <Form.Label className="d-md-none small fw-semibold text-muted mb-1">
                        Organization
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        value={exp.organization}
                        placeholder="e.g. ABC School"
                        onChange={(e) => handleUpdate(exp.id, 'organization', e.target.value)}
                      />
                    </Col>

                    {/* Designation */}
                    <Col xs={12} md={3}>
                      <Form.Label className="d-md-none small fw-semibold text-muted mb-1">
                        Designation
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        value={exp.designation || ''}
                        placeholder="e.g. Teacher"
                        onChange={(e) => handleUpdate(exp.id, 'designation', e.target.value)}
                      />
                    </Col>

                    {/* From Date */}
                    <Col xs={6} md={2}>
                      <Form.Label className="d-md-none small fw-semibold text-muted mb-1">
                        From
                      </Form.Label>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={exp.startDate || ''}
                        onChange={(e) => handleUpdate(exp.id, 'startDate', e.target.value)}
                      />
                    </Col>

                    {/* To Date */}
                    <Col xs={6} md={2}>
                      <Form.Label className="d-md-none small fw-semibold text-muted mb-1">
                        To
                      </Form.Label>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={exp.endDate || ''}
                        onChange={(e) => handleUpdate(exp.id, 'endDate', e.target.value)}
                      />
                    </Col>

                    {/* Experience Duration */}
                    <Col xs={8} md={1} className="text-md-center">
                      <div className="d-flex d-md-block align-items-center gap-1.5">
                        <span className="d-md-none small fw-semibold text-muted">Experience:</span>
                        <Badge
                          bg={isDark ? 'secondary' : 'light'}
                          text={isDark ? 'light' : 'dark'}
                          className="border font-monospace py-1 px-2"
                        >
                          {formatExperienceDuration(exp.startDate, exp.endDate)}
                        </Badge>
                      </div>
                    </Col>

                    {/* Delete Action */}
                    <Col xs={4} md={1} className="text-end">
                      <ActionButton
                        name="Delete"
                        icon={Trash2}
                        action={() => handleRemove(exp.id)}
                        variant="outline-danger"
                        size="sm"
                        iconOnly
                        title="Delete Experience"
                        className="border-0"
                      />
                    </Col>
                  </Row>

                  {/* Preserved description if present */}
                  <div className="mt-1.5 pt-1 border-top border-light-subtle d-flex align-items-center gap-2">
                    <span className="text-muted small fst-italic" style={{ fontSize: '0.78rem' }}>
                      Note:
                    </span>
                    <Form.Control
                      size="sm"
                      className="border-0 bg-transparent p-0 text-muted small"
                      style={{ fontSize: '0.8rem' }}
                      value={exp.description || ''}
                      placeholder="Roles & Responsibilities..."
                      onChange={(e) => handleUpdate(exp.id, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export const ExperienceTab = FormExperienceTab;
export default ExperienceTab;
