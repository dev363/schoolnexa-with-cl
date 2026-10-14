import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export interface SchoolProvisionModalProps {
  show: boolean;
  onHide: () => void;
}

export const SchoolProvisionModal: React.FC<SchoolProvisionModalProps> = ({ show, onHide }) => {
  const { createSchool } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: '',
    code: '',
    domain: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const reset = () => {
    setForm({ name: '', code: '', domain: '' });
    setError(null);
  };

  const handleClose = () => {
    reset();
    onHide();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createSchool(
        form.name.trim(),
        form.code.trim().toUpperCase(),
        form.domain.trim() || undefined,
      );
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to provision school');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="sm">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">
            {t.modals?.provisionSchoolTitle || t.topbar?.provisionNewSchool || 'Provision Campus'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-3">
          {error && (
            <Alert variant="danger" className="py-1 px-2 small mb-3">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-2.5">
            <Form.Label className="small fw-semibold mb-1">
              {t.modals?.schoolName || 'Campus Name'} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              size="sm"
              placeholder={t.modals?.schoolNamePlaceholder || 'e.g. Greenwood High'}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-2.5">
            <Form.Label className="small fw-semibold mb-1">
              {t.modals?.schoolCode || 'Campus Code'} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              size="sm"
              placeholder={t.modals?.schoolCodePlaceholder || 'e.g. GWH-NORTH'}
              value={form.code}
              onChange={(e) => update('code', e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold mb-1">
              {t.modals?.customDomain || 'Domain / Subdomain'}
            </Form.Label>
            <Form.Control
              type="text"
              size="sm"
              placeholder={t.modals?.customDomainPlaceholder || 'e.g. gwh.schoolnexa.edu'}
              value={form.domain}
              onChange={(e) => update('domain', e.target.value)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="py-2 px-3">
          <Button variant="outline-secondary" size="sm" onClick={handleClose}>
            {t.common?.cancel || 'Cancel'}
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={submitting}>
            {submitting
              ? t.common?.loading || 'Saving...'
              : t.modals?.createSchoolBtn || t.common?.save || 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SchoolProvisionModal;
