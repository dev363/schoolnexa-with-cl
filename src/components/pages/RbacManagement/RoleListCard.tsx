import React from 'react';
import { Card, ListGroup, Badge, Button, Stack, Dropdown } from 'react-bootstrap';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { RoleSummary } from '@/types';
import { Users, Plus, Edit2, Trash2, Lock, MoreVertical, CheckCheckIcon } from 'lucide-react';

interface RoleListCardProps {
  roles: RoleSummary[];
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
  canCreateRole: boolean;
  onOpenNewRole: () => void;
  canManageRoles?: boolean;
  onEditRole?: (role: RoleSummary) => void;
  onDeleteRole?: (role: RoleSummary) => void;
}

export const RoleListCard: React.FC<RoleListCardProps> = ({
  roles,
  selectedRoleId,
  onSelectRole,
  canCreateRole,
  onOpenNewRole,
  canManageRoles = false,
  onEditRole,
  onDeleteRole,
}) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border h-100">
      <Card.Header
        className={`py-2 px-3 d-flex align-items-center justify-content-between ${isDark ? 'bg-dark border-secondary' : 'bg-light border-bottom'}`}
      >
        <Stack direction="horizontal" gap={1.5} className="align-items-center">
          <Users size={14} className="text-muted" />
          <span className="small text-muted fw-semibold">
            {t.rbac.activeRoles} ({roles.length})
          </span>
        </Stack>
        {canCreateRole && (
          <Button
            id="create-role-list-header-btn"
            variant="outline-primary"
            size="sm"
            onClick={onOpenNewRole}
            className="py-0 px-1.5 d-inline-flex align-items-center gap-1"
            style={{ fontSize: '0.72rem', height: '22px' }}
          >
            <Plus size={12} />
            <span>{t.common.create}</span>
          </Button>
        )}
      </Card.Header>
      <Card.Body className="p-2">
        <ListGroup variant="flush" className="gap-1">
          {roles.map((role) => {
            const isSelected = selectedRoleId === role.id;
            return (
              <ListGroup.Item
                key={role.id}
                as="div"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelectRole(role.id);
                  }
                }}
                onClick={() => onSelectRole(role.id)}
                className={`rounded border d-flex align-items-center justify-content-between py-2 px-2.5 small transition-all  ${
                  isSelected
                    ? isDark
                      ? 'border-primary selected bg-primary bg-opacity-10 text-white'
                      : 'border-primary selected bg-primary-subtle bg-opacity-25 text-dark'
                    : isDark
                      ? 'bg-dark text-white border-secondary'
                      : 'bg-body text-dark'
                }`}
              >
                <div className="min-w-0 pe-2">
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="fw-semibold text-truncate">{role.name}</span>
                    {role.isSystem && (
                      <Badge bg="secondary" style={{ fontSize: '0.62rem' }}>
                        SYS
                      </Badge>
                    )}
                  </div>
                  <div
                    className={`font-monospace mt-0.5 ${isDark ? 'text-secondary' : 'text-muted'}`}
                    style={{ fontSize: '0.68rem' }}
                  >
                    {role.code} • {role.permissions.length} perms
                  </div>
                </div>

                <div className="d-flex align-items-center gap-1 shrink-0">
                  {canManageRoles && !role.isSystem ? (
                    <Dropdown
                      align="end"
                      className="d-inline-flex me-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Dropdown.Toggle
                        id={`role-actions-toggle-${role.id}`}
                        variant="link"
                        size="sm"
                        aria-label={`Actions for ${role.name}`}
                        title="Role actions"
                        className={`p-0 border-0 dropdown-toggle-no-caret d-inline-flex align-items-center justify-content-center text-decoration-none shadow-none ${
                          isDark ? 'text-light' : 'text-secondary'
                        }`}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '4px',
                        }}
                      >
                        <MoreVertical size={15} />
                      </Dropdown.Toggle>

                      <Dropdown.Menu
                        className={`shadow-sm border py-1 ${isDark ? 'dropdown-menu-dark' : ''}`}
                        style={{ minWidth: '130px', fontSize: '0.8rem' }}
                      >
                        <Dropdown.Item
                          id={`edit-role-item-${role.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditRole?.(role);
                          }}
                          className="d-flex align-items-center gap-2 py-1.5 px-3"
                        >
                          <Edit2 size={13} className="text-secondary shrink-0" />
                          <span>{t.rbac.editRole}</span>
                        </Dropdown.Item>
                        <Dropdown.Divider className="my-1" />
                        <Dropdown.Item
                          id={`delete-role-item-${role.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRole?.(role);
                          }}
                          className="d-flex align-items-center gap-2 py-1.5 px-3 text-danger"
                        >
                          <Trash2 size={13} className="text-danger shrink-0" />
                          <span>{t.rbac.deleteRole}</span>
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : role.isSystem ? (
                    <span title={t.rbac.systemRoleNotice} className="p-1 me-1">
                      <Lock size={12} className="text-muted" />
                    </span>
                  ) : null}
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};
