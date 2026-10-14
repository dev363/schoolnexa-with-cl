import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import {
  CalendarRange,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { AcademicYearSummary } from '@/types';

export const AcademicYearsView: React.FC = () => {
  const {
    activeSchool,
    activeAcademicYear,
    createAcademicYear,
    setAcademicYearAsCurrent,
    updateAcademicYear,
    deleteAcademicYear,
    switchAcademicYear,
    hasPermission,
  } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const canManage = hasPermission('school.academicyears.manage');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYearSummary | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    startDate: '',
    endDate: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const academicYears = activeSchool?.academicYears || [];

  const handleOpenCreate = () => {
    setError(null);
    setFormData({
      name: `Academic Year ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      code: `AY-${String(new Date().getFullYear()).slice(-2)}-${String(new Date().getFullYear() + 1).slice(-2)}`,
      startDate: `${new Date().getFullYear()}-08-15`,
      endDate: `${new Date().getFullYear() + 1}-06-15`,
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (ay: AcademicYearSummary) => {
    setError(null);
    setSelectedYear(ay);
    setFormData({
      name: ay.name,
      code: ay.code,
      startDate: ay.startDate,
      endDate: ay.endDate,
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    try {
      if (!formData.name.trim() || !formData.code.trim()) {
        throw new Error('Please specify both the academic session title and unique code.');
      }
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        throw new Error('Start date must be strictly prior to the end date.');
      }

      await createAcademicYear(formData.name, formData.code, formData.startDate, formData.endDate);

      setSuccess(`Academic session "${formData.name}" successfully established.`);
      setIsCreateOpen(false);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to create academic year.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYear) return;
    setError(null);
    setIsProcessing(true);
    try {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        throw new Error('Start date must be strictly prior to the end date.');
      }

      await updateAcademicYear(selectedYear.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      setSuccess(`Academic session "${formData.name}" updated successfully.`);
      setIsEditOpen(false);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update academic year.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetCurrent = async (ay: AcademicYearSummary) => {
    if (ay.isCurrent) return;
    if (!canManage) {
      setError('You lack permissions to modify institutional academic session flags.');
      return;
    }

    const confirmed = window.confirm(
      `Designate "${ay.name}" as the ACTIVE CURRENT academic year for ${activeSchool?.name}? \n\nThis will automatically archive or unset current status on the previous session.`,
    );
    if (!confirmed) return;

    setIsProcessing(true);
    setError(null);
    try {
      await setAcademicYearAsCurrent(ay.id);
      setSuccess(`"${ay.name}" is now the active operational academic year.`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to designate current academic year.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (ay: AcademicYearSummary) => {
    if (!canManage) {
      setError('You lack permissions to delete academic sessions.');
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete "${ay.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setIsProcessing(true);
    setError(null);
    try {
      await deleteAcademicYear(ay.id);
      setSuccess(`Academic year "${ay.name}" deleted.`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete academic year.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async (ay: AcademicYearSummary) => {
    if (!canManage) return;
    try {
      await updateAcademicYear(ay.id, {
        status: ay.status === 'ARCHIVED' ? 'UPCOMING' : 'ARCHIVED',
      });
      setSuccess(`Status toggled for "${ay.name}".`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Header bar */}
      <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
        <Card.Body className="p-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <CalendarRange size={18} className="text-primary" />
              <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>
                Academic Years & Sessions
              </h5>
            </div>
            <p className="text-muted small mb-0 mt-1">
              Configure calendar periods, active operational terms, and student enrollment sessions.
            </p>
          </div>

          {canManage && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="d-inline-flex align-items-center gap-1.5"
            >
              <Plus size={15} />
              <span>New Academic Year</span>
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* Notifications */}
      {success && (
        <Alert variant="success" className="py-2 px-3 mb-0 d-flex align-items-center gap-2 small">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{success}</span>
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="py-2 px-3 mb-0 d-flex align-items-center gap-2 small">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </Alert>
      )}

      {/* Sessions Data Table */}
      <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
        <div className="table-responsive">
          <Table
            hover
            variant={isDark ? 'dark' : undefined}
            className="align-middle mb-0 text-nowrap small"
          >
            <thead className="table-light">
              <tr>
                <th className="py-2.5 px-3">Session Name</th>
                <th className="py-2.5 px-3">Session Code</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Current Operational</th>
                <th className="py-2.5 px-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {academicYears.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-5 text-center text-muted">
                    No academic years defined. Create one to begin.
                  </td>
                </tr>
              ) : (
                academicYears.map((ay) => {
                  const isCurrent = ay.isCurrent;
                  const isViewing = activeAcademicYear?.id === ay.id;

                  return (
                    <tr key={ay.id} className={isCurrent ? 'table-primary-subtle' : undefined}>
                      <td className="py-2.5 px-3">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-semibold">{ay.name}</span>
                          {isViewing && (
                            <Badge
                              bg="secondary"
                              className="fw-normal"
                              style={{ fontSize: '0.7rem' }}
                            >
                              Viewing Active
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-monospace text-muted">{ay.code}</td>
                      <td
                        className="py-2.5 px-3 text-muted font-monospace"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {ay.startDate} &rarr; {ay.endDate}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          bg={
                            ay.status === 'ACTIVE'
                              ? 'success'
                              : ay.status === 'UPCOMING'
                                ? 'warning'
                                : 'secondary'
                          }
                          className="fw-normal"
                        >
                          {ay.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        {isCurrent ? (
                          <Badge
                            bg="primary"
                            className="d-inline-flex align-items-center gap-1 fw-normal"
                          >
                            <Check size={12} />
                            Primary
                          </Badge>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-end">
                        <div className="d-inline-flex align-items-center justify-content-end gap-1">
                          {!isCurrent && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleSetCurrent(ay)}
                              disabled={isProcessing || !canManage}
                              className="py-0 px-2"
                              style={{ fontSize: '0.75rem', height: '28px' }}
                              title="Set as institution current operational session"
                            >
                              Set Primary
                            </Button>
                          )}

                          {!isViewing && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => switchAcademicYear(ay.id)}
                              className="py-0 px-2"
                              style={{ fontSize: '0.75rem', height: '28px' }}
                              title="Switch viewing filter to this year"
                            >
                              Switch Context
                            </Button>
                          )}

                          {canManage && (
                            <>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleOpenEdit(ay)}
                                className="p-1 d-inline-flex align-items-center justify-content-center"
                                style={{ width: '28px', height: '28px' }}
                                title="Edit Session"
                              >
                                <Edit2 size={13} />
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleArchive(ay)}
                                className="p-1 d-inline-flex align-items-center justify-content-center"
                                style={{ width: '28px', height: '28px' }}
                                title={
                                  ay.status === 'ARCHIVED' ? 'Reopen Session' : 'Archive Session'
                                }
                              >
                                <Lock size={13} />
                              </Button>
                              {!isCurrent && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(ay)}
                                  className="p-1 d-inline-flex align-items-center justify-content-center"
                                  style={{ width: '28px', height: '28px' }}
                                  title="Delete Session"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* CREATE MODAL */}
      <Modal show={isCreateOpen} onHide={() => setIsCreateOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '0.95rem' }}>Create Academic Session</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body className="py-2.5">
            <p className="text-muted small mb-3">
              Add a new operational academic term for {activeSchool?.name}.
            </p>

            <Form.Group className="mb-2.5">
              <Form.Label className="small fw-semibold mb-1">Session Name *</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Academic Year 2026-2027"
              />
            </Form.Group>

            <Form.Group className="mb-2.5">
              <Form.Label className="small fw-semibold mb-1">Unique Code *</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="AY-26-27"
                className="font-monospace text-uppercase"
              />
            </Form.Group>

            <Row className="g-2.5">
              <Col xs={6}>
                <Form.Group className="mb-2.5">
                  <Form.Label className="small fw-semibold mb-1">Start Date *</Form.Label>
                  <Form.Control
                    size="sm"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group className="mb-2.5">
                  <Form.Label className="small fw-semibold mb-1">End Date *</Form.Label>
                  <Form.Control
                    size="sm"
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="py-2">
            <Button variant="secondary" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isProcessing}>
              {isProcessing ? 'Creating...' : 'Establish Session'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal show={isEditOpen && !!selectedYear} onHide={() => setIsEditOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '0.95rem' }}>Edit Academic Session</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body className="py-2.5">
            <p className="text-muted small mb-2.5">Update details for {selectedYear?.name}.</p>

            <Form.Group className="mb-2.5">
              <Form.Label className="small fw-semibold mb-1">Session Title *</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2.5">
              <Form.Label className="small fw-semibold mb-1">Code *</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="font-monospace text-uppercase"
              />
            </Form.Group>

            <Row className="g-2.5">
              <Col xs={6}>
                <Form.Group className="mb-2.5">
                  <Form.Label className="small fw-semibold mb-1">Start Date *</Form.Label>
                  <Form.Control
                    size="sm"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group className="mb-2.5">
                  <Form.Label className="small fw-semibold mb-1">End Date *</Form.Label>
                  <Form.Control
                    size="sm"
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="py-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isProcessing}>
              {isProcessing ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};
