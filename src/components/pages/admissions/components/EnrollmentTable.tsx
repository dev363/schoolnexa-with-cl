import React from 'react';
import { Table, Button, Dropdown } from 'react-bootstrap';
import {
  Eye,
  Edit,
  TrendingUp,
  RotateCcw,
  ArrowLeftRight,
  History,
  MoreVertical,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Enrollment } from '../types';
import { StatusBadge } from './StatusBadge';

interface TableProps {
  enrollments: Enrollment[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onQuickPromote: (enrollment: Enrollment) => void;
  onQuickRepeat: (enrollment: Enrollment) => void;
  onQuickTransfer: (enrollment: Enrollment) => void;
  onViewHistory: (enrollment: Enrollment) => void;
  onEditEnrollment: (enrollment: Enrollment) => void;
}

export const EnrollmentTable: React.FC<TableProps> = ({
  enrollments,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onQuickPromote,
  onQuickRepeat,
  onQuickTransfer,
  onViewHistory,
  onEditEnrollment,
}) => {
  const navigate = useNavigate();

  const allSelected =
    enrollments.length > 0 && enrollments.every((e) => selectedIds.includes(e.id));
  const someSelected = enrollments.some((e) => selectedIds.includes(e.id)) && !allSelected;

  return (
    <div className="table-responsive border rounded bg-body">
      <Table hover className="align-middle mb-0 small">
        <thead className="table-light text-nowrap">
          <tr>
            <th style={{ width: '40px' }} className="text-center px-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={onToggleSelectAll}
                aria-label="Select all displayed enrollments"
              />
            </th>
            <th>Enrollment ID</th>
            <th>Student Code</th>
            <th>Student Name</th>
            <th>Academic Year</th>
            <th>Class</th>
            <th>Section</th>
            <th>Roll No.</th>
            <th>Admission No.</th>
            <th>Status</th>
            <th>Enrollment Date</th>
            <th className="text-end pe-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.length === 0 ? (
            <tr>
              <td colSpan={12} className="text-center py-5 text-muted">
                No enrollments found matching the current filters.
              </td>
            </tr>
          ) : (
            enrollments.map((enr) => {
              const isSelected = selectedIds.includes(enr.id);

              return (
                <tr key={enr.id} className={isSelected ? 'table-primary-subtle' : undefined}>
                  <td className="text-center px-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isSelected}
                      onChange={() => onToggleSelect(enr.id)}
                      aria-label={`Select ${enr.enrollmentId}`}
                    />
                  </td>
                  {/* Enrollment ID (Strictly separate from Student Code) */}
                  <td className="text-nowrap">
                    <button
                      type="button"
                      onClick={() => navigate(`/admissions/view/${enr.enrollmentId}`)}
                      className="btn btn-link p-0 fw-bold font-monospace text-primary text-decoration-none small text-start"
                      title="View Enrollment Details"
                    >
                      {enr.enrollmentId}
                    </button>
                  </td>
                  {/* Student Code (Person record reference) */}
                  <td className="text-nowrap">
                    <button
                      type="button"
                      onClick={() => navigate(`/students/view/${enr.studentId}`)}
                      className="btn btn-link p-0 font-monospace text-muted text-decoration-none small text-start"
                      title="View Student Master Record"
                    >
                      {enr.studentCode}
                    </button>
                  </td>
                  {/* Student Name */}
                  <td className="fw-medium text-nowrap">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                        style={{ width: '26px', height: '26px', fontSize: '0.75rem' }}
                      >
                        {enr.studentName.charAt(0)}
                      </div>
                      <span>{enr.studentName}</span>
                    </div>
                  </td>
                  {/* Academic Year */}
                  <td className="text-nowrap">{enr.academicYearName}</td>
                  {/* Class */}
                  <td className="text-nowrap fw-semibold">{enr.className}</td>
                  {/* Section */}
                  <td className="text-nowrap">{enr.sectionName}</td>
                  {/* Roll No */}
                  <td className="text-nowrap">{enr.rollNumber || '—'}</td>
                  {/* Admission No */}
                  <td className="text-nowrap font-monospace text-muted small">
                    {enr.admissionNumber || '—'}
                  </td>
                  {/* Status */}
                  <td className="text-nowrap">
                    <StatusBadge status={enr.status} size="sm" />
                  </td>
                  {/* Enrollment Date */}
                  <td className="text-nowrap text-muted small">{enr.enrollmentDate}</td>
                  {/* Actions Dropdown / Buttons */}
                  <td className="text-end text-nowrap pe-3">
                    <div className="d-inline-flex align-items-center gap-1">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="p-1 lh-1"
                        onClick={() => navigate(`/admissions/view/${enr.enrollmentId}`)}
                        title="View Details"
                      >
                        <Eye size={13} />
                      </Button>

                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="outline-secondary"
                          size="sm"
                          className="p-1 lh-1 border-0"
                          id={`dropdown-enr-${enr.id}`}
                        >
                          <MoreVertical size={13} />
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="shadow-sm small">
                          <Dropdown.Item
                            onClick={() => navigate(`/admissions/view/${enr.enrollmentId}`)}
                            className="d-flex align-items-center gap-2"
                          >
                            <Eye size={14} className="text-muted" />
                            <span>View Details</span>
                          </Dropdown.Item>

                          <Dropdown.Item
                            onClick={() => onEditEnrollment(enr)}
                            className="d-flex align-items-center gap-2"
                          >
                            <Edit size={14} className="text-muted" />
                            <span>Edit Enrollment</span>
                          </Dropdown.Item>

                          <Dropdown.Divider />

                          <Dropdown.Item
                            onClick={() => onQuickPromote(enr)}
                            className="d-flex align-items-center gap-2"
                            disabled={enr.status === 'TRANSFERRED' || enr.status === 'CANCELLED'}
                          >
                            <TrendingUp size={14} className="text-success" />
                            <span>Promote Student</span>
                          </Dropdown.Item>

                          <Dropdown.Item
                            onClick={() => onQuickRepeat(enr)}
                            className="d-flex align-items-center gap-2"
                            disabled={enr.status === 'TRANSFERRED' || enr.status === 'CANCELLED'}
                          >
                            <RotateCcw size={14} className="text-warning" />
                            <span>Repeat Year</span>
                          </Dropdown.Item>

                          <Dropdown.Item
                            onClick={() => onQuickTransfer(enr)}
                            className="d-flex align-items-center gap-2 text-danger"
                            disabled={enr.status === 'TRANSFERRED'}
                          >
                            <ArrowLeftRight size={14} />
                            <span>Transfer Out</span>
                          </Dropdown.Item>

                          <Dropdown.Divider />

                          <Dropdown.Item
                            onClick={() => onViewHistory(enr)}
                            className="d-flex align-items-center gap-2"
                          >
                            <History size={14} className="text-info" />
                            <span>Academic History</span>
                          </Dropdown.Item>

                          <Dropdown.Item
                            onClick={() => navigate(`/students/view/${enr.studentId}`)}
                            className="d-flex align-items-center gap-2"
                          >
                            <Eye size={14} className="text-muted" />
                            <span>Student Master Record</span>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
};
