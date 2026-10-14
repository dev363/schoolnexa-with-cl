import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';
import { Teacher } from '@/components/pages/teachers/types';
import {
  useGetTeachersQuery,
  useImportTeachersMutation,
} from '@/store/teachers';

interface ImportTeacherModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (importedCount: number) => void;
}

const parseAndValidateImport = (rawRows: any[], existingTeachers: Teacher[] = []) => {
  const validRows: any[] = [];
  const invalidRows: any[] = [];
  const duplicateRows: any[] = [];

  const existingMobiles = new Set(
    existingTeachers.map((t) => t.mobile?.replace(/\s+/g, '')).filter(Boolean),
  );
  const existingEmails = new Set(
    existingTeachers.map((t) => t.email?.toLowerCase().trim()).filter(Boolean),
  );

  rawRows.forEach((row, index) => {
    const rowNum = index + 1;
    const issues: string[] = [];

    if (!row.firstName?.trim()) issues.push('Missing First Name');
    if (!row.lastName?.trim()) issues.push('Missing Last Name');
    if (!row.mobile?.trim()) issues.push('Missing Mobile');
    if (!row.department?.trim()) issues.push('Missing Department');
    if (!row.designation?.trim()) issues.push('Missing Designation');

    const cleanMobile = row.mobile ? row.mobile.replace(/\s+/g, '') : '';
    const cleanEmail = row.email ? row.email.toLowerCase().trim() : '';

    if (cleanMobile && existingMobiles.has(cleanMobile)) {
      duplicateRows.push({ rowNum, row, reason: `Mobile ${row.mobile} already registered.` });
      return;
    }

    if (cleanEmail && existingEmails.has(cleanEmail)) {
      duplicateRows.push({ rowNum, row, reason: `Email ${row.email} already registered.` });
      return;
    }

    if (issues.length > 0) {
      invalidRows.push({ rowNum, row, reason: issues.join(', ') });
    } else {
      validRows.push({ rowNum, row });
    }
  });

  return {
    total: rawRows.length,
    valid: validRows,
    invalid: invalidRows,
    duplicates: duplicateRows,
  };
};

const SAMPLE_CSV = `FirstName,LastName,Gender,DateOfBirth,Mobile,Email,Designation,Department,EmploymentType
Deepak,Sharma,Male,1988-04-12,+91 98141 55443,deepak.sharma@schoolnexa.edu.in,TGT,Science,FULL_TIME
Pooja,Bansal,Female,1992-09-24,+91 98722 66554,pooja.bansal@schoolnexa.edu.in,PRT,Primary,FULL_TIME
Manpreet,Kaur,Female,1985-06-18,+91 94170 77889,manpreet.kaur@schoolnexa.edu.in,PGT,Mathematics,FULL_TIME`;

