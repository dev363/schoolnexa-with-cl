import React, { useState, useRef } from 'react';
import { Card, Row, Col, Badge, Modal, Form, Button, Alert } from 'react-bootstrap';
import { Plus, Trash2, FileText, Edit2, Upload, Eye } from 'lucide-react';
import { cloneDeep } from 'lodash';
import {
  TeacherDocument,
  DocumentType,
  DocumentVerificationStatus,
} from '@/components/pages/teachers/types';
import { ActionButton } from '@/components/common';
import { useTeacherFormContext } from '@/components/pages/teachers/context/TeacherFormContext';
import {
  DOCUMENT_TYPE_OPTIONS,
  DOCUMENT_STATUS_OPTIONS,
} from '@/components/pages/teachers/constants';
import { useDebouncedTeacherSectionState } from '@/components/pages/teachers/hooks';

export interface FormDocumentsTabProps {
  isDark?: boolean;
}

export const FormDocumentsTab: React.FC<FormDocumentsTabProps> = ({ isDark = false }) => {
  const { state, handleTopStateChange } = useTeacherFormContext();

  const { localState, setLocalState, syncToContext } =
    useDebouncedTeacherSectionState<TeacherDocument>({
      contextValue: state.documents,
      onContextChange: (nextDocuments) => {
        handleTopStateChange((prev) => ({
          ...prev,
          documents: nextDocuments,
        }));
      },
    });

  // Temporary UI state for modal editing, preview, and uploads
  const [editingDoc, setEditingDoc] = useState<TeacherDocument | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editValidationError, setEditValidationError] = useState<string | null>(null);

  const [previewDoc, setPreviewDoc] = useState<TeacherDocument | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const newDoc: TeacherDocument = {
      id: `doc-${Date.now()}`,
      name: `Certificate_${Date.now().toString().slice(-4)}.pdf`,
      type: 'QUALIFICATION_CERTIFICATE',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'VERIFIED',
      fileSize: '512 KB',
    };
    setLocalState((prev) => {
      const nextState = [...prev, newDoc];
      syncToContext(nextState);
      return nextState;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      let fileUrl: string | undefined = undefined;
      try {
        fileUrl = URL.createObjectURL(file);
      } catch {
        // Safe fallback if createObjectURL is unavailable
      }
      const newDoc: TeacherDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: 'OTHER',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'VERIFIED',
        fileSize: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        fileUrl,
      };
      setLocalState((prev) => {
        const nextState = [...prev, newDoc];
        syncToContext(nextState);
        return nextState;
      });
    }
    if (e.target) e.target.value = '';
  };

  const handleUpdate = <K extends keyof TeacherDocument>(
    id: string,
    field: K,
    value: TeacherDocument[K],
  ) => {
    setLocalState((prev) => {
      const nextState = prev.map((doc) => (doc.id === id ? { ...doc, [field]: value } : doc));
      syncToContext(nextState);
      return nextState;
    });
  };

  const handleRemove = (id: string) => {
    setLocalState((prev) => {
      const nextState = prev.filter((doc) => doc.id !== id);
      syncToContext(nextState);
      return nextState;
    });
  };

  const handleStartEdit = (doc: TeacherDocument) => {
    setEditingDoc(cloneDeep(doc));
    setEditValidationError(null);
    setShowEditModal(true);
  };

  const handleSaveModal = () => {
    if (!editingDoc) return;
    if (!editingDoc.name.trim()) {
      setEditValidationError('Document name is required.');
      return;
    }
    setLocalState((prev) => {
      const nextState = prev.map((d) => (d.id === editingDoc.id ? editingDoc : d));
      syncToContext(nextState);
      return nextState;
    });
    setShowEditModal(false);
    setEditingDoc(null);
    setEditValidationError(null);
  };

  const handlePreview = (doc: TeacherDocument) => {
    setPreviewDoc(doc);
    setShowPreviewModal(true);
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
          <span className="fw-bold small text-uppercase text-muted">Documents</span>
          {localState.length > 0 && (
            <Badge bg="secondary" pill className="fw-normal" style={{ fontSize: '0.75rem' }}>
              {localState.length}
            </Badge>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          <ActionButton
            name="Upload File"
            icon={Upload}
            action={() => fileInputRef.current?.click()}
            variant="outline-secondary"
            size="sm"
          />
          <ActionButton
            name="Add Document"
            icon={Plus}
            action={handleAdd}
            variant="outline-primary"
            size="sm"
          />
          <input
            type="file"
            ref={fileInputRef}
            className="d-none"
            onChange={handleFileSelect}
          />
        </div>
      </Card.Header>
      <Card.Body className="p-3">
        {localState.length === 0 ? (
          <p className="text-muted small text-center py-4 mb-0">No documents uploaded yet.</p>
        ) : (
          <div>
            {/* Desktop Column Headers */}
            <div className="d-none d-md-block px-3 py-1 mb-2 border-bottom bg-light bg-opacity-25 rounded-top">
              <Row className="g-2 text-muted small fw-semibold align-items-center">
                <Col md={4}>Document Name</Col>
                <Col md={2}>Type / Category</Col>
                <Col md={2}>Upload Date</Col>
                <Col md={1} className="text-center">
                  Status
                </Col>
                <Col md={1} className="text-center">
                  Size
                </Col>
                <Col md={2} className="text-end">
                  Actions
                </Col>
              </Row>
            </div>

            {/* Document Records */}
            <div className="d-flex flex-column gap-2">
              {localState.map((doc) => (
                <div
                  key={doc.id}
                  className={`px-3 py-2 rounded border ${
                    isDark
                      ? 'bg-secondary bg-opacity-10 border-secondary'
                      : 'bg-light bg-opacity-40 border-light-subtle'
                  }`}
                >
                  <Row className="g-2 align-items-center">
                    {/* Document Name */}
                    <Col xs={12} md={4}>
                      <span className="d-md-none small fw-semibold text-muted d-block">
                        Document Name:
                      </span>
                      <div className="d-flex align-items-center gap-2 text-truncate">
                        <FileText size={15} className="text-primary flex-shrink-0" />
                        <button
                          type="button"
                          className="btn btn-link p-0 text-start fw-semibold text-truncate text-decoration-none"
                          onClick={() => handlePreview(doc)}
                          title={`Preview ${doc.name}`}
                          style={{ maxWidth: 'calc(100% - 25px)' }}
                        >
                          {doc.name}
                        </button>
                      </div>
                    </Col>

                    {/* Type / Category */}
                    <Col xs={6} md={2}>
                      <span className="d-md-none small fw-semibold text-muted d-block">
                        Category:
                      </span>
                      <Badge
                        bg="light"
                        text="dark"
                        className="border text-truncate"
                        style={{ maxWidth: '100%' }}
                      >
                        {doc.type.replace(/_/g, ' ')}
                      </Badge>
                    </Col>

                    {/* Upload Date */}
                    <Col xs={6} md={2}>
                      <span className="d-md-none small fw-semibold text-muted d-block">
                        Upload Date:
                      </span>
                      <span className="text-muted small font-monospace">{doc.uploadDate}</span>
                    </Col>

                    {/* Status */}
                    <Col xs={6} md={1} className="text-md-center">
                      <div className="d-flex d-md-block align-items-center gap-1.5 justify-content-md-center">
                        <span className="d-md-none small fw-semibold text-muted">Status:</span>
                        <Badge
                          bg={doc.status === 'VERIFIED' ? 'success' : 'warning'}
                          className="fw-normal"
                        >
                          {doc.status}
                        </Badge>
                      </div>
                    </Col>

                    {/* Size */}
                    <Col xs={6} md={1} className="text-md-center">
                      <span className="d-md-none small fw-semibold text-muted d-block">
                        Size:
                      </span>
                      <span className="text-muted small font-monospace">
                        {doc.fileSize || '380 KB'}
                      </span>
                    </Col>

                    {/* Actions */}
                    <Col xs={12} md={2} className="text-end d-flex align-items-center justify-content-end gap-1">
                      <ActionButton
                        name="Preview"
                        icon={Eye}
                        action={() => handlePreview(doc)}
                        variant="outline-primary"
                        size="sm"
                        iconOnly
                        title="Preview Document"
                        className="border-0"
                      />
                      <ActionButton
                        name="Edit"
                        icon={Edit2}
                        action={() => handleStartEdit(doc)}
                        variant="outline-secondary"
                        size="sm"
                        iconOnly
                        title="Edit Document"
                        className="border-0"
                      />
                      <ActionButton
                        name="Delete"
                        icon={Trash2}
                        action={() => handleRemove(doc.id)}
                        variant="outline-danger"
                        size="sm"
                        iconOnly
                        title="Delete Document"
                        className="border-0"
                      />
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>

      {/* Edit Document Modal */}
      <Modal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditingDoc(null);
          setEditValidationError(null);
        }}
        centered
        data-bs-theme={isDark ? 'dark' : 'light'}
      >
        <Modal.Header closeButton className={isDark ? 'border-secondary' : ''}>
          <Modal.Title className="h6">Edit Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingDoc && (
            <Form className="d-flex flex-column gap-3">
              {editValidationError && (
                <Alert variant="danger" className="py-1.5 px-2 mb-0 small">
                  {editValidationError}
                </Alert>
              )}
              <Form.Group>
                <Form.Label className="small fw-semibold">Document Name</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  value={editingDoc.name}
                  onChange={(e) => {
                    setEditingDoc({ ...editingDoc, name: e.target.value });
                    if (editValidationError) setEditValidationError(null);
                  }}
                  placeholder="e.g. Master_Degree_Certificate.pdf"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="small fw-semibold">Category / Type</Form.Label>
                <Form.Select
                  size="sm"
                  value={editingDoc.type}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, type: e.target.value as DocumentType })
                  }
                >
                  {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label className="small fw-semibold">Verification Status</Form.Label>
                <Form.Select
                  size="sm"
                  value={editingDoc.status}
                  onChange={(e) =>
                    setEditingDoc({
                      ...editingDoc,
                      status: e.target.value as DocumentVerificationStatus,
                    })
                  }
                >
                  {DOCUMENT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label className="small fw-semibold">Replace File (Optional)</Form.Label>
                <Form.Control
                  type="file"
                  size="sm"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      let fileUrl: string | undefined = undefined;
                      try {
                        fileUrl = URL.createObjectURL(file);
                      } catch {
                        // Safe fallback
                      }
                      setEditingDoc({
                        ...editingDoc,
                        name: file.name,
                        fileSize: `${Math.max(1, Math.round(file.size / 1024))} KB`,
                        fileUrl: fileUrl || editingDoc.fileUrl,
                      });
                    }
                  }}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className={isDark ? 'border-secondary' : ''}>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setShowEditModal(false);
              setEditingDoc(null);
              setEditValidationError(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveModal}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Preview Document Modal */}
      <Modal
        show={showPreviewModal}
        onHide={() => {
          setShowPreviewModal(false);
          setPreviewDoc(null);
        }}
        centered
        size="lg"
        data-bs-theme={isDark ? 'dark' : 'light'}
      >
        <Modal.Header closeButton className={isDark ? 'border-secondary' : ''}>
          <Modal.Title className="h6 d-flex align-items-center gap-2">
            <FileText size={18} className="text-primary" />
            <span>{previewDoc?.name || 'Document Preview'}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {previewDoc && (
            <div className="d-flex flex-column gap-3">
              <div className="p-3 rounded border bg-light bg-opacity-25 d-flex flex-wrap align-items-center justify-content-between gap-2 small">
                <div>
                  <span className="text-muted">Type: </span>
                  <Badge bg="secondary" className="fw-normal me-2">
                    {previewDoc.type.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-muted">Status: </span>
                  <Badge
                    bg={previewDoc.status === 'VERIFIED' ? 'success' : 'warning'}
                    className="fw-normal"
                  >
                    {previewDoc.status}
                  </Badge>
                </div>
                <div className="text-muted font-monospace">
                  <span>Uploaded: {previewDoc.uploadDate}</span>
                  {previewDoc.fileSize && <span className="ms-2">({previewDoc.fileSize})</span>}
                </div>
              </div>

              {previewDoc.fileUrl ? (
                <div className="border rounded p-3 text-center bg-light bg-opacity-10">
                  {previewDoc.name.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i) ? (
                    <img
                      src={previewDoc.fileUrl}
                      alt={previewDoc.name}
                      className="img-fluid rounded mx-auto d-block"
                      style={{ maxHeight: '450px' }}
                    />
                  ) : (
                    <div className="py-4">
                      <FileText size={48} className="text-primary mb-2" />
                      <p className="small text-muted mb-2">
                        Preview is available for this document.
                      </p>
                      <a
                        href={previewDoc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        Open / View Document
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded p-4 text-center text-muted small bg-light bg-opacity-10">
                  <FileText size={42} className="text-secondary mb-2 opacity-50" />
                  <p className="mb-1 fw-semibold">{previewDoc.name}</p>
                  <p className="mb-0">
                    Document record is on file in the school archives.
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={isDark ? 'border-secondary' : ''}>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setShowPreviewModal(false);
              setPreviewDoc(null);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export const DocumentsTab = FormDocumentsTab;
export default DocumentsTab;
