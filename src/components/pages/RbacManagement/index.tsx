import React, { useState, useMemo } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { TopHeader } from '@/components/common';
import { ShieldCheck, KeyRound, Plus, CheckCircle2, AlertCircle, Users, Lock } from 'lucide-react';
import { RoleSummary } from '@/types';
import { RoleListCard } from './RoleListCard';
import { PermissionMatrixCard } from './PermissionMatrixCard';
import { NewRoleModal } from './NewRoleModal';
import { EditRoleModal } from './EditRoleModal';
import { DeleteRoleModal } from './DeleteRoleModal';

export const RbacManagementView: React.FC = () => {
  const {
    activeSchool,
    activeAcademicYear,
    addRoleToSchool,
    updateRole,
    updateRolePermissions,
    deleteRoleFromSchool,
    hasPermission,
    user,
  } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useLanguage();
  const toast = useToast();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(
    activeSchool?.roles[0]?.id || null,
  );

  // Target role for Edit / Delete modals
  const [targetRole, setTargetRole] = useState<RoleSummary | null>(null);

  // Filter roles by type: 'ALL' | 'SYSTEM' | 'CUSTOM'
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SYSTEM' | 'CUSTOM'>('ALL');

  // Modal display states
  const [modalState, setModalState] = useState<{
    newOpen: boolean;
    editOpen: boolean;
    deleteOpen: boolean;
    isSubmitting: boolean;
  }>({
    newOpen: false,
    editOpen: false,
    deleteOpen: false,
    isSubmitting: false,
  });

  // Saving permissions status
  const [isSavingPerms, setIsSavingPerms] = useState<boolean>(false);

  // Status feedback alert
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);

  const roles = activeSchool?.roles || [];

  const filteredRoles = useMemo(() => {
    if (roleFilter === 'SYSTEM') return roles.filter((r) => r.isSystem);
    if (roleFilter === 'CUSTOM') return roles.filter((r) => !r.isSystem);
    return roles;
  }, [roles, roleFilter]);

  const selectedRole = useMemo(() => {
    const foundInFiltered = filteredRoles.find((r) => r.id === selectedRoleId);
    if (foundInFiltered) return foundInFiltered;
    return filteredRoles[0] || roles[0] || null;
  }, [filteredRoles, selectedRoleId, roles]);

  const canManageRoles = Boolean(user?.isSuperAdmin || hasPermission('school.roles.manage'));

  const triggerFeedback = (type: 'success' | 'danger', message: string) => {
    setFeedback({ type, message });
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
    setTimeout(() => {
      setFeedback((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  // Batch Save Permissions (No API calls until Save button is clicked)
  const handleSavePermissions = async (newPermissions: string[]) => {
    if (!selectedRole || selectedRole.isSystem || isSavingPerms) return;
    setIsSavingPerms(true);
    try {
      await updateRolePermissions(selectedRole.id, newPermissions);
      triggerFeedback('success', t.rbac.permUpdatedSuccess);
    } catch (err: any) {
      triggerFeedback('danger', err?.message || 'Failed to update permissions');
    } finally {
      setIsSavingPerms(false);
    }
  };

  // Role creation
  const handleCreateRole = async (data: { name: string; code: string; description: string }) => {
    setModalState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const created = await addRoleToSchool(data.name, data.code, [], data.description);
      setSelectedRoleId(created.id);
      setModalState((prev) => ({ ...prev, newOpen: false, isSubmitting: false }));
      triggerFeedback('success', t.rbac.roleCreatedSuccess);
    } catch (err: any) {
      setModalState((prev) => ({ ...prev, isSubmitting: false }));
      triggerFeedback('danger', err?.message || 'Failed to create role');
    }
  };

  // Open Edit Modal for a specific role
  const handleOpenEditRole = (role: RoleSummary) => {
    setTargetRole(role);
    setSelectedRoleId(role.id);
    setModalState((prev) => ({ ...prev, editOpen: true }));
  };

  // Open Delete Modal for a specific role
  const handleOpenDeleteRole = (role: RoleSummary) => {
    setTargetRole(role);
    setSelectedRoleId(role.id);
    setModalState((prev) => ({ ...prev, deleteOpen: true }));
  };

  // Role editing submission
  const handleEditRole = async (data: { name: string; description: string }) => {
    const roleToEdit = targetRole || selectedRole;
    if (!roleToEdit) return;
    setModalState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await updateRole(roleToEdit.id, {
        name: data.name,
        description: data.description,
      });
      setModalState((prev) => ({ ...prev, editOpen: false, isSubmitting: false }));
      triggerFeedback('success', t.rbac.roleUpdatedSuccess);
    } catch (err: any) {
      setModalState((prev) => ({ ...prev, isSubmitting: false }));
      triggerFeedback('danger', err?.message || 'Failed to update role');
    }
  };

  // Role deletion confirmation
  const handleDeleteRole = async () => {
    const roleToDelete = targetRole || selectedRole;
    if (!roleToDelete) return;
    setModalState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await deleteRoleFromSchool(roleToDelete.id);
      const remainingRoles = roles.filter((r) => r.id !== roleToDelete.id);
      setSelectedRoleId(remainingRoles[0]?.id || null);
      setModalState((prev) => ({
        ...prev,
        deleteOpen: false,
        isSubmitting: false,
      }));
      triggerFeedback('success', t.rbac.roleDeletedSuccess);
    } catch (err: any) {
      setModalState((prev) => ({ ...prev, isSubmitting: false }));
      triggerFeedback('danger', err?.message || 'Failed to delete role');
    }
  };

  const systemRolesCount = roles.filter((r) => r.isSystem).length;
  const customRolesCount = roles.filter((r) => !r.isSystem).length;

  return (
    <div className="d-flex flex-column gap-3">
      {/* Top Header Component - Standardized */}
      <TopHeader
        title={t.rbac.title}
        icon={ShieldCheck}
        subtitle={t.rbac.subtitle}
        badges={[
          {
            bg: 'primary',
            label: activeAcademicYear?.name || 'Academic Year',
          },
          ...(activeSchool
            ? [
                {
                  bg: isDark ? 'secondary' : 'light',
                  label: activeSchool.name,
                },
              ]
            : []),
        ]}
        actions={[
          {
            name: `All (${roles.length})`,
            icon: Users,
            action: () => setRoleFilter('ALL'),
            variant: roleFilter === 'ALL' ? 'secondary' : 'outline-secondary',
          },
          {
            name: `System (${systemRolesCount})`,
            icon: Lock,
            action: () => setRoleFilter('SYSTEM'),
            variant: roleFilter === 'SYSTEM' ? 'secondary' : 'outline-secondary',
          },
          {
            name: `Custom (${customRolesCount})`,
            icon: KeyRound,
            action: () => setRoleFilter('CUSTOM'),
            variant: roleFilter === 'CUSTOM' ? 'secondary' : 'outline-secondary',
          },
        ]}
      />

      {/* Operational Feedback Alert */}
      {feedback && (
        <Alert
          variant={feedback.type}
          dismissible
          onClose={() => setFeedback(null)}
          className="py-2 px-3 small d-flex align-items-center gap-2 mb-0"
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={16} className="text-success shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-danger shrink-0" />
          )}
          <span>{feedback.message}</span>
        </Alert>
      )}

      {/* Main 2-Column Responsive Layout */}
      <Row className="g-3">
        {/* Left Column: Roles Directory with inline Edit / Delete on items */}
        <Col lg={4}>
          <RoleListCard
            roles={filteredRoles}
            selectedRoleId={selectedRole?.id || null}
            onSelectRole={(id) => setSelectedRoleId(id)}
            canCreateRole={canManageRoles}
            onOpenNewRole={() => setModalState((prev) => ({ ...prev, newOpen: true }))}
            canManageRoles={canManageRoles}
            onEditRole={handleOpenEditRole}
            onDeleteRole={handleOpenDeleteRole}
          />
        </Col>

        {/* Right Column: Permissions Matrix with explicit Save Permissions button */}
        <Col lg={8}>
          <PermissionMatrixCard
            role={selectedRole}
            canManageRoles={canManageRoles}
            isSavingPerms={isSavingPerms}
            onSavePermissions={handleSavePermissions}
          />
        </Col>
      </Row>

      {/* Modals */}
      <NewRoleModal
        show={modalState.newOpen}
        onHide={() => setModalState((prev) => ({ ...prev, newOpen: false }))}
        onSubmit={handleCreateRole}
        isSubmitting={modalState.isSubmitting}
      />

      <EditRoleModal
        show={modalState.editOpen}
        role={targetRole || selectedRole}
        onHide={() => setModalState((prev) => ({ ...prev, editOpen: false }))}
        onSubmit={handleEditRole}
        isSubmitting={modalState.isSubmitting}
      />

      <DeleteRoleModal
        show={modalState.deleteOpen}
        role={targetRole || selectedRole}
        onHide={() => setModalState((prev) => ({ ...prev, deleteOpen: false }))}
        onConfirm={handleDeleteRole}
        isDeleting={modalState.isSubmitting}
      />
    </div>
  );
};

export default RbacManagementView;
