import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Badge, Button, Stack, Spinner } from 'react-bootstrap';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { RoleSummary } from '@/types';
import { SYSTEM_PERMISSIONS } from '@/data/auth-seed';
import { Lock, Check, Save, RotateCcw, CheckCheck, XCircle } from 'lucide-react';

interface PermissionMatrixCardProps {
  role: RoleSummary | null;
  canManageRoles: boolean;
  isSavingPerms: boolean;
  onSavePermissions: (newPermissions: string[]) => Promise<void>;
}

export const PermissionMatrixCard: React.FC<PermissionMatrixCardProps> = ({
  role,
  canManageRoles,
  isSavingPerms,
  onSavePermissions,
}) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeModuleFilter, setActiveModuleFilter] = useState<string>('ALL');

  // Draft permissions state - only saved when user explicitly clicks "Save Permissions"
  const [draftPermissions, setDraftPermissions] = useState<string[]>(
    role ? [...role.permissions] : [],
  );

  // Sync draft whenever active role changes or original permissions update after saving
  useEffect(() => {
    if (role) {
      setDraftPermissions([...role.permissions]);
    } else {
      setDraftPermissions([]);
    }
  }, [role?.id, role?.permissions]);

  if (!role) {
    return (
      <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
        <Card.Body className="text-center py-5 text-muted small">
          Select a role to inspect and configure permissions
        </Card.Body>
      </Card>
    );
  }

  const isLocked = role.isSystem;

  // Detect whether draft differs from committed role permissions
  const hasUnsavedChanges = useMemo(() => {
    if (!role) return false;
    if (draftPermissions.length !== role.permissions.length) return true;
    const originalSet = new Set(role.permissions);
    return draftPermissions.some((p) => !originalSet.has(p));
  }, [draftPermissions, role]);

  const modules = Array.from(new Set(SYSTEM_PERMISSIONS.map((p) => p.module)));

  const filteredPermissions = SYSTEM_PERMISSIONS.filter((p) => {
    if (activeModuleFilter === 'ALL') return true;
    return p.module === activeModuleFilter;
  });

  // Toggle permission in local draft only (NO API CALL)
  const handleToggleDraftPermission = (permCode: string) => {
    if (isLocked || isSavingPerms || !canManageRoles) return;
    setDraftPermissions((prev) =>
      prev.includes(permCode) ? prev.filter((c) => c !== permCode) : [...prev, permCode],
    );
  };

  // Discard pending changes
  const handleDiscardChanges = () => {
    if (role) {
      setDraftPermissions([...role.permissions]);
    }
  };

  // Select all in current module filter
  const handleSelectAllFiltered = () => {
    if (isLocked || isSavingPerms || !canManageRoles) return;
    const currentModuleCodes = filteredPermissions.map((p) => p.code);
    setDraftPermissions((prev) => {
      const set = new Set([...prev, ...currentModuleCodes]);
      return Array.from(set);
    });
  };

  // Clear all in current module filter
  const handleClearFiltered = () => {
    if (isLocked || isSavingPerms || !canManageRoles) return;
    const currentModuleCodes = new Set(filteredPermissions.map((p) => p.code));
    setDraftPermissions((prev) => prev.filter((code) => !currentModuleCodes.has(code)));
  };

  // Submit and save permissions via API
  const handleSave = async () => {
    if (isLocked || isSavingPerms || !hasUnsavedChanges || !canManageRoles) return;
    await onSavePermissions(draftPermissions);
  };

  return (
    <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
      <Card.Body className="p-3">
        {/* Role Header & Save Permission Actions */}
        <div
          className={`d-flex flex-column flex-sm-row sm:align-items-center justify-content-between gap-2 pb-2.5 border-bottom mb-3 ${
            isDark ? 'border-secondary' : ''
          }`}
        >
          <div>
            <Stack direction="horizontal" gap={2} className="align-items-center flex-wrap">
              <h3 className="h6 fw-bold mb-0">{role.name}</h3>
              <Badge
                bg="secondary-subtle"
                text="secondary"
                className="font-monospace"
                style={{ fontSize: '0.68rem' }}
              >
                {role.code}
              </Badge>
              {role.isSystem ? (
                <Badge bg="warning-subtle" text="warning" style={{ fontSize: '0.68rem' }}>
                  System Protected
                </Badge>
              ) : (
                <Badge bg="info-subtle" text="info" style={{ fontSize: '0.68rem' }}>
                  Custom Role
                </Badge>
              )}
              {isSavingPerms && (
                <span
                  className="text-primary small d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '0.72rem' }}
                >
                  <Spinner size="sm" style={{ width: '12px', height: '12px' }} />
                  {t.rbac.saving}
                </span>
              )}
            </Stack>
            <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.75rem' }}>
              {role.description
                ? role.description
                : role.isSystem
                  ? t.rbac.systemRoleNotice
                  : `${t.rbac.permissionsForRole} ${role.name}`}
            </p>
          </div>

          {/* Right Action: Save Permissions & Discard */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {hasUnsavedChanges && !isLocked && (
              <>
                <Badge
                  bg="warning-subtle"
                  text="warning"
                  className="py-1.5 px-2 border border-warning-subtle d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '0.72rem' }}
                >
                  Unsaved changes
                </Badge>
                <Button
                  id="discard-role-permissions-btn"
                  variant="outline-secondary"
                  size="sm"
                  disabled={isSavingPerms}
                  onClick={handleDiscardChanges}
                  className="py-1 px-2 d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '0.75rem' }}
                >
                  <RotateCcw size={12} />
                  <span>Discard</span>
                </Button>
              </>
            )}

            {!isLocked && canManageRoles ? (
              <Button
                id="save-role-permissions-btn"
                variant={hasUnsavedChanges ? 'primary' : 'outline-secondary'}
                size="sm"
                disabled={!hasUnsavedChanges || isSavingPerms}
                onClick={handleSave}
                className="py-1 px-3 d-inline-flex align-items-center gap-1.5 fw-bold"
                style={{ fontSize: '0.78rem' }}
              >
                {isSavingPerms ? (
                  <>
                    <Spinner size="sm" style={{ width: '13px', height: '13px' }} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Permissions</span>
                  </>
                )}
              </Button>
            ) : isLocked ? (
              <Badge
                bg="secondary-subtle"
                text="secondary"
                className="py-1.5 px-2.5 d-inline-flex align-items-center gap-1"
              >
                <Lock size={12} />
                <span>Read-only System Role</span>
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Module Filter Pills & Batch Action */}
        <div
          className={`d-flex align-items-center justify-content-between gap-2 pb-2 mb-2 flex-wrap border-bottom ${
            isDark ? 'border-secondary' : ''
          }`}
        >
          <div className="d-flex align-items-center gap-1 flex-wrap">
            <Button
              variant={activeModuleFilter === 'ALL' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => setActiveModuleFilter('ALL')}
              className="py-0 px-2"
              style={{ fontSize: '0.72rem', height: '24px' }}
            >
              {t.common.all}
            </Button>
            {modules.map((mod) => (
              <Button
                key={mod}
                variant={activeModuleFilter === mod ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => setActiveModuleFilter(mod)}
                className="py-0 px-2"
                style={{ fontSize: '0.72rem', height: '24px' }}
              >
                {mod}
              </Button>
            ))}
          </div>

          <div className="d-flex align-items-center gap-2">
            {!isLocked && canManageRoles && (
              <div className="d-flex align-items-center gap-1">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={isSavingPerms}
                  onClick={handleSelectAllFiltered}
                  className="py-0 px-1.5 text-xs d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '0.68rem', height: '22px' }}
                  title="Select all permissions in current view"
                >
                  <CheckCheck size={11} />
                  <span>Select All</span>
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={isSavingPerms}
                  onClick={handleClearFiltered}
                  className="py-0 px-1.5 text-xs d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '0.68rem', height: '22px' }}
                  title="Clear permissions in current view"
                >
                  <XCircle size={11} />
                  <span>Clear</span>
                </Button>
              </div>
            )}
            <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
              {t.rbac.grantedPerms}:{' '}
              <strong className={hasUnsavedChanges ? 'text-primary' : undefined}>
                {draftPermissions.length}
              </strong>{' '}
              / {SYSTEM_PERMISSIONS.length}
            </span>
          </div>
        </div>

        {/* Permissions List Grid - click toggles local draft state only */}
        <Row className="g-2" style={{ maxHeight: '480px', overflowY: 'auto' }}>
          {filteredPermissions.map((perm) => {
            const isGranted = draftPermissions.includes(perm.code);

            return (
              <Col md={6} key={perm.code}>
                <div
                  id={`perm-slot-${perm.code}`}
                  role="checkbox"
                  aria-checked={isGranted}
                  tabIndex={isLocked || isSavingPerms ? -1 : 0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleToggleDraftPermission(perm.code);
                    }
                  }}
                  onClick={() => handleToggleDraftPermission(perm.code)}
                  className={`p-2 rounded border h-100 d-flex align-items-start justify-content-between gap-2 transition-all select-none ${
                    isLocked ? 'opacity-75' : ''
                  } ${
                    isGranted
                      ? isDark
                        ? 'border-primary bg-primary bg-opacity-10 text-white'
                        : 'border-primary bg-primary-subtle bg-opacity-25 text-dark'
                      : isDark
                        ? 'bg-dark text-white border-secondary'
                        : 'bg-body text-dark'
                  }`}
                  style={{
                    cursor:
                      isLocked || isSavingPerms || !canManageRoles ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div className="min-w-0 flex-grow-1">
                    <div className="d-flex align-items-center gap-1.5 flex-wrap mb-1">
                      <Badge
                        bg="secondary-subtle"
                        text="secondary"
                        className="font-monospace"
                        style={{ fontSize: '0.62rem' }}
                      >
                        {perm.module}
                      </Badge>
                      <span
                        className="fw-semibold text-truncate small"
                        style={{ fontSize: '0.78rem' }}
                      >
                        {perm.code}
                      </span>
                    </div>
                    <div
                      className="text-muted small"
                      style={{ fontSize: '0.72rem', lineHeight: 1.3 }}
                    >
                      {perm.description}
                    </div>
                  </div>

                  <div className="pt-0.5 shrink-0">
                    {isLocked ? (
                      <Lock size={14} className={isGranted ? 'text-primary' : 'text-muted'} />
                    ) : (
                      <div
                        className={`rounded border d-flex align-items-center justify-content-center ${
                          isGranted
                            ? 'bg-primary border-primary text-white'
                            : isDark
                              ? 'bg-dark border-secondary'
                              : 'bg-body border-secondary-subtle'
                        }`}
                        style={{ width: '18px', height: '18px' }}
                      >
                        {isGranted && <Check size={12} />}
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card.Body>
    </Card>
  );
};
