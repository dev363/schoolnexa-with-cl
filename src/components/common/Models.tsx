import { ReactNode } from 'react';
import { Modal } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';
import { ActionButtonGroup, ActionButtonProps } from '@/components/common/Buttons';

interface ConfirmModalProps {
  show: boolean;
  onHide: () => void;

  title: string;
  icon?: ReactNode;
  description: ReactNode;

  actions: ActionButtonProps[];
}

export const ConfirmModal = ({
  show,
  onHide,
  title,
  icon,
  description,
  actions,
}: ConfirmModalProps) => {
  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title className="text-sm fw-semibold d-flex align-items-center gap-2">
          {icon ?? <AlertTriangle size={16} className="text-danger" />}
          <span>{title}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-xs">{description}</Modal.Body>

      <Modal.Footer className="py-2">
        <ActionButtonGroup actions={actions} />
      </Modal.Footer>
    </Modal>
  );
};
