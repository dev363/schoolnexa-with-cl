import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Badge } from 'react-bootstrap';
import { useLanguage } from '@/context/LanguageContext';
import { RoleSummary } from '@/types';

interface EditRoleModalProps {
  show: boolean;
  role: RoleSummary | null;
  onHide: () => void;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  isSubmitting: boolean;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({
  show,
  role,
  onHide,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (role) {
      setForm({
        name: role.name || '',
        description: role.description || '',
      });
    }
  }, [role, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || isSubmitting) return;
    await onSubmit(form);
  };

  if (!role) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <div className="d-flex align-items-center gap-2">
          <Modal.Title className="h6 fw-bold mb-0">{t.rbac.editRoleTitle}</Modal.Title>
          <Badge
            bg="secondary-subtle"
            text="secondary"
            className="font-monospace"
            style={{ fontSize: '0.68rem' }}
          >
            {role.code}
          </Badge>
        </div>
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
            disabled={isSubmitting || !form.name.trim()}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="me-1.5" />
                {t.rbac.saving}
              </>
            ) : (
              t.common.save
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
