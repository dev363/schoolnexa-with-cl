import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Badge, Card } from 'react-bootstrap';
import { Clock, Plus, Trash2, Edit2, Check, Coffee } from 'lucide-react';
import { TimetablePeriodSlot } from '@/types';

interface PeriodManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodSlots: TimetablePeriodSlot[];
  onSaveSlots: (slots: TimetablePeriodSlot[]) => void;
  isDark: boolean;
}

export const PeriodManagementModal: React.FC<PeriodManagementModalProps> = ({
  isOpen,
  onClose,
  periodSlots,
  onSaveSlots,
  isDark,
}) => {
  const [slots, setSlots] = useState<TimetablePeriodSlot[]>(() => [...periodSlots]);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TimetablePeriodSlot>({
    id: '',
    name: '',
    startTime: '08:30',
    endTime: '09:15',
    isBreak: false,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newSlotForm, setNewSlotForm] = useState<Omit<TimetablePeriodSlot, 'id'>>({
    name: '',
    startTime: '15:00',
    endTime: '15:45',
    isBreak: false,
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleStartEdit = (slot: TimetablePeriodSlot) => {
    setEditingSlotId(slot.id);
    setEditForm({ ...slot });
    setIsAdding(false);
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) return;
    const updated = slots.map((s) => (s.id === editingSlotId ? { ...editForm } : s));
    setSlots(updated);
    setEditingSlotId(null);
    setFeedback('Period updated in list. Click "Apply & Save" to finalize.');
  };

  const handleDeleteSlot = (id: string) => {
    if (slots.length <= 1) {
      alert('You must have at least one period slot in the timetable.');
      return;
    }
    const updated = slots.filter((s) => s.id !== id);
    setSlots(updated);
    if (editingSlotId === id) setEditingSlotId(null);
    setFeedback('Period removed. Click "Apply & Save" to finalize.');
  };

  const handleAddSlot = () => {
    if (!newSlotForm.name.trim()) return;
    const newId = 'p-' + Date.now().toString(36);
    const updated = [
      ...slots,
      {
        id: newId,
        ...newSlotForm,
        periodNumber: newSlotForm.isBreak ? undefined : slots.filter((s) => !s.isBreak).length + 1,
      },
    ];
    setSlots(updated);
    setIsAdding(false);
    setNewSlotForm({
      name: '',
      startTime: '15:00',
      endTime: '15:45',
      isBreak: false,
    });
    setFeedback('New period added. Click "Apply & Save" to finalize.');
  };

  const handleFinalSave = () => {
    onSaveSlots(slots);
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered size="lg" backdrop="static">
      <Modal.Header closeButton className={isDark ? 'bg-dark text-white border-secondary' : ''}>
        <Modal.Title className="h6 mb-0 d-flex align-items-center gap-2">
          <Clock size={18} className="text-primary" />
          <div>
            <div className="fw-bold">Manage Daily Periods & Sessions</div>
            <div className="text-muted small fw-normal" style={{ fontSize: '0.75rem' }}>
              Define timing, period labels, and morning/lunch break slots across school timetables.
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={isDark ? 'bg-dark text-white' : ''}>
        {feedback && (
          <Alert
            variant="info"
            dismissible
            onClose={() => setFeedback(null)}
            className="py-2 px-3 mb-3 small"
          >
            {feedback}
          </Alert>
        )}

        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="fw-semibold small">Configured Periods ({slots.length})</span>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => {
              setIsAdding(true);
              setEditingSlotId(null);
            }}
            className="d-inline-flex align-items-center gap-1 py-0.5"
            style={{ fontSize: '0.75rem' }}
          >
            <Plus size={13} />
            <span>Add Period / Break</span>
          </Button>
        </div>

        {/* List of Periods */}
        <div className="d-flex flex-column gap-2" style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {slots.map((slot, index) => {
            const isEditing = editingSlotId === slot.id;

            if (isEditing) {
              return (
                <Card key={slot.id} className="border-primary p-2 bg-light">
                  <Row className="g-2 mb-2">
                    <Col sm={4}>
                      <Form.Label
                        className="small fw-semibold mb-0"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Period Name
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </Col>
                    <Col sm={4}>
                      <Form.Label
                        className="small fw-semibold mb-0"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Start Time
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="time"
                        value={editForm.startTime}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, startTime: e.target.value }))
                        }
                      />
                    </Col>
                    <Col sm={4}>
                      <Form.Label
                        className="small fw-semibold mb-0"
                        style={{ fontSize: '0.75rem' }}
                      >
                        End Time
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="time"
                        value={editForm.endTime}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, endTime: e.target.value }))
                        }
                      />
                    </Col>
                  </Row>

                  <div className="d-flex align-items-center justify-content-between">
                    <Form.Check
                      type="checkbox"
                      id={`edit-break-${slot.id}`}
                      label={
                        <span className="small text-muted">
                          Mark as Break / Recess (no lectures)
                        </span>
                      }
                      checked={editForm.isBreak || false}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, isBreak: e.target.checked }))
                      }
                      className="mb-0"
                    />

                    <div className="d-flex align-items-center gap-1">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setEditingSlotId(null)}
                        className="py-0.5"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveEdit}
                        className="d-inline-flex align-items-center gap-1 py-0.5"
                      >
                        <Check size={13} />
                        <span>Done</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            }

            return (
              <Card
                key={slot.id}
                className={`p-2 border ${slot.isBreak ? 'bg-warning bg-opacity-10 border-warning' : 'bg-body'}`}
              >
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted font-monospace small" style={{ width: '24px' }}>
                      {index + 1}
                    </span>
                    {slot.isBreak ? (
                      <Coffee size={15} className="text-warning flex-shrink-0" />
                    ) : (
                      <Clock size={15} className="text-muted flex-shrink-0" />
                    )}
                    <div>
                      <div className="fw-semibold small d-flex align-items-center gap-1.5">
                        <span>{slot.name}</span>
                        {slot.isBreak && (
                          <Badge bg="warning" text="dark" style={{ fontSize: '0.65rem' }}>
                            Break / Recess
                          </Badge>
                        )}
                      </div>
                      <div
                        className="text-muted small font-monospace"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {slot.startTime} — {slot.endTime}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-1">
                    <Button
                      variant="link"
                      size="sm"
                      className="p-1 text-muted"
                      onClick={() => handleStartEdit(slot)}
                      title="Edit slot details"
                    >
                      <Edit2 size={13} />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-1 text-danger"
                      onClick={() => handleDeleteSlot(slot.id)}
                      title="Delete period slot"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Form to Add New Slot */}
          {isAdding && (
            <Card className="border-primary border-dashed p-2 bg-primary bg-opacity-10 mt-2">
              <div className="small fw-semibold text-primary mb-2">New Period Slot</div>
              <Row className="g-2 mb-2">
                <Col sm={4}>
                  <Form.Label className="small fw-semibold mb-0" style={{ fontSize: '0.75rem' }}>
                    Period Name
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. Period 8 or Evening Prep"
                    value={newSlotForm.name}
                    onChange={(e) => setNewSlotForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </Col>
                <Col sm={4}>
                  <Form.Label className="small fw-semibold mb-0" style={{ fontSize: '0.75rem' }}>
                    Start Time
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="time"
                    value={newSlotForm.startTime}
                    onChange={(e) =>
                      setNewSlotForm((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                  />
                </Col>
                <Col sm={4}>
                  <Form.Label className="small fw-semibold mb-0" style={{ fontSize: '0.75rem' }}>
                    End Time
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="time"
                    value={newSlotForm.endTime}
                    onChange={(e) =>
                      setNewSlotForm((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                  />
                </Col>
              </Row>

              <div className="d-flex align-items-center justify-content-between">
                <Form.Check
                  type="checkbox"
                  id="new-slot-break"
                  label={<span className="small text-muted">Mark as Break / Lunch</span>}
                  checked={newSlotForm.isBreak || false}
                  onChange={(e) =>
                    setNewSlotForm((prev) => ({ ...prev, isBreak: e.target.checked }))
                  }
                  className="mb-0"
                />

                <div className="d-flex align-items-center gap-1">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setIsAdding(false)}
                    className="py-0.5"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddSlot}
                    disabled={!newSlotForm.name.trim()}
                    className="d-inline-flex align-items-center gap-1 py-0.5"
                  >
                    <Plus size={13} />
                    <span>Add Slot</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer
        className={`d-flex align-items-center justify-content-between ${isDark ? 'bg-dark text-white border-secondary' : ''}`}
      >
        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
          Changes apply to all classes using standard period timing.
        </span>
        <div className="d-flex align-items-center gap-2">
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleFinalSave}>
            Apply &amp; Save Periods
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
