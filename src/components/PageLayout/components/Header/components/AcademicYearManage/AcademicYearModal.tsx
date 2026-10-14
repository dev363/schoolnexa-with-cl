import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export interface AcademicYearModalProps {
  show: boolean;
  onHide: () => void;
}

export const AcademicYearModal: React.FC<AcademicYearModalProps> = ({ show, onHide }) => {
  const { createAcademicYear } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: '',
    code: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const reset = () => {
    setForm({ name: '', code: '', startDate: '', endDate: '' });
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
      await createAcademicYear(
        form.name.trim(),
        form.code.trim().toUpperCase(),
        form.startDate,
        form.endDate,
      );
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create academic year');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="sm">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">
            {t.modals?.addYearTitle || t.topbar?.addAcademicSession || 'Add Academic Year'}
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
              Title <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              size="sm"
              placeholder={t.modals?.yearTitlePlaceholder || 'e.g. 2026-2027'}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-2.5">
            <Form.Label className="small fw-semibold mb-1">
              Code <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              size="sm"
              placeholder={t.modals?.yearCodePlaceholder || 'e.g. AY-2026-27'}
              value={form.code}
              onChange={(e) => update('code', e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-2.5">
            <Form.Label className="small fw-semibold mb-1">
              {t.modals?.startDate || t.common?.date || 'Start Date'}
            </Form.Label>
            <Form.Control
              type="date"
              size="sm"
              value={form.startDate}
              onChange={(e) => update('startDate', e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold mb-1">
              {t.modals?.endDate || 'End Date'}
            </Form.Label>
            <Form.Control
              type="date"
              size="sm"
              value={form.endDate}
              onChange={(e) => update('endDate', e.target.value)}
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
              : t.modals?.saveYearBtn || t.common?.save || 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AcademicYearModal;