export const ImportTeacherModal: React.FC<ImportTeacherModalProps> = ({
  show,
  onHide,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [importError, setImportError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    total: number;
    valid: any[];
    invalid: any[];
    duplicates: any[];
  } | null>(null);

  // RTK Query: fetch existing teachers for duplicate checks and perform bulk import mutation
  const { data: teachersData } = useGetTeachersQuery({ pageSize: 200 });
  const existingTeachers = teachersData?.teachers || [];
  const [importTeachers, { isLoading: isImporting }] = useImportTeachersMutation();

  const handleValidate = () => {
    setImportError(null);
    const lines = csvText
      .trim()
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length <= 1) {
      toast.warning('Please provide CSV data with at least one row besides header.');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const dataRows = lines.slice(1);

    const parsed = dataRows.map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const rowObj: any = {};
      headers.forEach((h, i) => {
        if (h.includes('first')) rowObj.firstName = values[i] || '';
        else if (h.includes('last')) rowObj.lastName = values[i] || '';
        else if (h.includes('gender')) rowObj.gender = values[i] || 'Other';
        else if (h.includes('birth') || h.includes('dob')) rowObj.dateOfBirth = values[i] || '';
        else if (h.includes('mobile') || h.includes('phone')) rowObj.mobile = values[i] || '';
        else if (h.includes('email')) rowObj.email = values[i] || '';
        else if (h.includes('designation')) rowObj.designation = values[i] || 'Teacher';
        else if (h.includes('dept') || h.includes('department'))
          rowObj.department = values[i] || 'General';
        else if (h.includes('employment') || h.includes('type'))
          rowObj.employmentType = values[i] || 'FULL_TIME';
      });
      return rowObj;
    });

    const result = parseAndValidateImport(parsed, existingTeachers);
    setValidationResult(result);
  };

  const handleExecuteImport = async () => {
    if (!validationResult || validationResult.valid.length === 0) return;
    setImportError(null);
    try {
      const res = await importTeachers(validationResult.valid).unwrap();
      const count = res?.imported?.length || validationResult.valid.length;
      toast.success(`Successfully imported and saved ${count} teachers to database.`);
      onSuccess(count);
      handleReset();
      onHide();
    } catch (err: any) {
      console.error('Import failed:', err);
      const msg = getApiErrorMessage(
        err,
        'Unable to save imported teachers to database. Please check connection and try again.',
      );
      setImportError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setCsvText(SAMPLE_CSV);
    setValidationResult(null);
    setImportError(null);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
          <Upload size={18} className="text-primary" />
          <span>Import Teachers</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-3">
        {/* Important Architectural Notice */}
        <Alert variant="info" className="small py-2 mb-3">
          <div className="d-flex align-items-start gap-2">
            <Info size={16} className="mt-0.5 text-primary flex-shrink-0" />
            <div>
              <strong>Teacher ID Auto-Generation:</strong> In SchoolNexa, the{' '}
              <strong>Teacher ID</strong> is the permanent, school-specific master identity. Teacher
              IDs cannot be imported manually. The system will automatically assign the next
              sequential IDs (e.g. <span className="font-monospace">TCH-000117</span>...) to every
              imported teacher.
            </div>
          </div>
        </Alert>

        {!validationResult ? (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-1.5">
              <Form.Label className="small fw-semibold mb-0">
                Paste CSV Data (or use sample below)
              </Form.Label>
              <Button
                variant="link"
                size="sm"
                className="p-0 text-decoration-none small"
                onClick={() => setCsvText(SAMPLE_CSV)}
              >
                Reset to Sample
              </Button>
            </div>
            <Form.Control
              as="textarea"
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="font-monospace small mb-2"
              placeholder="FirstName,LastName,Gender,DateOfBirth,Mobile,Email,Designation,Department,EmploymentType..."
            />
            <div className="text-muted small">
              Columns expected:{' '}
              <code>
                FirstName, LastName, Gender, DateOfBirth, Mobile, Email, Designation, Department,
                EmploymentType
              </code>
            </div>
          </div>
        ) : (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h6 className="fw-bold mb-1">Import Validation Summary</h6>
                <div className="d-flex gap-2">
                  <Badge bg="secondary">Total: {validationResult.total}</Badge>
                  <Badge bg="success">Valid: {validationResult.valid.length}</Badge>
                  {validationResult.invalid.length > 0 && (
                    <Badge bg="danger">Invalid: {validationResult.invalid.length}</Badge>
                  )}
                  {validationResult.duplicates.length > 0 && (
                    <Badge bg="warning" text="dark">
                      Duplicates: {validationResult.duplicates.length}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setValidationResult(null)}
              >
                Edit CSV Data
              </Button>
            </div>

            {/* Valid Rows Preview */}
            {validationResult.valid.length > 0 && (
              <div className="mb-3">
                <div className="small fw-semibold text-success mb-1.5 d-flex align-items-center gap-1">
                  <CheckCircle size={14} /> Ready to Import ({validationResult.valid.length}{' '}
                  Teachers)
                </div>
                <div className="table-responsive border rounded" style={{ maxHeight: '200px' }}>
                  <Table size="sm" hover className="mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Auto Teacher ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.valid.map((v, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td className="fw-semibold">
                            {v.row.firstName} {v.row.lastName}
                          </td>
                          <td>{v.row.mobile}</td>
                          <td>{v.row.department}</td>
                          <td>{v.row.designation}</td>
                          <td>
                            <Badge bg="light" text="dark" className="border font-monospace">
                              TCH-AUTO
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}

            {/* Invalid or Duplicate Warnings */}
            {(validationResult.invalid.length > 0 || validationResult.duplicates.length > 0) && (
              <div>
                <div className="small fw-semibold text-danger mb-1.5 d-flex align-items-center gap-1">
                  <AlertTriangle size={14} /> Skipped / Issues
                </div>
                <div className="table-responsive border rounded" style={{ maxHeight: '140px' }}>
                  <Table size="sm" className="mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>Row</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.duplicates.map((d, i) => (
                        <tr key={`dup-${i}`} className="table-warning">
                          <td>Row {d.rowNum}</td>
                          <td>Duplicate: {d.reason}</td>
                        </tr>
                      ))}
                      {validationResult.invalid.map((inv, i) => (
                        <tr key={`inv-${i}`} className="table-danger">
                          <td>Row {inv.rowNum}</td>
                          <td>Missing data: {inv.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
            {importError && (
              <Alert
                variant="danger"
                className="small py-2 mt-3 mb-0 d-flex align-items-center gap-2"
              >
                <AlertCircle size={16} className="flex-shrink-0" />
                <div>{importError}</div>
              </Alert>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="py-2">
        <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={isImporting}>
          Cancel
        </Button>
        {!validationResult ? (
          <Button variant="primary" size="sm" onClick={handleValidate}>
            Validate Data
          </Button>
        ) : (
          <Button
            variant="success"
            size="sm"
            disabled={validationResult.valid.length === 0 || isImporting}
            onClick={handleExecuteImport}
            className="d-flex align-items-center gap-2"
          >
            {isImporting && <Spinner size="sm" animation="border" />}
            <span>
              {isImporting
                ? 'Saving to Database...'
                : `Import ${validationResult.valid.length} Teachers`}
            </span>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};
