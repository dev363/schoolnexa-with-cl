import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { FileText, Download } from 'lucide-react';
import { Card, InfoRow, ActionButton } from '@/components/common';
import { Teacher, TeacherDocument } from '@/components/pages/teachers/types';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';
import { useGetTeacherDocumentsQuery } from '@/store/teachers';

export interface DocumentsViewProps {
  teacher?: Teacher;
  teacherId?: string;
}

const DocumentsHeader: React.FC<{ count: number }> = ({ count }) => (
  <Card.Header className="py-2.5 px-3 d-flex align-items-center justify-content-between">
    <span className="fw-bold small text-uppercase text-muted">Documents</span>
    {count > 0 && (
      <Badge bg="secondary" pill className="fw-normal" style={{ fontSize: '0.75rem' }}>
        {count}
      </Badge>
    )}
  </Card.Header>
);

const DocumentsTableHeader: React.FC = () => (
  <div className="d-none d-md-block px-3 py-1 mb-2 border-bottom bg-light bg-opacity-25 rounded-top">
    <Row className="g-2 text-muted small fw-semibold align-items-center">
      <Col md={4}>Document Name</Col>
      <Col md={2}>Category</Col>
      <Col md={2}>Upload Date</Col>
      <Col md={2} className="text-center">
        Status
      </Col>
      <Col md={1} className="text-center">
        Size
      </Col>
      <Col md={1} className="text-end">
        Download
      </Col>
    </Row>
  </div>
);

interface DocumentItemProps {
  doc: TeacherDocument;
  isDark: boolean;
  onDownload: (docName: string) => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ doc, isDark, onDownload }) => (
  <div
    className={`px-3 py-2 rounded border ${
      isDark
        ? 'bg-secondary bg-opacity-10 border-secondary'
        : 'bg-light bg-opacity-40 border-light-subtle'
    }`}
  >
    {/* Mobile info layout */}
    <div className="d-md-none d-flex flex-column gap-1.5">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2 text-truncate">
          <FileText size={15} className="text-primary flex-shrink-0" />
          <span className="fw-semibold text-truncate">{doc.name}</span>
        </div>
        <ActionButton
          name="Download"
          icon={Download}
          action={() => onDownload(doc.name)}
          variant="outline-primary"
          size="sm"
          iconOnly
          title={`Download ${doc.name}`}
          className="border-0"
        />
      </div>
      <InfoRow label="Category" value={doc.type.replace(/_/g, ' ')} />
      <InfoRow label="Upload Date" value={doc.uploadDate} />
      <div className="d-flex align-items-center justify-content-between small">
        <span className="text-muted">Status:</span>
        <Badge bg={doc.status === 'VERIFIED' ? 'success' : 'warning'} className="fw-normal">
          {doc.status}
        </Badge>
      </div>
      <InfoRow label="Size" value={doc.fileSize || '410 KB'} />
    </div>

    {/* Desktop tabular columns */}
    <div className="d-none d-md-block">
      <Row className="g-2 align-items-center">
        <Col md={4}>
          <div className="d-flex align-items-center gap-2 text-truncate">
            <FileText size={15} className="text-primary flex-shrink-0" />
            <span className="fw-semibold text-truncate" title={doc.name}>
              {doc.name}
            </span>
          </div>
        </Col>

        <Col md={2}>
          <Badge
            bg="light"
            text="dark"
            className="border text-truncate"
            style={{ maxWidth: '100%' }}
          >
            {doc.type.replace(/_/g, ' ')}
          </Badge>
        </Col>

        <Col md={2}>
          <span className="text-muted small font-monospace">{doc.uploadDate}</span>
        </Col>

        <Col md={2} className="text-center">
          <Badge bg={doc.status === 'VERIFIED' ? 'success' : 'warning'} className="fw-normal">
            {doc.status}
          </Badge>
        </Col>

        <Col md={1} className="text-center">
          <span className="text-muted small font-monospace">{doc.fileSize || '410 KB'}</span>
        </Col>

        <Col md={1} className="text-end">
          <ActionButton
            name="Download"
            icon={Download}
            action={() => onDownload(doc.name)}
            variant="outline-primary"
            size="sm"
            iconOnly
            title={`Download ${doc.name}`}
            className="border-0"
          />
        </Col>
      </Row>
    </div>
  </div>
);

const EmptyDocumentsState: React.FC = () => (
  <p className="text-muted small text-center py-4 mb-0">No documents on file.</p>
);

export const DocumentsView: React.FC<DocumentsViewProps> = ({ teacher, teacherId }) => {
  const toast = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const effectiveTeacherId = teacherId || teacher?.teacherId || teacher?.id;
  const { data: remoteDocuments } = useGetTeacherDocumentsQuery(
    effectiveTeacherId!,
    { skip: !effectiveTeacherId },
  );
  const documents = remoteDocuments ?? teacher?.documents ?? [];

  const handleDownload = (docName: string) => {
    toast.info(`Downloading document: ${docName}`);
  };

  return (
    <Card className="shadow-sm border">
      <DocumentsHeader count={documents.length} />
      <Card.Body className="p-3">
        {documents.length === 0 ? (
          <EmptyDocumentsState />
        ) : (
          <div>
            <DocumentsTableHeader />
            <div className="d-flex flex-column gap-2">
              {documents.map((doc) => (
                <DocumentItem
                  key={doc.id}
                  doc={doc}
                  isDark={isDark}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export const TeacherDocumentsView = DocumentsView;
export default DocumentsView;
