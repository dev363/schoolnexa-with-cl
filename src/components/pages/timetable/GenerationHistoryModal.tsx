import React from 'react';
import { Modal, Button, Badge, ListGroup } from 'react-bootstrap';
import { History, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { GenerationHistoryItem } from '@/services/timetable/types';

interface GenerationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GenerationHistoryItem[];
  onRestore: (item: GenerationHistoryItem) => void;
}

export const GenerationHistoryModal: React.FC<GenerationHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRestore,
}) => {
  return (
    <Modal show={isOpen} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <div
            className="rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center p-1.5"
            style={{ width: '32px', height: '32px' }}
          >
            <History size={16} />
          </div>
          <div>
            <div className="h6 fw-bold mb-0">Timetable Generation History</div>
            <div className="text-muted small fw-normal" style={{ fontSize: '0.75rem' }}>
              View previous generation runs, quality scores, and restore points.
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-3">
        {history.length === 0 ? (
          <div className="p-4 text-center text-muted small">
            No previous generation runs recorded yet.
          </div>
        ) : (
          <ListGroup
            variant="flush"
            className="gap-2"
            style={{ maxHeight: '380px', overflowY: 'auto' }}
          >
            {history.map((item) => {
              const isSuccess = item.conflictsCount === 0;
              const dateStr = new Date(item.createdAt).toLocaleString();

              return (
                <ListGroup.Item
                  key={item.id}
                  className="rounded border p-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 bg-body"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className={`rounded d-flex align-items-center justify-content-center shrink-0 p-2 ${
                        isSuccess
                          ? 'bg-success-subtle text-success'
                          : 'bg-warning-subtle text-warning'
                      }`}
                      style={{ width: '36px', height: '36px' }}
                    >
                      {isSuccess ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    </div>

                    <div>
                      <div className="fw-bold small d-flex align-items-center gap-2">
                        <span>{dateStr}</span>
                        {item.isPublished && (
                          <Badge
                            bg="primary-subtle"
                            text="primary"
                            className="text-uppercase"
                            style={{ fontSize: '0.65rem' }}
                          >
                            Published
                          </Badge>
                        )}
                      </div>
                      <div
                        className="text-muted small mt-0.5 d-flex align-items-center gap-1.5 font-monospace flex-wrap"
                        style={{ fontSize: '0.72rem' }}
                      >
                        <span>{item.classesCount} classes</span>
                        <span>•</span>
                        <span>{item.sectionsCount} sections</span>
                        <span>•</span>
                        <span>{item.teachersCount} teachers</span>
                        <span>•</span>
                        <span>{item.entriesCount} periods</span>
                        <span>•</span>
                        <span>{(item.durationMs / 1000).toFixed(1)}s</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 align-self-end align-self-sm-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        onRestore(item);
                        onClose();
                      }}
                      className="d-inline-flex align-items-center gap-1.5"
                      style={{ fontSize: '0.78rem' }}
                    >
                      <RotateCcw size={13} />
                      <span>Restore</span>
                    </Button>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </Modal.Body>

      <Modal.Footer className="py-2">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
