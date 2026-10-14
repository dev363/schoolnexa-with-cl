import React, { useState } from 'react';
import { Dropdown, Badge, Image } from 'react-bootstrap';
import { User, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { SecurityModal } from './SecurityModal';
import { LogoutConfirmModal } from './LogoutConfirmModal';

export const UserMenu: React.FC = () => {
  const { user, currentRoles, logout } = useAuth();
  const { t } = useLanguage();

  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const primaryRole = currentRoles[0]?.name || (user?.isSuperAdmin ? t.common?.superAdmin || 'Global Admin' : 'Staff');

  return (
    <>
      <Dropdown align="end">
        <Dropdown.Toggle
          id="header-user-menu-btn"
          variant="outline-secondary"
          size="sm"
          className="p-1 d-flex align-items-center justify-content-center gap-1.5"
          style={{ height: '32px' }}
        >
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.fullName || 'User'}
              roundedCircle
              style={{ width: '22px', height: '22px', objectFit: 'cover' }}
            />
          ) : (
            <User size={16} />
          )}
          <span
            className="d-none d-md-inline-block text-truncate fw-medium small"
            style={{ maxWidth: '110px', fontSize: '0.8rem' }}
          >
            {user?.fullName?.split(' ')[0] || 'Account'}
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu className="shadow border p-1" style={{ minWidth: '220px' }}>
          {user && (
            <>
              <div className="px-2.5 py-1.5 border-bottom mb-1">
                <div className="fw-semibold text-truncate small">{user.fullName}</div>
                <div className="text-muted text-truncate font-monospace" style={{ fontSize: '0.72rem' }}>
                  {user.email}
                </div>
                <div className="mt-1">
                  <Badge bg="primary" className="fw-normal" style={{ fontSize: '0.65rem' }}>
                    {primaryRole}
                  </Badge>
                </div>
              </div>

              <Dropdown.Item
                id="header-security-modal-btn"
                onClick={() => setShowSecurityModal(true)}
                className="d-flex align-items-center gap-2 py-1.5 px-2 rounded small"
              >
                <ShieldCheck size={14} className="text-primary flex-shrink-0" />
                <span>{t.topbar?.securityAndEntitlements || 'Security & Entitlements'}</span>
              </Dropdown.Item>

              <Dropdown.Divider className="my-1" />

              <Dropdown.Item
                id="header-logout-btn"
                onClick={() => setShowLogoutModal(true)}
                className="d-flex align-items-center gap-2 py-1.5 px-2 rounded small text-danger"
              >
                <LogOut size={14} className="flex-shrink-0" />
                <span>{t.topbar?.signOutSession || t.common?.signOut || 'Sign Out'}</span>
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>

      {/* Security & Entitlements Modal */}
      <SecurityModal
        show={showSecurityModal}
        onHide={() => setShowSecurityModal(false)}
      />

      {/* Confirm Sign Out Modal */}
      <LogoutConfirmModal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        isSubmitting={isLoggingOut}
      />
    </>
  );
};

export default UserMenu;
