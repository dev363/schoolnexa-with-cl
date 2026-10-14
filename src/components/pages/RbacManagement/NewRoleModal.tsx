import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { useLanguage } from '@/context/LanguageContext';

interface NewRoleModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: { name: string; code: string; description: string }) => Promise<void>;
  isSubmitting: boolean;
}

export const NewRoleModal: React.FC<NewRoleModalProps> = ({
  show,
  onHide,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
  });

  useEffect(() => {
    if (show) {
      setForm({ name: '', code: '', description: '' });
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim() || isSubmitting) return;
    await onSubmit(form);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h6 fw-bold mb-0">{t.rbac.newRoleModalTitle}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-3">
          <Form.Group className="mb-2.5">
            <Form.Label className="small fw-semibold mb-1">{t.rbac.roleName}</Form.Label>
            <Form.Control
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t.rbac.roleNamePlaceholder}
              size="sm"
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group className="mb-2.5">
            <Form.Label className="small fw-semibold mb-1">{t.rbac.roleCode}</Form.Label>
            <Form.Control
              type="text"
              required
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder={t.rbac.roleCodePlaceholder}
              size="sm"
              className="font-monospace text-uppercase"
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label className="small fw-semibold mb-1">{t.rbac.roleDescription}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder={t.rbac.roleDescriptionPlaceholder}
              size="sm"
              disabled={isSubmitting}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="py-2">
          <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={isSubmitting}>
            {t.common.cancel}
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={isSubmitting || !form.name.trim() || !form.code.trim()}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="me-1.5" />
                {t.rbac.saving}
              </>
            ) : (
              t.rbac.createCustomRole
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
