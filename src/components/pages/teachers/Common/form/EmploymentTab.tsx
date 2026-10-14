import React from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import {
  Teacher,
  DepartmentItem,
  DesignationItem,
  EmploymentType,
  TeacherStatus,
} from '@/components/pages/teachers/types';
import { useTeacherFormContext } from '@/components/pages/teachers/context/TeacherFormContext';
import {
  EMPLOYMENT_TYPE_OPTIONS,
  TEACHER_STATUS_OPTIONS,
} from '@/components/pages/teachers/constants';

export interface FormEmploymentTabProps {
  departments: DepartmentItem[];
  designations: DesignationItem[];
  existingTeachers: Teacher[];
  isDark?: boolean;
}

export const FormEmploymentTab: React.FC<FormEmploymentTabProps> = ({
  departments,
  designations,
  existingTeachers,
  isDark = false,
}) => {
  const { state, handleTopStateChange } = useTeacherFormContext();

  return (
    <Card
      bg={isDark ? 'dark' : 'white'}
      text={isDark ? 'white' : 'dark'}
      className="border shadow-sm"
    >
      <Card.Header className="py-2 px-3 fw-bold small text-uppercase text-muted">
        Employment & School Roles
      </Card.Header>
      <Card.Body className="p-3">
        <Row className="g-3">
          <Col xs={12} sm={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Designation</Form.Label>
              <Form.Select
                size="sm"
                value={state.designationName}
                onChange={(e) =>
                  handleTopStateChange((prev) => ({
                    ...prev,
                    designationName: e.target.value,
                  }))
                }
              >
                {designations.map((des) => (
                  <option key={des.id} value={des.name}>
                    {des.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} sm={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Department</Form.Label>
              <Form.Select
                size="sm"
                value={state.departmentName}
                onChange={(e) =>
                  handleTopStateChange((prev) => ({
                    ...prev,
                    departmentName: e.target.value,
                  }))
                }
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} sm={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Employment Type</Form.Label>
              <Form.Select
                size="sm"
                value={state.employmentType}
                onChange={(e) =>
                  handleTopStateChange((prev) => ({
                    ...prev,
                    employmentType: e.target.value as EmploymentType,
                  }))
                }
              >
                {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} sm={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Joining Date</Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={state.joiningDate}
                onChange={(e) =>
                  handleTopStateChange((prev) => ({
                    ...prev,
                    joiningDate: e.target.value,
                  }))
                }
              />
            </Form.Group>
          </Col>

          <Col xs={12} sm={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Confirmation Date</Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={state.confirmationDate}
                onChange={(e) =>
                  handleTopStateChange((prev) => ({
                    ...prev,
                    confirmationDate: e.target.value,
                  }))
                }
              />
            </Form.Group>
          </Col>

          <Col xs={12} sm={4}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Employment Status</Form.Label>
              <Form.Select
                size="sm"
                value={state.status}
                onChange={(e) =>
                  handleTopStateChange((prev) => ({
                    ...prev,
                    status: e.target.value as TeacherStatus,
                  }))
                }
              >
                {TEACHER_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} sm={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Primary Work Location / Room</Form.Label>
              <Form.Control
                size="sm"
                placeholder="e.g. Senior Wing, Room 304"
                value={state.workLocation}
                onChange={(e) =>
                  handleTopStateChange((prev) => ({
                    ...prev,
                    workLocation: e.target.value,
                  }))
                }
              />
            </Form.Group>
          </Col>

          <Col xs={12} sm={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Reporting Teacher / Supervisor</Form.Label>
              <Form.Select
                size="sm"
                value={state.reportingTeacherId}
                onChange={(e) =>
                  handleTopStateChange((prev) => ({
                    ...prev,
                    reportingTeacherId: e.target.value,
                  }))
                }
              >
                <option value="">School Managing Committee</option>
                {existingTeachers.map((t) => (
                  <option key={t.teacherId} value={t.teacherId}>
                    {t.firstName} {t.lastName || ''} ({t.designationName || 'Faculty'}) -{' '}
                    {t.teacherId}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-semibold">
                Internal Remarks / Administrative Notes
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add operational notes or committee approvals..."
                value={state.remarks}
                onChange={(e) =>
                  handleTopStateChange((prev) => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export const EmploymentTab = FormEmploymentTab;
export default EmploymentTab;
