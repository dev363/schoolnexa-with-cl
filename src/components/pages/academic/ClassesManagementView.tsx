import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Form,
  Modal,
  Alert,
  Badge,
  Row,
  Col,
  Nav,
  ProgressBar,
  InputGroup,
} from 'react-bootstrap';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  useGetClassesQuery,
  useGetSectionsQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} from '@/store/academic';
import { ClassItem, AcademicYearSectionItem } from '@/types';
import { TopHeader } from '@/components/common';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';

export const ClassesManagementView: React.FC = () => {
  const { activeSchool, activeAcademicYear, user, hasPermission } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const canManage = hasPermission('academics.sections.manage');

  const [activeTab, setActiveTab] = useState<'classes' | 'sections'>('classes');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<AcademicYearSectionItem[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<AcademicYearSectionItem | null>(null);

  // Forms
  const [classForm, setClassForm] = useState({
    name: '',
    code: '',
    numericOrder: 1,
    stream: '' as '' | 'SCIENCE' | 'COMMERCE' | 'ARTS',
  });

  const [sectionForm, setSectionForm] = useState({
    classId: '',
    sectionName: 'A',
    maxCapacity: 35,
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // RTK Query hooks
  const {
    data: rtkClassesData,
    refetch: refetchClasses,
  } = useGetClassesQuery(activeSchool?.id ? { schoolId: activeSchool.id } : undefined, {
    skip: !activeSchool,
  });
  const {
    data: rtkSectionsData,
    refetch: refetchSections,
  } = useGetSectionsQuery(
    activeSchool?.id
      ? { schoolId: activeSchool.id, academicYearId: activeAcademicYear?.id }
      : undefined,
    { skip: !activeSchool },
  );

  const [createClassMutation] = useCreateClassMutation();
  const [updateClassMutation] = useUpdateClassMutation();
  const [deleteClassMutation] = useDeleteClassMutation();
  const [createSectionMutation] = useCreateSectionMutation();
  const [updateSectionMutation] = useUpdateSectionMutation();
  const [deleteSectionMutation] = useDeleteSectionMutation();

  // Synchronize RTK Query store data
  useEffect(() => {
    if (rtkClassesData) {
      const list = Array.isArray(rtkClassesData?.data)
        ? rtkClassesData.data
        : Array.isArray(rtkClassesData)
          ? rtkClassesData
          : [];
      if (list.length > 0) {
        setClasses(list);
      }
    }
  }, [rtkClassesData]);

  useEffect(() => {
    if (rtkSectionsData) {
      const list = Array.isArray(rtkSectionsData?.data)
        ? rtkSectionsData.data
        : Array.isArray(rtkSectionsData)
          ? rtkSectionsData
          : [];
      if (list.length > 0) {
        setSections(list);
      }
    }
  }, [rtkSectionsData]);

  const refreshData = async () => {
    refetchClasses();
    refetchSections();
  };

  // ==========================================
  // CLASS HANDLERS
  // ==========================================

  const handleOpenCreateClass = () => {
    setClassForm({
      name: '',
      code: '',
      numericOrder: classes.length > 0 ? Math.max(...classes.map((c) => c.numericOrder)) + 1 : 1,
      stream: '',
    });
    setFeedback(null);
    setIsCreateClassOpen(true);
  };

  const handleOpenEditClass = (cls: ClassItem) => {
    setSelectedClass(cls);
    setClassForm({
      name: cls.name,
      code: cls.code,
      numericOrder: cls.numericOrder,
      stream: cls.stream || '',
    });
    setFeedback(null);
    setIsEditClassOpen(true);
  };

  const handleCreateClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool || !canManage) return;

    setIsProcessing(true);
    setFeedback(null);
    try {
      await createClassMutation({
        name: classForm.name,
        code: classForm.code,
        numericOrder: Number(classForm.numericOrder),
        stream: classForm.stream ? (classForm.stream as any) : null,
      }).unwrap();

      setFeedback({ type: 'success', message: `Class ${classForm.name} created successfully.` });
      setIsCreateClassOpen(false);
      await refreshData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: getApiErrorMessage(err, 'Failed to create class') });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool || !selectedClass || !canManage) return;

    setIsProcessing(true);
    setFeedback(null);
    try {
      await updateClassMutation({
        id: selectedClass.id,
        data: {
          name: classForm.name,
          code: classForm.code,
          numericOrder: Number(classForm.numericOrder),
          stream: classForm.stream ? (classForm.stream as any) : null,
        },
      }).unwrap();

      setFeedback({ type: 'success', message: `Class ${classForm.name} updated.` });
      setIsEditClassOpen(false);
      await refreshData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: getApiErrorMessage(err, 'Failed to update class') });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClass = async (cls: ClassItem) => {
    if (!activeSchool || !canManage) return;
    const confirmed = window.confirm(`Delete class "${cls.name}" (${cls.code})?`);
    if (!confirmed) return;

    setFeedback(null);
    try {
      await deleteClassMutation(cls.id).unwrap();
      setFeedback({ type: 'success', message: `Class ${cls.name} deleted.` });
      await refreshData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: getApiErrorMessage(err, 'Failed to delete class') });
    }
  };

  // ==========================================
  // SECTION HANDLERS
  // ==========================================

  const handleOpenCreateSection = (preferredClassId?: string) => {
    setSectionForm({
      classId: preferredClassId || classes[0]?.id || '',
      sectionName: 'A',
      maxCapacity: 35,
    });
    setFeedback(null);
    setIsCreateSectionOpen(true);
  };

  const handleOpenEditSection = (sec: AcademicYearSectionItem) => {
    setSelectedSection(sec);
    setSectionForm({
      classId: sec.classId,
      sectionName: sec.sectionName,
      maxCapacity: sec.maxCapacity,
    });
    setFeedback(null);
    setIsEditSectionOpen(true);
  };

  const handleCreateSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool || !canManage) return;

    setIsProcessing(true);
    setFeedback(null);
    try {
      await createSectionMutation({
        academicYearId: activeAcademicYear?.id,
        classId: sectionForm.classId,
        sectionName: sectionForm.sectionName,
        maxCapacity: Number(sectionForm.maxCapacity),
      }).unwrap();

      setFeedback({ type: 'success', message: `Section "${sectionForm.sectionName}" created.` });
      setIsCreateSectionOpen(false);
      await refreshData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: getApiErrorMessage(err, 'Failed to create section') });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool || !selectedSection || !canManage) return;

    setIsProcessing(true);
    setFeedback(null);
    try {
      await updateSectionMutation({
        id: selectedSection.id,
        data: {
          sectionName: sectionForm.sectionName,
          maxCapacity: Number(sectionForm.maxCapacity),
        },
      }).unwrap();

      setFeedback({ type: 'success', message: `Section ${sectionForm.sectionName} updated.` });
      setIsEditSectionOpen(false);
      await refreshData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: getApiErrorMessage(err, 'Failed to update section') });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSection = async (sec: AcademicYearSectionItem) => {
    if (!activeSchool || !canManage) return;
    const confirmed = window.confirm(`Delete Section ${sec.className}-${sec.sectionName}?`);
    if (!confirmed) return;

    setFeedback(null);
    try {
      await deleteSectionMutation(sec.id).unwrap();
      setFeedback({ type: 'success', message: `Section ${sec.sectionName} deleted.` });
      await refreshData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: getApiErrorMessage(err, 'Failed to delete section') });
    }
  };

  const filteredSections = sections.filter((sec) => {
    if (selectedClassFilter !== 'ALL' && sec.classId !== selectedClassFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        sec.sectionName.toLowerCase().includes(q) ||
        (sec.className && sec.className.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredClasses = classes.filter((cls) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return cls.name.toLowerCase().includes(q) || cls.code.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="d-flex flex-column gap-3">
      {/* Top Header Standard */}
      <TopHeader
        title="Classes & Sections"
        icon={Layers}
        subtitle="Grade Tiers & Classroom Rosters • Reusable Master Setup"
        badges={[
          { bg: 'secondary', label: 'Master Setup' },
          { bg: 'primary', label: activeSchool?.name || 'School' },
        ]}
        rightContent={
          <Nav variant="pills" activeKey={activeTab} onSelect={(k) => setActiveTab(k as any)}>
            <Nav.Item>
              <Nav.Link eventKey="classes" className="py-1 px-3" style={{ fontSize: '0.8rem' }}>
                Classes ({classes.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="sections" className="py-1 px-3" style={{ fontSize: '0.8rem' }}>
                Sections ({sections.length})
              </Nav.Link>
            </Nav.Item>
          </Nav>
        }
        actions={
          canManage
            ? [
                {
                  name: activeTab === 'classes' ? 'Add Class' : 'Add Section',
                  icon: Plus,
                  action:
                    activeTab === 'classes'
                      ? handleOpenCreateClass
                      : () => handleOpenCreateSection(),
                  variant: 'primary',
                  size: 'sm',
                },
              ]
            : []
        }
      />

      {/* Notifications */}
      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'success' : 'danger'}
          dismissible
          onClose={() => setFeedback(null)}
          className="py-2 px-3 mb-0 small d-flex align-items-center gap-2"
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </Alert>
      )}

      {/* Search & Filter Controls */}
      <Card className="border shadow-none">
        <Card.Body className="p-2.5">
          <Row className="g-2 align-items-center">
            <Col sm={6} md={5}>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-transparent border-end-0">
                  <Search size={14} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder={
                    activeTab === 'classes' ? 'Search class name or code...' : 'Search sections...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            </Col>

            {activeTab === 'sections' && (
              <Col sm={6} md={4} className="d-flex align-items-center gap-2">
                <span className="text-muted small text-nowrap d-flex align-items-center gap-1">
                  <Filter size={12} /> Class:
                </span>
                <Form.Select
                  size="sm"
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                >
                  <option value="ALL">All Classes ({sections.length})</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {/* TAB 1: CLASSES TABLE */}
      {activeTab === 'classes' && (
        <Card className="border shadow-none">
          <Table responsive hover size="sm" className="mb-0 table-compact align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: '60px' }}>Order</th>
                <th>Class Standard</th>
                <th>Class Code</th>
                <th>Stream</th>
                <th>Class Sections</th>
                <th className="text-end" style={{ width: '110px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    No classes configured. Click "Add Class" to define a grade level.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => {
                  const classSecs = sections.filter((s) => s.classId === cls.id);
                  return (
                    <tr key={cls.id}>
                      <td className="fw-bold font-monospace text-muted">#{cls.numericOrder}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5 fw-semibold text-body">
                          <GraduationCap size={15} className="text-primary" />
                          <span>{cls.name}</span>
                        </div>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="border font-monospace fw-normal">
                          {cls.code}
                        </Badge>
                      </td>
                      <td>
                        {cls.stream ? (
                          <Badge bg="secondary" className="fw-normal">
                            {cls.stream}
                          </Badge>
                        ) : (
                          <span className="text-muted small">General</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1 flex-wrap">
                          {classSecs.length > 0 ? (
                            classSecs.map((s) => (
                              <Badge
                                key={s.id}
                                bg="primary-subtle"
                                text="primary"
                                className="border border-primary-subtle font-monospace fw-normal"
                              >
                                {cls.name}-{s.sectionName}
                              </Badge>
                            ))
                          ) : (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-decoration-none small text-primary"
                              onClick={() => handleOpenCreateSection(cls.id)}
                            >
                              + Add Section
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <Button
                            variant="light"
                            size="sm"
                            className="p-1 text-secondary"
                            onClick={() => handleOpenEditClass(cls)}
                            title="Edit Class"
                          >
                            <Edit2 size={13} />
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="p-1 text-danger"
                            onClick={() => handleDeleteClass(cls)}
                            title="Delete Class"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card>
      )}

      {/* TAB 2: SECTIONS GRID */}
      {activeTab === 'sections' && (
        <Row className="g-2.5">
          {filteredSections.length === 0 ? (
            <Col xs={12}>
              <Card className="border border-dashed shadow-none text-center py-4">
                <Card.Body>
                  <p className="text-muted small mb-0">
                    No sections match the current criteria. Click "Add Section" to create one.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            filteredSections.map((sec) => {
              const capacityPercent = Math.round((sec.currentCount / sec.maxCapacity) * 100);
              const isFull = sec.currentCount >= sec.maxCapacity;

              return (
                <Col key={sec.id} sm={6} md={4} lg={3}>
                  <Card className="h-100 border shadow-none">
                    <Card.Body className="p-3 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex align-items-start justify-content-between mb-2">
                          <div>
                            <span
                              className="text-muted small text-uppercase"
                              style={{ fontSize: '0.7rem' }}
                            >
                              {sec.className}
                            </span>
                            <div className="fw-bold text-body" style={{ fontSize: '0.9rem' }}>
                              Section {sec.sectionName}
                            </div>
                          </div>
                          <Badge bg={isFull ? 'danger' : 'success'} className="fw-normal">
                            {isFull ? 'FULL' : 'OPEN'}
                          </Badge>
                        </div>

                        {/* Enrollment Progress */}
                        <div className="my-2">
                          <div
                            className="d-flex justify-content-between text-muted small mb-1"
                            style={{ fontSize: '0.75rem' }}
                          >
                            <span className="d-flex align-items-center gap-1">
                              <Users size={12} /> Students:
                            </span>
                            <span className="font-monospace">
                              {sec.currentCount} / {sec.maxCapacity} ({capacityPercent}%)
                            </span>
                          </div>
                          <ProgressBar
                            now={Math.min(100, capacityPercent)}
                            variant={
                              capacityPercent > 90
                                ? 'danger'
                                : capacityPercent > 70
                                  ? 'warning'
                                  : 'primary'
                            }
                            style={{ height: '5px' }}
                          />
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between pt-2 mt-2 border-top">
                        <span className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                          ID: {sec.id.slice(0, 8)}...
                        </span>
                        {canManage && (
                          <div className="d-flex align-items-center gap-1">
                            <Button
                              variant="light"
                              size="sm"
                              className="p-1 text-secondary"
                              onClick={() => handleOpenEditSection(sec)}
                              title="Edit Section"
                            >
                              <Edit2 size={13} />
                            </Button>
                            <Button
                              variant="light"
                              size="sm"
                              className="p-1 text-danger"
                              onClick={() => handleDeleteSection(sec)}
                              title="Delete Section"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          )}
        </Row>
      )}

      {/* CREATE CLASS MODAL */}
      <Modal show={isCreateClassOpen} onHide={() => setIsCreateClassOpen(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '0.95rem' }}>Add Class Standard</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateClassSubmit}>
          <Modal.Body className="py-2.5">
            <Form.Group className="mb-2.5">
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Class Name *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Grade 11"
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                size="sm"
              />
            </Form.Group>

            <Row className="g-2 mb-2.5">
              <Col xs={6}>
                <Form.Group className="mb-2.5">
                  <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Class Code *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="G-11"
                    value={classForm.code}
                    onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
                    size="sm"
                    className="font-monospace text-uppercase"
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group className="mb-2.5">
                  <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Numeric Order *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min={1}
                    max={20}
                    value={classForm.numericOrder}
                    onChange={(e) =>
                      setClassForm({ ...classForm, numericOrder: Number(e.target.value) })
                    }
                    size="sm"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2.5">
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Stream Specialization
              </Form.Label>
              <Form.Select
                value={classForm.stream}
                onChange={(e) => setClassForm({ ...classForm, stream: e.target.value as any })}
                size="sm"
              >
                <option value="">None (Standard General)</option>
                <option value="SCIENCE">Science &amp; Technology</option>
                <option value="COMMERCE">Commerce &amp; Business</option>
                <option value="ARTS">Arts &amp; Humanities</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="py-2">
            <Button variant="secondary" size="sm" onClick={() => setIsCreateClassOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isProcessing}>
              {isProcessing ? 'Saving...' : 'Add Class'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* EDIT CLASS MODAL */}
      <Modal show={isEditClassOpen} onHide={() => setIsEditClassOpen(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '0.95rem' }}>Edit Class Standard</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditClassSubmit}>
          <Modal.Body className="py-2.5">
            <Form.Group className="mb-2.5">
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Class Name *</Form.Label>
              <Form.Control
                type="text"
                required
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                size="sm"
              />
            </Form.Group>

            <Row className="g-2 mb-2.5">
              <Col xs={6}>
                <Form.Group className="mb-2.5">
                  <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Class Code *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={classForm.code}
                    onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
                    size="sm"
                    className="font-monospace text-uppercase"
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group className="mb-2.5">
                  <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Numeric Order *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min={1}
                    max={20}
                    value={classForm.numericOrder}
                    onChange={(e) =>
                      setClassForm({ ...classForm, numericOrder: Number(e.target.value) })
                    }
                    size="sm"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2.5">
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Stream Specialization
              </Form.Label>
              <Form.Select
                value={classForm.stream}
                onChange={(e) => setClassForm({ ...classForm, stream: e.target.value as any })}
                size="sm"
              >
                <option value="">None (Standard General)</option>
                <option value="SCIENCE">Science &amp; Technology</option>
                <option value="COMMERCE">Commerce &amp; Business</option>
                <option value="ARTS">Arts &amp; Humanities</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="py-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditClassOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isProcessing}>
              {isProcessing ? 'Saving...' : 'Update Class'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* CREATE SECTION MODAL */}
      <Modal
        show={isCreateSectionOpen}
        onHide={() => setIsCreateSectionOpen(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '0.95rem' }}>Add Classroom Section</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSectionSubmit}>
          <Modal.Body className="py-2.5">
            <Form.Group className="mb-2.5">
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Class Standard *
              </Form.Label>
              <Form.Select
                required
                value={sectionForm.classId}
                onChange={(e) => setSectionForm({ ...sectionForm, classId: e.target.value })}
                size="sm"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row className="g-2 mb-2.5">
              <Col xs={6}>
                <Form.Group className="mb-2.5">
                  <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Section Name *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    required
                    maxLength={10}
                    placeholder="e.g. A"
                    value={sectionForm.sectionName}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, sectionName: e.target.value })
                    }
                    size="sm"
                    className="font-monospace text-uppercase fw-bold"
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group className="mb-2.5">
                  <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Capacity Cap *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min={5}
                    max={100}
                    value={sectionForm.maxCapacity}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, maxCapacity: Number(e.target.value) })
                    }
                    size="sm"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="py-2">
            <Button variant="secondary" size="sm" onClick={() => setIsCreateSectionOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isProcessing}>
              {isProcessing ? 'Allocating...' : 'Allocate Section'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* EDIT SECTION MODAL */}
      <Modal show={isEditSectionOpen} onHide={() => setIsEditSectionOpen(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '0.95rem' }}>
            Edit Section {selectedSection?.className}-{selectedSection?.sectionName}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSectionSubmit}>
          <Modal.Body className="py-2.5">
            <Form.Group className="mb-2.5">
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Section Name *
              </Form.Label>
              <Form.Control
                type="text"
                required
                value={sectionForm.sectionName}
                onChange={(e) => setSectionForm({ ...sectionForm, sectionName: e.target.value })}
                size="sm"
                className="font-monospace text-uppercase fw-bold"
              />
            </Form.Group>

            <Form.Group className="mb-2.5">
              <Form.Label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Maximum Student Capacity *
              </Form.Label>
              <Form.Control
                type="number"
                required
                min={selectedSection ? selectedSection.currentCount : 1}
                value={sectionForm.maxCapacity}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, maxCapacity: Number(e.target.value) })
                }
                size="sm"
              />
              {selectedSection && (
                <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Current enrolled count: {selectedSection.currentCount} students.
                </Form.Text>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="py-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditSectionOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isProcessing}>
              {isProcessing ? 'Updating...' : 'Update Section'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};
