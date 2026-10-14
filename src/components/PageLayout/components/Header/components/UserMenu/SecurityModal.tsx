import React from 'react';
import { Modal, Button, Badge, ListGroup } from 'react-bootstrap';
import { ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export interface SecurityModalProps {
  show: boolean;
  onHide: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ show, onHide }) => {
  const { user, currentRoles, activeSchool, activeAcademicYear } = useAuth();
  const { t } = useLanguage();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h6 mb-0 d-flex align-items-center gap-2">
          <ShieldCheck size={18} className="text-primary" />
          <span>{t.topbar?.securityAndEntitlements || 'Security & Entitlements'}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3">
        {/* User Context */}
        <div className="p-2.5 rounded border bg-body-tertiary mb-3">
          <div className="fw-semibold text-truncate">{user?.fullName}</div>
          <div className="text-muted small font-monospace">{user?.email}</div>
          <div className="d-flex flex-wrap gap-1 mt-1.5">
            {currentRoles.map((role) => (
              <Badge
                key={role.id}
                bg="primary"
                className="fw-normal font-monospace"
                style={{ fontSize: '0.68rem' }}
              >
                {role.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tenant Scope */}
        <div className="mb-3">
          <div
            className="text-muted small fw-semibold text-uppercase mb-1"
            style={{ fontSize: '0.7rem' }}
          >
            {t.common?.tenantIsolated || 'Tenant Isolated'}
          </div>
          <div className="d-flex flex-wrap gap-2">
            <div className="px-2 py-1 rounded border bg-body-tertiary small">
              <span className="text-muted">{t.common?.tenant || 'Campus'}: </span>
              <span className="fw-semibold font-monospace">
                {activeSchool?.name} ({activeSchool?.code})
              </span>
            </div>
            <div className="px-2 py-1 rounded border bg-body-tertiary small">
              <span className="text-muted">{t.common?.session || 'Session'}: </span>
              <span className="fw-semibold font-monospace text-success">
                {activeAcademicYear?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Permissions list */}
        <div>
          <div
            className="text-muted small fw-semibold text-uppercase mb-1"
            style={{ fontSize: '0.7rem' }}
          >
            {t.topbar?.grantedPermissions || 'Granted Permissions'}
          </div>
          <div style={{ maxHeight: '180px', overflowY: 'auto' }} className="border rounded">
            <ListGroup variant="flush">
              {currentRoles
                .flatMap((r) => r.permissions)
                .map((perm, idx) => (
                  <ListGroup.Item
                    key={idx}
                    className="py-1 px-2.5 small d-flex align-items-center gap-2"
                  >
                    <Lock size={12} className="text-muted flex-shrink-0" />
                    <span className="font-monospace text-truncate" style={{ fontSize: '0.75rem' }}>
                      {perm}
                    </span>
                  </ListGroup.Item>
                ))}
            </ListGroup>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="py-2 px-3">
        <Button variant="secondary" size="sm" onClick={onHide}>
          {t.common?.close || 'Close'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SecurityModal;
