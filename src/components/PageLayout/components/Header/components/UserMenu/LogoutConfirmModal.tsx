import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { LogOut } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface LogoutConfirmModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => Promise<void> | void;
  isSubmitting?: boolean;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  show,
  onHide,
  onConfirm,
  isSubmitting = false,
}) => {
  const { t } = useLanguage();

  return (
    <Modal id="logout-confirm-modal" show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton className="py-2.5 px-3">
        <Modal.Title
          id="logout-modal-title"
          className="h6 mb-0 d-flex align-items-center gap-2 text-danger"
        >
          <LogOut size={16} />
          <span>{t.common?.signOut || 'Sign Out'}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3">
        <p className="small text-body-secondary mb-0">
          Are you sure you want to terminate your active session and sign out of SchoolNexa ERP?
        </p>
      </Modal.Body>

      <Modal.Footer className="py-2 px-3 d-flex justify-content-end gap-2">
        <Button
          id="cancel-logout-btn"
          variant="outline-secondary"
          size="sm"
          onClick={onHide}
          disabled={isSubmitting}
        >
          {t.common?.close || 'Cancel'}
        </Button>
        <Button
          id="confirm-logout-btn"
          variant="danger"
          size="sm"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing out...' : t.common?.signOut || 'Sign Out'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LogoutConfirmModal;
