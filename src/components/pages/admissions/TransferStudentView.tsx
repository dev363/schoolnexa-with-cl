import React, { useState, useMemo } from 'react';
import { Breadcrumb, Button, Card, Row, Col, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { ArrowLeft, ArrowLeftRight, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Enrollment } from './types';
import {
  useGetEnrollmentsQuery,
  useTransferOutStudentMutation,
} from '@/store/enrollment';
import { StatusBadge } from './components/StatusBadge';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';
import { identifierConfig } from '@/config/identifiers';

export const TransferStudentView: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const isDark = theme === 'dark';

  const { data: enrollmentsData } = useGetEnrollmentsQuery();
  const [transferOutStudentMutation, { isLoading: isSubmitting }] = useTransferOutStudentMutation();

  const allEnrollments: Enrollment[] = useMemo(() => {
    return Array.isArray(enrollmentsData?.data)
      ? enrollmentsData.data
      : Array.isArray(enrollmentsData)
        ? enrollmentsData
        : [];
  }, [enrollmentsData]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  const [formData, setFormData] = useState({
    transferDate: new Date().toISOString().split('T')[0],
    transferReason: 'Family relocation / parent transfer',
    transferCertificateNumber: `TC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    remarks: '',
  });

  const [transferredResult, setTransferredResult] = useState<Enrollment | null>(null);

  // Eligible active enrollments
  const filteredCandidates = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return allEnrollments
      .filter((e) => e.status !== 'TRANSFERRED' && e.status !== 'CANCELLED')
      .filter((e) => {
        if (!term) return true;
        return (
          e.studentName.toLowerCase().includes(term) ||
          e.studentCode.toLowerCase().includes(term) ||
          e.enrollmentId.toLowerCase().includes(term) ||
          (e.admissionNumber || '').toLowerCase().includes(term)
        );
      })
      .slice(0, 10);
  }, [allEnrollments, searchTerm]);

  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    try {
      const res = await transferOutStudentMutation({
        enrollmentId: selectedEnrollment.id || selectedEnrollment.enrollmentId,
        transferDate: formData.transferDate,
        transferReason: formData.transferReason,
        transferCertificateNumber: formData.transferCertificateNumber,
        remarks: formData.remarks,
      }).unwrap();

      setTransferredResult({
        ...selectedEnrollment,
        status: 'TRANSFERRED',
        transferDate: formData.transferDate,
        transferReason: formData.transferReason,
        transferCertificateNumber: formData.transferCertificateNumber,
        ...(res?.data || res),
      });
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, 'Failed to transfer out student'));
    }
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4" style={{ maxWidth: '900px' }}>
      {/* Top Header Card */}
      <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border mb-3">
        <Card.Body className="p-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '40px', height: '40px' }}
              >
                <ArrowLeftRight size={20} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>
                    Student Transfer Out & TC Issuance
                  </h5>
                  <Badge bg="danger" className="fw-normal">
                    Departure & TC
                  </Badge>
                </div>
                <p className="text-muted small mb-0 mt-0.5">
                  Process student departures and issue official Transfer Certificates. Historical
                  records remain preserved.
                </p>
              </div>
            </div>

            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1.5"
                onClick={() => navigate('/admissions')}
              >
                <ArrowLeft size={14} />
                <span>Back to Admissions</span>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {transferredResult ? (
        <Alert variant="success" className="p-3 mb-4">
          <div className="d-flex align-items-start gap-2">
            <CheckCircle2 size={20} className="text-success mt-0.5 flex-shrink-0" />
            <div className="flex-grow-1">
              <h6 className="fw-bold mb-1">Transfer Certificate Issued Successfully!</h6>
              <p className="small mb-2">
                Enrollment{' '}
                <span className="font-monospace fw-bold">{transferredResult.enrollmentId}</span> for{' '}
                <strong>{transferredResult.studentName}</strong> has been updated to status{' '}
                <Badge bg="danger">TRANSFERRED</Badge>.
              </p>
              <div className="bg-body p-2 rounded border small mb-3">
                <div>
                  TC Number: <strong>{transferredResult.transferCertificateNumber}</strong>
                </div>
                <div>Effective Date: {transferredResult.transferDate}</div>
                <div>Reason: {transferredResult.transferReason}</div>
              </div>
              <div className="d-flex gap-2">
                <Button variant="success" size="sm" onClick={() => navigate('/admissions')}>
                  Return to Admissions
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => {
                    setTransferredResult(null);
                    setSelectedEnrollment(null);
                  }}
                >
                  Process Another Transfer
                </Button>
              </div>
            </div>
          </div>
        </Alert>
      ) : (
        <>
          {/* Step 1: Select Active Enrollment */}
          <Card className="border shadow-none mb-3">
            <Card.Header className="bg-body-tertiary py-2">
              <span className="small fw-semibold">Step 1: Select Active Student Enrollment</span>
            </Card.Header>
            <Card.Body className="p-3">
              {!selectedEnrollment ? (
                <div>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder={`Search active student by Name, Code (e.g. ${identifierConfig.businessCodes.studentReference.examples[0]}), or Enrollment ID...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>

                  <div className="list-group">
                    {filteredCandidates.map((cand) => (
                      <button
                        key={cand.id}
                        type="button"
                        onClick={() => setSelectedEnrollment(cand)}
                        className="list-group-item list-group-item-action py-2 px-3 d-flex align-items-center justify-content-between small"
                      >
                        <div>
                          <strong>{cand.studentName}</strong>{' '}
                          <span className="font-monospace text-primary fw-semibold ms-2">
                            {cand.studentCode}
                          </span>
                          <div className="text-muted small">
                            {cand.academicYearName} • {cand.className} ({cand.sectionName}) •
                            Enrollment: <span className="font-monospace">{cand.enrollmentId}</span>
                          </div>
                        </div>
                        <Badge bg="outline-secondary" className="border text-dark">
                          Select
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-body-tertiary p-3 rounded border">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="mb-0 fw-bold">{selectedEnrollment.studentName}</h6>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-decoration-none small"
                      onClick={() => setSelectedEnrollment(null)}
                    >
                      Change Student
                    </Button>
                  </div>
                  <Row className="g-2 small">
                    <Col xs={6} sm={3}>
                      <span className="text-muted">Student Code:</span>{' '}
                      <strong className="font-monospace">{selectedEnrollment.studentCode}</strong>
                    </Col>
                    <Col xs={6} sm={3}>
                      <span className="text-muted">Enrollment ID:</span>{' '}
                      <strong className="font-monospace text-primary">
                        {selectedEnrollment.enrollmentId}
                      </strong>
                    </Col>
                    <Col xs={6} sm={3}>
                      <span className="text-muted">Class & Section:</span>{' '}
                      <strong>
                        {selectedEnrollment.className} ({selectedEnrollment.sectionName})
                      </strong>
                    </Col>
                    <Col xs={6} sm={3}>
                      <span className="text-muted">Status:</span>{' '}
                      <StatusBadge status={selectedEnrollment.status} size="sm" />
                    </Col>
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Step 2: Transfer Details Form */}
          {selectedEnrollment && (
            <Card className="border shadow-none mb-3">
              <Card.Header className="bg-body-tertiary py-2">
                <span className="small fw-semibold text-danger">
                  Step 2: Transfer Details & TC Generation
                </span>
              </Card.Header>
              <Card.Body className="p-3">
                <Alert variant="warning" className="small py-2 mb-3 d-flex align-items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                  <div>
                    This operation records a departure and will set the current enrollment status to{' '}
                    <strong>TRANSFERRED</strong>. All past and current academic logs remain intact.
                  </div>
                </Alert>

                <Form onSubmit={handleConfirmTransfer}>
                  <Row className="g-3 mb-3">
                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <Form.Label className="small fw-medium mb-1">
                          Transfer Date <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="date"
                          size="sm"
                          required
                          value={formData.transferDate}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, transferDate: e.target.value }))
                          }
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <Form.Label className="small fw-medium mb-1">
                          TC Number <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          size="sm"
                          required
                          placeholder="e.g. TC-2026-042"
                          value={formData.transferCertificateNumber}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              transferCertificateNumber: e.target.value,
                            }))
                          }
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="small fw-medium mb-1">
                          Reason for Transfer <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          size="sm"
                          required
                          value={formData.transferReason}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, transferReason: e.target.value }))
                          }
                        >
                          <option value="Family relocation / parent transfer">
                            Family relocation / parent transfer
                          </option>
                          <option value="Admission into another institution">
                            Admission into another institution
                          </option>
                          <option value="Boarding school placement">
                            Boarding school placement
                          </option>
                          <option value="International relocation">International relocation</option>
                          <option value="Personal / Medical reasons">
                            Personal / Medical reasons
                          </option>
                          <option value="Course completion">Course completion</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="small fw-medium mb-1">
                          Destination School / Additional Notes
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          size="sm"
                          placeholder="Optional destination school name, address, or administrative notes"
                          value={formData.remarks}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, remarks: e.target.value }))
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setSelectedEnrollment(null)}
                    >
                      Cancel
                    </Button>
                    <Button variant="danger" size="sm" type="submit">
                      Confirm Transfer Out
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
