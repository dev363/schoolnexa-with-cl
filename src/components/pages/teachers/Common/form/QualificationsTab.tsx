import React from 'react';
import { Card, Row, Col, Form, Badge } from 'react-bootstrap';
import { Plus, Trash2 } from 'lucide-react';
import { TeacherQualification } from '@/components/pages/teachers/types';
import { ActionButton } from '@/components/common';
import { useTeacherFormContext } from '@/components/pages/teachers/context/TeacherFormContext';
import { useDebouncedTeacherSectionState } from '@/components/pages/teachers/hooks';

export interface FormQualificationsTabProps {
  isDark?: boolean;
}

export const FormQualificationsTab: React.FC<FormQualificationsTabProps> = ({
  isDark = false,
}) => {
  const { state, handleTopStateChange } = useTeacherFormContext();

  const { localState, setLocalState, syncToContext } =
    useDebouncedTeacherSectionState<TeacherQualification>({
      contextValue: state.qualifications,
      onContextChange: (nextQualifications) => {
        handleTopStateChange((prev) => ({
          ...prev,
          qualifications: nextQualifications,
        }));
      },
    });

  const handleAdd = () => {
    const newQ: TeacherQualification = {
      id: `q-${Date.now()}`,
      degree: '',
      specialization: '',
      institution: '',
      university: '',
      year: new Date().getFullYear(),
      grade: '',
    };
    setLocalState((prev) => {
      const nextState = [...prev, newQ];
      syncToContext(nextState);
      return nextState;
    });
  };

  const handleUpdate = <K extends keyof TeacherQualification>(
    id: string,
    field: K,
    value: TeacherQualification[K],
  ) => {
    setLocalState((prev) => {
      const nextState = prev.map((q) => (q.id === id ? { ...q, [field]: value } : q));
      syncToContext(nextState);
      return nextState;
    });
  };

  const handleRemove = (id: string) => {
    setLocalState((prev) => {
      const nextState = prev.filter((q) => q.id !== id);
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
          <span className="fw-bold small text-uppercase text-muted">Qualification</span>
          {localState.length > 0 && (
            <Badge bg="secondary" pill className="fw-normal" style={{ fontSize: '0.75rem' }}>
              {localState.length}
            </Badge>
          )}
        </div>
        <ActionButton
          name="Add Qualification"
          icon={Plus}
          action={handleAdd}
          variant="outline-primary"
          size="sm"
        />
      </Card.Header>
      <Card.Body className="p-3">
        {localState.length === 0 ? (
          <p className="text-muted small text-center py-4 mb-0">
            No qualifications recorded yet. Click "Add Qualification" to add degrees or
            certifications.
          </p>
        ) : (
          <div>
            {/* Desktop Column Headers */}
            <div className="d-none d-md-block px-3 py-1 mb-2 border-bottom bg-light bg-opacity-25 rounded-top">
              <Row className="g-2 text-muted small fw-semibold align-items-center">
                <Col md={3}>Qualification</Col>
                <Col md={3}>Institution</Col>
                <Col md={2}>University / Board</Col>
                <Col md={1}>Year</Col>
                <Col md={2}>Grade / %</Col>
                <Col md={1} className="text-end">
                  Action
                </Col>
              </Row>
            </div>

            {/* Qualification Records */}
            <div className="d-flex flex-column gap-2">
              {localState.map((q) => (
                <div
                  key={q.id}
                  className={`px-3 py-2 rounded border ${
                    isDark
                      ? 'bg-secondary bg-opacity-10 border-secondary'
                      : 'bg-light bg-opacity-40 border-light-subtle'
                  }`}
                >
                  <Row className="g-2 align-items-center">
                    {/* Qualification / Degree */}
                    <Col xs={12} md={3}>
                      <Form.Label className="d-md-none small fw-semibold text-muted mb-1">
                        Qualification
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        value={q.degree}
                        placeholder="e.g. B.Ed, M.Sc."
                        onChange={(e) => handleUpdate(q.id, 'degree', e.target.value)}
                      />
                    </Col>

                    {/* Institution */}
                    <Col xs={12} md={3}>
                      <Form.Label className="d-md-none small fw-semibold text-muted mb-1">
                        Institution
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        value={q.institution || ''}
                        placeholder="e.g. ABC College"
                        onChange={(e) => handleUpdate(q.id, 'institution', e.target.value)}
                      />
                    </Col>

                    {/* University / Board */}
                    <Col xs={12} md={2}>
                      <Form.Label className="d-md-none small fw-semibold text-muted mb-1">
                        University / Board
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        value={q.university || ''}
                        placeholder="e.g. PTU / CBSE"
                        onChange={(e) => handleUpdate(q.id, 'university', e.target.value)}
                      />
                    </Col>

                    {/* Year */}
                    <Col xs={6} md={1}>
                      <Form.Label className="d-md-none small fw-semibold text-muted mb-1">
                        Year
                      </Form.Label>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={q.year || ''}
                        placeholder="YYYY"
                        onChange={(e) =>
                          handleUpdate(
                            q.id,
                            'year',
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                      />
                    </Col>

                    {/* Grade / Percentage */}
                    <Col xs={6} md={2}>
                      <Form.Label className="d-md-none small fw-semibold text-muted mb-1">
                        Grade / %
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        value={q.grade || ''}
                        placeholder="e.g. 72% / First Div"
                        onChange={(e) => handleUpdate(q.id, 'grade', e.target.value)}
                      />
                    </Col>

                    {/* Delete Action */}
                    <Col xs={12} md={1} className="text-end">
                      <ActionButton
                        name="Delete"
                        icon={Trash2}
                        action={() => handleRemove(q.id)}
                        variant="outline-danger"
                        size="sm"
                        iconOnly
                        title="Delete Qualification"
                        className="border-0"
                      />
                    </Col>
                  </Row>

                  {/* Preserved specialization if present */}
                  <div className="mt-1.5 pt-1 border-top border-light-subtle d-flex align-items-center gap-2">
                    <span className="text-muted small fst-italic" style={{ fontSize: '0.78rem' }}>
                      Specialization:
                    </span>
                    <Form.Control
                      size="sm"
                      className="border-0 bg-transparent p-0 text-muted small"
                      style={{ fontSize: '0.8rem' }}
                      value={q.specialization || ''}
                      placeholder="e.g. Mathematics"
                      onChange={(e) => handleUpdate(q.id, 'specialization', e.target.value)}
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

export const QualificationsTab = FormQualificationsTab;
export default QualificationsTab;
