import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { UserPlus, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';
import { useCreateTeacherMutation } from '@/store/teachers';
import { Teacher, Gender, EmploymentType } from '@/components/pages/teachers/types';
import { MOCK_DEPARTMENTS, MOCK_DESIGNATIONS } from '@/data/mockTeacherData';

interface QuickAddTeacherModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (newTeacher: Teacher) => void;
  schoolId?: string;
}

export const QuickAddTeacherModal: React.FC<QuickAddTeacherModalProps> = ({
  show,
  onHide,
  onSuccess,
  schoolId = 'school-oakridge-01',
}) => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { activeSchool, token } = useAuth();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    departmentName: 'Mathematics',
    designationName: 'TGT',
    qualification: 'M.Sc. Mathematics, B.Ed',
    gender: 'Male' as Gender,
    employmentType: 'FULL_TIME' as EmploymentType,
  });

  const [createTeacher, { isLoading: isSubmitting }] = useCreateTeacherMutation();

  const handleFirstNameChange = (val: string) => {
    setFormData((prev) => {
      const generatedEmail =
        prev.email === '' || prev.email.endsWith('@schoolnexa.edu.in')
          ? `${val.toLowerCase().replace(/[^a-z0-9]/g, '')}.${(prev.lastName || 'teacher').toLowerCase().replace(/[^a-z0-9]/g, '')}@schoolnexa.edu.in`
          : prev.email;

      return {
        ...prev,
        firstName: val,
        email: generatedEmail,
      };
    });
  };

  const handleLastNameChange = (val: string) => {
    setFormData((prev) => {
      const generatedEmail =
        prev.email === '' || prev.email.endsWith('@schoolnexa.edu.in')
          ? `${(prev.firstName || 'teacher').toLowerCase().replace(/[^a-z0-9]/g, '')}.${val.toLowerCase().replace(/[^a-z0-9]/g, '')}@schoolnexa.edu.in`
          : prev.email;

      return {
        ...prev,
        lastName: val,
        email: generatedEmail,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      toast.warning('Please enter faculty first name.');
      return;
    }

    try {
      const matchedDept = MOCK_DEPARTMENTS.find((d) => d.name === formData.departmentName);
      const matchedDesig = MOCK_DESIGNATIONS.find((d) => d.name === formData.designationName);

      const newTeacher = await createTeacher({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim() || '+91 98140 00000',
        departmentId: matchedDept?.id,
        departmentName: formData.departmentName,
        designationId: matchedDesig?.id,
        designationName: formData.designationName,
        gender: formData.gender,
        employmentType: formData.employmentType,
        status: 'ACTIVE',
      }).unwrap();

      toast.success(
        `Faculty teacher ${newTeacher.firstName} ${newTeacher.lastName} (${newTeacher.teacherId}) registered successfully!`,
      );
      onSuccess(newTeacher);
      onHide();
    } catch (err: any) {
      console.error('Failed to register teacher:', err);
      toast.error(
        getApiErrorMessage(err, 'Failed to register teacher.'),
      );
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className={isDark ? 'bg-dark text-white border-secondary' : ''}>
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
            <UserPlus size={18} className="text-primary" />
            <span>Quick Register Faculty Teacher</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className={isDark ? 'bg-dark text-white' : ''}>
          <p className="text-muted small mb-3">
            Register a new faculty educator to make them immediately available for classroom section
            and subject allocation.
          </p>

          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">First Name *</Form.Label>
                <Form.Control
                  size="sm"
                  required
                  placeholder="e.g. Ramesh"
                  value={formData.firstName}
                  onChange={(e) => handleFirstNameChange(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Last Name</Form.Label>
                <Form.Control
                  size="sm"
                  placeholder="e.g. Verma"
                  value={formData.lastName}
                  onChange={(e) => handleLastNameChange(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Academic Department *</Form.Label>
                <Form.Select
                  size="sm"
                  required
                  value={formData.departmentName}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                >
                  {MOCK_DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Designation Role *</Form.Label>
                <Form.Select
                  size="sm"
                  required
                  value={formData.designationName}
                  onChange={(e) => setFormData({ ...formData, designationName: e.target.value })}
                >
                  {MOCK_DESIGNATIONS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} — {d.category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  size="sm"
                  required
                  placeholder="name@schoolnexa.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Mobile / Phone</Form.Label>
                <Form.Control
                  size="sm"
                  placeholder="+91 98140 12345"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Gender</Form.Label>
                <Form.Select
                  size="sm"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Employment Type</Form.Label>
                <Form.Select
                  size="sm"
                  value={formData.employmentType}
                  onChange={(e) =>
                    setFormData({ ...formData, employmentType: e.target.value as EmploymentType })
                  }
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Qualification</Form.Label>
                <Form.Control
                  size="sm"
                  placeholder="e.g. M.Sc, B.Ed"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className={isDark ? 'bg-dark text-white border-secondary' : ''}>
          <Button variant="secondary" size="sm" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Registering...
              </>
            ) : (
              'Save & Select Faculty'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
