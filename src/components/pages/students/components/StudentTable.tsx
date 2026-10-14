import React from 'react';
import { Table, Button, ButtonGroup, OverlayTrigger, Tooltip, Form } from 'react-bootstrap';
import { Eye, Edit2, Archive, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentItem } from '../types';
import { StudentStatusBadge } from './StudentStatusBadge';
import { StudentAvatar } from './StudentAvatar';
import { useTheme } from '@/context/ThemeContext';
import { SPECIAL_NEED_CATEGORIES, getOptionLabel, isSpecialNeedActive } from '@/config/Options';

interface StudentTableProps {
  students: StudentItem[];
  onArchive: (student: StudentItem) => void;
  selectedIds?: string[];
  onToggleSelect?: (studentId: string) => void;
  onToggleSelectAll?: () => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onArchive,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isSelectionSupported = Boolean(onToggleSelect && selectedIds);
  const allSelected = Boolean(
    isSelectionSupported &&
    students.length > 0 &&
    students.every((s) => selectedIds?.includes(s.id)),
  );
  const someSelected = Boolean(
    isSelectionSupported && students.some((s) => selectedIds?.includes(s.id)),
  );
  const isIndeterminate = someSelected && !allSelected;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatGender = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return 'Male';
      case 'FEMALE':
        return 'Female';
      case 'OTHER':
        return 'Other';
      default:
        return gender;
    }
  };

  return (
    <div
      className={`table-responsive rounded border ${isDark ? 'border-secondary' : 'border-light-subtle'}`}
    >
      <Table
        hover
        responsive
        variant={isDark ? 'dark' : undefined}
        className="align-middle mb-0 text-sm"
      >
        <thead className={isDark ? 'table-dark' : 'table-light'}>
          <tr>
            {isSelectionSupported && (
              <th style={{ width: '42px' }} className="ps-3 pe-1 text-center align-middle">
                <Form.Check
                  type="checkbox"
                  id="select-all-students-header"
                  aria-label="Select all displayed students"
                  checked={allSelected}
                  ref={(input: HTMLInputElement | null) => {
                    if (input) {
                      input.indeterminate = isIndeterminate;
                    }
                  }}
                  onChange={onToggleSelectAll}
                />
              </th>
            )}
            <th
              style={{ minWidth: '220px' }}
              className={!isSelectionSupported ? 'ps-3' : undefined}
            >
              Student
            </th>
            <th style={{ minWidth: '130px' }}>Admission No.</th>
            <th style={{ minWidth: '120px' }}>Student Code</th>
            <th style={{ minWidth: '90px' }}>Gender</th>
            <th style={{ minWidth: '120px' }}>Date of Birth</th>
            <th style={{ minWidth: '130px' }}>Mobile</th>
            <th style={{ minWidth: '120px' }}>Admission Date</th>
            <th style={{ minWidth: '100px' }}>Status</th>
            <th style={{ minWidth: '120px' }} className="text-end pe-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;
            const isSelected = selectedIds?.includes(student.id) || false;

            return (
              <tr
                key={student.id}
                className={
                  isSelected
                    ? isDark
                      ? 'table-active'
                      : 'table-primary bg-primary bg-opacity-10'
                    : undefined
                }
              >
                {isSelectionSupported && (
                  <td
                    className="ps-3 pe-1 text-center align-middle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Form.Check
                      type="checkbox"
                      id={`select-student-${student.id}`}
                      aria-label={`Select ${fullName}`}
                      checked={isSelected}
                      onChange={() => onToggleSelect && onToggleSelect(student.id)}
                    />
                  </td>
                )}
                {/* Student Avatar + Name + Code */}
                <td className={!isSelectionSupported ? 'ps-3' : undefined}>
                  <div className="d-flex align-items-center gap-2.5 py-1">
                    <StudentAvatar name={fullName} photoUrl={student.photoUrl} size="md" />
                    <div>
                      <button
                        type="button"
                        onClick={() => navigate(`/students/view/${student.id}`)}
                        className={`btn p-0 border-0 text-start font-semibold text-sm hover:underline ${
                          isDark ? 'text-white' : 'text-dark'
                        }`}
                      >
                        {fullName}
                      </button>
                      <div className="d-flex align-items-center gap-1.5 mt-0.5 flex-wrap">
                        <span
                          className="text-muted small font-monospace"
                          style={{ fontSize: '11px' }}
                        >
                          {student.studentCode}
                        </span>
                        {student.currentClass ? (
                          <span
                            className={`badge fw-normal px-1.5 py-0.5 ${
                              isDark
                                ? 'bg-secondary bg-opacity-25 text-light border border-secondary'
                                : 'bg-light text-secondary border border-secondary-subtle'
                            }`}
                            style={{ fontSize: '10px' }}
                          >
                            {student.currentClass}{' '}
                            {student.currentSection ? `• ${student.currentSection}` : ''}
                          </span>
                        ) : (
                          <span
                            className="badge fw-normal px-1.5 py-0.5 text-muted border border-secondary border-opacity-25"
                            style={{ fontSize: '10px' }}
                          >
                            Unassigned
                          </span>
                        )}
                        {isSpecialNeedActive(student.specialCategory) && (
                          <span
                            className={`badge fw-normal px-1.5 py-0.5 ${
                              isDark
                                ? 'bg-warning bg-opacity-20 text-warning border border-warning border-opacity-25'
                                : 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25'
                            }`}
                            style={{ fontSize: '10px' }}
                            title={`${getOptionLabel(SPECIAL_NEED_CATEGORIES, student.specialCategory)}${
                              student.specialCategoryDetails
                                ? ': ' + student.specialCategoryDetails
                                : ''
                            }`}
                          >
                            Special Need
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Admission No */}
                <td>
                  {student.admissionNumber ? (
                    <span className="font-monospace fw-semibold text-xs px-2 py-0.5 rounded bg-secondary bg-opacity-10 text-muted">
                      {student.admissionNumber}
                    </span>
                  ) : (
                    <span
                      className={`badge fw-normal ${
                        isDark
                          ? 'bg-warning bg-opacity-20 text-warning border border-warning border-opacity-25'
                          : 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25'
                      }`}
                      style={{ fontSize: '11px' }}
                    >
                      Not Admitted
                    </span>
                  )}
                </td>

                {/* Student Code */}
                <td>
                  <span className="font-monospace text-xs text-muted">{student.studentCode}</span>
                </td>

                {/* Gender */}
                <td>
                  <span className="text-muted small">{formatGender(student.gender)}</span>
                </td>

                {/* Date of Birth */}
                <td>
                  <div className="d-flex align-items-center gap-1.5 text-muted small">
                    <Calendar size={13} className="text-muted opacity-75" />
                    <span>{formatDate(student.dateOfBirth)}</span>
                  </div>
                </td>

                {/* Mobile */}
                <td>
                  {student.mobile ? (
                    <div className="d-flex align-items-center gap-1.5 text-muted small font-monospace">
                      <Phone size={13} className="text-muted opacity-75" />
                      <span>{student.mobile}</span>
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>

                {/* Admission Date */}
                <td>
                  <span className="text-muted small">{formatDate(student.admissionDate)}</span>
                </td>

                {/* Status */}
                <td>
                  <StudentStatusBadge status={student.status} />
                </td>

                {/* Actions */}
                <td className="text-end pe-3">
                  <ButtonGroup size="sm">
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id={`view-${student.id}`}>View Student Profile</Tooltip>}
                    >
                      <Button
                        variant={isDark ? 'outline-secondary' : 'outline-light'}
                        className="text-primary p-1 border-0"
                        onClick={() => navigate(`/students/view/${student.id}`)}
                        aria-label="View Student"
                      >
                        <Eye size={15} />
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id={`edit-${student.id}`}>Edit Student</Tooltip>}
                    >
                      <Button
                        variant={isDark ? 'outline-secondary' : 'outline-light'}
                        className="text-secondary p-1 border-0"
                        onClick={() => navigate(`/students/edit/${student.id}`)}
                        aria-label="Edit Student"
                      >
                        <Edit2 size={15} />
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id={`archive-${student.id}`}>Archive Student</Tooltip>}
                    >
                      <Button
                        variant={isDark ? 'outline-secondary' : 'outline-light'}
                        className="text-warning p-1 border-0"
                        onClick={() => onArchive(student)}
                        aria-label="Archive Student"
                      >
                        <Archive size={15} />
                      </Button>
                    </OverlayTrigger>
                  </ButtonGroup>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};
