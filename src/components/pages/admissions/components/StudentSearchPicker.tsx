import React, { useState, useMemo } from 'react';
import { Card, Form, InputGroup, ListGroup, Badge, Button, Row, Col } from 'react-bootstrap';
import { Search, UserCheck, Phone, Mail, Calendar, Check, AlertCircle } from 'lucide-react';
import { StudentItem } from '@/components/pages/students/types';
import { useGetStudentsQuery, mapDtoToStudentItem } from '@/store/students';
import { identifierConfig } from '@/config/identifiers';

interface StudentSearchPickerProps {
  selectedStudent: StudentItem | null;
  onSelectStudent: (student: StudentItem) => void;
  onClearSelection: () => void;
}

export const StudentSearchPicker: React.FC<StudentSearchPickerProps> = ({
  selectedStudent,
  onSelectStudent,
  onClearSelection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: studentsData } = useGetStudentsQuery();

  const allStudents = useMemo(() => {
    const raw = Array.isArray(studentsData?.data)
      ? studentsData.data
      : Array.isArray(studentsData)
        ? studentsData
        : [];
    return raw.map((item: any) =>
      item.studentId && item.admissionNumber ? mapDtoToStudentItem(item) : item,
    );
  }, [studentsData]);

  // Filter students by code, name, mobile, or email
  const matchingStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      // If no query and no student selected, suggest students without active admissions first, then others
      return allStudents.slice(0, 6);
    }
    return allStudents.filter((s) => {
      const fullName = `${s.firstName} ${s.middleName || ''} ${s.lastName}`.toLowerCase();
      const code = s.studentCode.toLowerCase();
      const mobile = (s.mobile || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      return (
        fullName.includes(term) ||
        code.includes(term) ||
        mobile.includes(term) ||
        email.includes(term)
      );
    });
  }, [allStudents, searchTerm]);

  // Primary guardian helper
  const getPrimaryGuardian = (student: StudentItem) => {
    const g = student.guardians?.find((g) => g.isPrimary) || student.guardians?.[0];
    if (!g) return 'Not recorded';
    return `${g.firstName} ${g.lastName} (${g.relationship})`;
  };

  return (
    <Card className="border shadow-none mb-3">
      <Card.Header className="bg-body-tertiary py-2 d-flex align-items-center justify-content-between">
        <span className="small fw-semibold d-flex align-items-center gap-1">
          <UserCheck size={15} className="text-primary" />
          <span>Step 1: Search & Select Existing Student</span>
        </span>
        {selectedStudent && (
          <Button
            variant="link"
            size="sm"
            className="p-0 text-decoration-none small"
            onClick={onClearSelection}
          >
            Change Student
          </Button>
        )}
      </Card.Header>

      <Card.Body className="p-3">
        {!selectedStudent ? (
          <div>
            <p className="text-muted small mb-2">
              Select an existing student person record. An admission creates an academic session
              enrollment for this student without duplicating their permanent identity.
            </p>

            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text className="bg-body border-end-0 text-muted">
                <Search size={14} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder={`Search by Student Code (e.g. ${identifierConfig.businessCodes.studentReference.examples[0]}), Name, Mobile, or Email...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0 ps-0"
                autoFocus
              />
            </InputGroup>

            <div className="text-muted small fw-medium mb-1">
              {searchTerm
                ? `Matching Students (${matchingStudents.length})`
                : 'Suggested Student Profiles:'}
            </div>

            <ListGroup variant="flush" className="border rounded">
              {matchingStudents.length === 0 ? (
                <ListGroup.Item className="py-3 text-center text-muted small">
                  No matching student records found for "{searchTerm}".
                </ListGroup.Item>
              ) : (
                matchingStudents.map((s) => {
                  const fullName = `${s.firstName} ${s.middleName ? s.middleName + ' ' : ''}${s.lastName}`;
                  const isNewPerson = !s.hasActiveAdmission;

                  return (
                    <ListGroup.Item
                      key={s.id}
                      action
                      onClick={() => onSelectStudent(s)}
                      className="d-flex align-items-center justify-content-between py-2 px-3 small"
                    >
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <strong className="text-dark">{fullName}</strong>
                          <span className="font-monospace text-primary fw-semibold">
                            {s.studentCode}
                          </span>
                          {isNewPerson ? (
                            <Badge bg="success" className="text-xs">
                              Awaiting Admission
                            </Badge>
                          ) : (
                            <Badge bg="secondary" className="text-xs">
                              {s.currentClass || 'Registered'}
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted small d-flex flex-wrap align-items-center gap-3 mt-1">
                          {s.mobile && (
                            <span className="d-flex align-items-center gap-1">
                              <Phone size={12} /> {s.mobile}
                            </span>
                          )}
                          {s.email && (
                            <span className="d-flex align-items-center gap-1">
                              <Mail size={12} /> {s.email}
                            </span>
                          )}
                          <span className="d-flex align-items-center gap-1">
                            <Calendar size={12} /> DOB: {s.dateOfBirth}
                          </span>
                        </div>
                      </div>

                      <Button variant="outline-primary" size="sm" className="py-0 px-2 ms-2">
                        Select
                      </Button>
                    </ListGroup.Item>
                  );
                })
              )}
            </ListGroup>
          </div>
        ) : (
          /* Compact Student Summary */
          <div className="bg-body-tertiary p-3 rounded border">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: '36px', height: '36px' }}
                >
                  {selectedStudent.firstName.charAt(0)}
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">
                    {selectedStudent.firstName}{' '}
                    {selectedStudent.middleName ? selectedStudent.middleName + ' ' : ''}
                    {selectedStudent.lastName}
                  </h6>
                  <span className="text-muted small font-monospace">
                    Student Code:{' '}
                    <strong className="text-primary">{selectedStudent.studentCode}</strong>
                  </span>
                </div>
              </div>
              <Badge bg="success" className="d-flex align-items-center gap-1">
                <Check size={12} /> Verified Student Record
              </Badge>
            </div>

            <Row className="g-2 small pt-2 border-top">
              <Col xs={12} sm={6} md={3}>
                <span className="text-muted">Date of Birth:</span>{' '}
                <strong>{selectedStudent.dateOfBirth}</strong>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <span className="text-muted">Gender:</span>{' '}
                <strong>{selectedStudent.gender}</strong>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <span className="text-muted">Primary Guardian:</span>{' '}
                <strong>{getPrimaryGuardian(selectedStudent)}</strong>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <span className="text-muted">Mobile Contact:</span>{' '}
                <strong>
                  {selectedStudent.mobile || selectedStudent.guardians?.[0]?.mobile || '—'}
                </strong>
              </Col>
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
