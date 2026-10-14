import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Download, FileSpreadsheet, Check } from 'lucide-react';
import { Teacher } from '@/components/pages/teachers/types';

interface ExportTeacherModalProps {
  show: boolean;
  onHide: () => void;
  filteredTeachers: Teacher[];
  allTeachers: Teacher[];
}

export const ExportTeacherModal: React.FC<ExportTeacherModalProps> = ({
  show,
  onHide,
  filteredTeachers,
  allTeachers,
}) => {
  const [exportScope, setExportScope] = useState<'FILTERED' | 'ALL'>('FILTERED');
  const [includeContact, setIncludeContact] = useState(true);
  const [includeQualifications, setIncludeQualifications] = useState(true);

  const handleExport = () => {
    const list = exportScope === 'FILTERED' ? filteredTeachers : allTeachers;

    const headers = [
      'Teacher ID',
      'First Name',
      'Middle Name',
      'Last Name',
      'Gender',
      'Date of Birth',
      'Designation',
      'Department',
      'Employment Type',
      'Joining Date',
      'Status',
    ];

    if (includeContact) {
      headers.push('Mobile', 'Alternate Mobile', 'Email', 'City', 'State');
    }

    if (includeQualifications) {
      headers.push('Highest Qualification', 'University / Year');
    }

    const rows = list.map((t) => {
      const row = [
        `"${t.teacherId}"`,
        `"${t.firstName}"`,
        `"${t.middleName || ''}"`,
        `"${t.lastName || ''}"`,
        `"${t.gender || ''}"`,
        `"${t.dateOfBirth || ''}"`,
        `"${t.designationName || ''}"`,
        `"${t.departmentName || ''}"`,
        `"${t.employmentType}"`,
        `"${t.joiningDate || ''}"`,
        `"${t.status}"`,
      ];

      if (includeContact) {
        row.push(
          `"${t.mobile || ''}"`,
          `"${t.alternateMobile || ''}"`,
          `"${t.email || ''}"`,
          `"${t.currentAddress?.city || ''}"`,
          `"${t.currentAddress?.state || ''}"`,
        );
      }

      if (includeQualifications) {
        const topQ = t.qualifications && t.qualifications[0];
        row.push(
          `"${topQ ? `${topQ.degree} (${topQ.specialization || ''})` : ''}"`,
          `"${topQ ? `${topQ.university || ''} ${topQ.year || ''}` : ''}"`,
        );
      }

      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `schoolnexa_teachers_${exportScope.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
          <Download size={18} className="text-primary" />
          <span>Export Teachers</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-3">
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Export Scope</Form.Label>
          <div className="d-flex flex-column gap-2">
            <Form.Check
              type="radio"
              id="scope-filtered"
              name="exportScope"
              label={`Current Filtered View (${filteredTeachers.length} teachers)`}
              checked={exportScope === 'FILTERED'}
              onChange={() => setExportScope('FILTERED')}
            />
            <Form.Check
              type="radio"
              id="scope-all"
              name="exportScope"
              label={`All Teachers Master Record (${allTeachers.length} teachers)`}
              checked={exportScope === 'ALL'}
              onChange={() => setExportScope('ALL')}
            />
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Include Fields</Form.Label>
          <Form.Check
            type="checkbox"
            id="include-contact"
            label="Contact & Address Details (Mobile, Email, City)"
            checked={includeContact}
            onChange={(e) => setIncludeContact(e.target.checked)}
            className="mb-1"
          />
          <Form.Check
            type="checkbox"
            id="include-qualifications"
            label="Academic Qualifications (Degrees, Universities)"
            checked={includeQualifications}
            onChange={(e) => setIncludeQualifications(e.target.checked)}
          />
        </Form.Group>

        <Alert variant="light" className="small border mb-0 py-2 d-flex align-items-center gap-2">
          <FileSpreadsheet size={16} className="text-success" />
          <span>File will be generated and downloaded as standard CSV format.</span>
        </Alert>
      </Modal.Body>

      <Modal.Footer className="py-2">
        <Button variant="outline-secondary" size="sm" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleExport}
          className="d-flex align-items-center gap-1"
        >
          <Download size={15} />
          <span>Export File</span>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
