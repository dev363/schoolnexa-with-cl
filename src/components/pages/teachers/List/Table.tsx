import React from 'react';
import { Table as BsTable, Form, Dropdown, Button, Badge, Spinner } from 'react-bootstrap';
import {
  Eye,
  Edit2,
  MoreVertical,
  BookOpen,
  Calendar,
  UserX,
  UserCheck,
  Award,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Teacher } from '@/components/pages/teachers/types';
import {
  StatusBadge,
  EmploymentTypeBadge,
  Avatar,
  TeacherStatusBadge,
  TeacherAvatar,
} from '@/components/pages/teachers/Common';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface TeacherTableProps {
  teachers: Teacher[];
  selectedIds: string[];
  loading?: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (teacherId: string, checked: boolean) => void;
  onOpenDeactivateModal: (teacher: Teacher) => void;
  onActivateTeacher: (teacherId: string) => void;
  onOpenAssignSubjectModal: (teacher: Teacher) => void;
  onOpenClassTeacherModal: (teacher: Teacher) => void;
}

export const TeacherTable: React.FC<TeacherTableProps> = ({
  teachers,
  selectedIds,
  loading = false,
  onSelectAll,
  onSelectOne,
  onOpenDeactivateModal,
  onActivateTeacher,
  onOpenAssignSubjectModal,
  onOpenClassTeacherModal,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { hasPermission } = useAuth();

  const canEdit = hasPermission ? hasPermission('teachers.edit') : true;
  const canDeactivate = hasPermission ? hasPermission('teachers.deactivate') : true;

  const allSelected =
    teachers.length > 0 && teachers.every((t) => selectedIds.includes(t.teacherId));
  const someSelected = teachers.some((t) => selectedIds.includes(t.teacherId)) && !allSelected;

  if (loading) {
    return (
      <div className="text-center py-5 border rounded bg-light bg-opacity-25">
        <Spinner animation="border" size="sm" variant="primary" className="me-2" />
        <span className="text-muted small">Loading faculty directory...</span>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-5 border rounded bg-light bg-opacity-25">
        <p className="text-muted mb-0">No teachers found matching the filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive border rounded shadow-sm">
      <BsTable
        hover
        variant={isDark ? 'dark' : undefined}
        className="align-middle mb-0"
        style={{ fontSize: '0.84rem' }}
      >
        <thead className={isDark ? 'table-dark' : 'table-light'}>
          <tr
            className="text-uppercase text-muted"
            style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}
          >
            <th style={{ width: '40px' }} className="text-center">
              <Form.Check
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th style={{ minWidth: '110px' }}>Teacher ID</th>
            <th style={{ minWidth: '220px' }}>Teacher Name</th>
            <th style={{ minWidth: '80px' }}>Gender</th>
            <th style={{ minWidth: '180px' }}>Contact</th>
            <th style={{ minWidth: '130px' }}>Designation</th>
            <th style={{ minWidth: '130px' }}>Department</th>
            <th style={{ minWidth: '110px' }}>Employment</th>
            <th style={{ minWidth: '105px' }}>Joining Date</th>
            <th style={{ minWidth: '95px' }}>Status</th>
            <th style={{ minWidth: '100px' }} className="text-end pe-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => {
            const isSelected = selectedIds.includes(teacher.teacherId);
            const fullName =
              `${teacher.firstName} ${teacher.middleName ? teacher.middleName + ' ' : ''}${teacher.lastName || ''}`.trim();

            return (
              <tr
                key={teacher.teacherId}
                className={
                  isSelected ? (isDark ? 'table-active' : 'table-primary table-opacity-25') : ''
                }
              >
                <td className="text-center">
                  <Form.Check
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectOne(teacher.teacherId, e.target.checked)}
                  />
                </td>

                <td>
                  <Badge
                    bg={isDark ? 'secondary' : 'light'}
                    text={isDark ? 'light' : 'dark'}
                    className="font-monospace border fw-semibold px-2 py-1 cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/teachers/view/${teacher.teacherId}`)}
                  >
                    {teacher.teacherId}
                  </Badge>
                </td>

                <td>
                  <div className="d-flex align-items-center gap-2">
                    <TeacherAvatar
                      photoUrl={teacher.profilePhoto}
                      name={fullName}
                      size={32}
                      status={teacher.status}
                      showStatusIndicator
                    />
                    <div>
                      <div
                        className="fw-bold text-decoration-none cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/teachers/view/${teacher.teacherId}`)}
                      >
                        {fullName}
                      </div>
                      {teacher.preferredName && teacher.preferredName !== fullName && (
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          ({teacher.preferredName})
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td>
                  <span className="text-muted">{teacher.gender || '—'}</span>
                </td>

                <td>
                  <div>
                    <div className="fw-semibold text-truncate" style={{ maxWidth: '170px' }}>
                      {teacher.mobile || '—'}
                    </div>
                    {teacher.email && (
                      <div
                        className="text-muted text-truncate"
                        style={{ fontSize: '0.74rem', maxWidth: '170px' }}
                      >
                        {teacher.email}
                      </div>
                    )}
                  </div>
                </td>

                <td>
                  <span className="fw-medium">{teacher.designationName || 'Teacher'}</span>
                </td>

                <td>
                  <span className="text-muted">{teacher.departmentName || 'General'}</span>
                </td>

                <td>
                  <EmploymentTypeBadge type={teacher.employmentType} />
                </td>

                <td>
                  <span className="text-muted text-nowrap">{teacher.joiningDate || '—'}</span>
                </td>

                <td>
                  <TeacherStatusBadge status={teacher.status} size="sm" />
                </td>

                <td className="text-end pe-3">
                  <div className="d-inline-flex align-items-center gap-1">
                    <Button
                      variant={isDark ? 'outline-light' : 'outline-secondary'}
                      size="sm"
                      className="p-1 border-0"
                      title="View Profile"
                      onClick={() => navigate(`/teachers/view/${teacher.teacherId}`)}
                    >
                      <Eye size={15} />
                    </Button>
                    {canEdit && (
                      <Button
                        variant={isDark ? 'outline-light' : 'outline-secondary'}
                        size="sm"
                        className="p-1 border-0"
                        title="Edit Teacher"
                        onClick={() => navigate(`/teachers/edit/${teacher.teacherId}`)}
                      >
                        <Edit2 size={15} />
                      </Button>
                    )}

                    <Dropdown align="end">
                      <Dropdown.Toggle
                        variant={isDark ? 'outline-light' : 'outline-secondary'}
                        size="sm"
                        className="p-1 border-0 dropdown-toggle-no-caret"
                        title="More Actions"
                      >
                        <MoreVertical size={15} />
                      </Dropdown.Toggle>

                      <Dropdown.Menu
                        className={isDark ? 'dropdown-menu-dark' : ''}
                        style={{ fontSize: '0.84rem' }}
                      >
                        <Dropdown.Item
                          onClick={() => navigate(`/teachers/view/${teacher.teacherId}`)}
                        >
                          <Eye size={14} className="me-2 text-primary" /> View Profile
                        </Dropdown.Item>
                        {canEdit && (
                          <Dropdown.Item
                            onClick={() => navigate(`/teachers/edit/${teacher.teacherId}`)}
                          >
                            <Edit2 size={14} className="me-2 text-info" /> Edit Record
                          </Dropdown.Item>
                        )}
                        <Dropdown.Divider />
                        {canEdit && (
                          <>
                            <Dropdown.Item onClick={() => onOpenAssignSubjectModal(teacher)}>
                              <BookOpen size={14} className="me-2 text-success" /> Assign Subject
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => onOpenClassTeacherModal(teacher)}>
                              <Award size={14} className="me-2 text-warning" /> Class Teacher
                              Assignment
                            </Dropdown.Item>
                          </>
                        )}
                        <Dropdown.Item
                          onClick={() =>
                            navigate(`/teachers/view/${teacher.teacherId}?tab=timetable`)
                          }
                        >
                          <Calendar size={14} className="me-2 text-secondary" /> View Timetable
                        </Dropdown.Item>
                        {canDeactivate && (
                          <>
                            <Dropdown.Divider />
                            {teacher.status === 'ACTIVE' ? (
                              <Dropdown.Item
                                onClick={() => onOpenDeactivateModal(teacher)}
                                className="text-danger"
                              >
                                <UserX size={14} className="me-2 text-danger" /> Deactivate Teacher
                              </Dropdown.Item>
                            ) : (
                              <Dropdown.Item
                                onClick={() => onActivateTeacher(teacher.teacherId)}
                                className="text-success"
                              >
                                <UserCheck size={14} className="me-2 text-success" /> Activate
                                Teacher
                              </Dropdown.Item>
                            )}
                          </>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </BsTable>
    </div>
  );
};

export const Table = TeacherTable;
export default TeacherTable;

