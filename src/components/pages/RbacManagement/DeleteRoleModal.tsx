import React from 'react';
import { Modal, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useLanguage } from '@/context/LanguageContext';
import { RoleSummary } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface DeleteRoleModalProps {
  show: boolean;
  role: RoleSummary | null;
  onHide: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteRoleModal: React.FC<DeleteRoleModalProps> = ({
  show,
  role,
  onHide,
  onConfirm,
  isDeleting,
}) => {
  const { t } = useLanguage();

  if (!role) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h6 fw-bold mb-0 text-danger d-flex align-items-center gap-1.5">
          <AlertTriangle size={18} />
          <span>{t.rbac.deleteRoleTitle}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">
        <p className="small mb-2">
          {t.rbac.confirmDeleteRoleText}{' '}
          <strong className="text-dark dark:text-light">{role.name}</strong> (
          <span className="font-monospace text-muted">{role.code}</span>)?
        </p>
        <Alert variant="danger" className="py-2 px-2.5 small mb-0 d-flex align-items-start gap-2">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <div style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>{t.rbac.deleteRoleWarning}</div>
        </Alert>
      </Modal.Body>
      <Modal.Footer className="py-2">
        <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={isDeleting}>
          {t.common.cancel}
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? (
            <>
              <Spinner size="sm" className="me-1.5" />
              {t.rbac.deleting}
            </>
          ) : (
            t.common.delete
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
