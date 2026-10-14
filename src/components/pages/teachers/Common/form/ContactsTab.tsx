import React from 'react';
import { Card, Row, Col, Form, Badge } from 'react-bootstrap';
import { Plus, Trash2 } from 'lucide-react';
import { EmergencyContact } from '@/components/pages/teachers/types';
import { ActionButton } from '@/components/common';
import { useTeacherFormContext } from '@/components/pages/teachers/context/TeacherFormContext';
import { useDebouncedTeacherSectionState } from '@/components/pages/teachers/hooks';

export interface FormContactsTabProps {
  isDark?: boolean;
}

export const FormContactsTab: React.FC<FormContactsTabProps> = ({ isDark = false }) => {
  const { state, handleTopStateChange } = useTeacherFormContext();

  const { localState, setLocalState, syncToContext } =
    useDebouncedTeacherSectionState<EmergencyContact>({
      contextValue: state.emergencyContacts,
      onContextChange: (nextContacts) => {
        handleTopStateChange((prev) => ({
          ...prev,
          emergencyContacts: nextContacts,
        }));
      },
    });

  const handleAdd = () => {
    const newEm: EmergencyContact = {
      id: `em-${Date.now()}`,
      name: '',
      relationship: '',
      mobile: '',
      alternateMobile: '',
      email: '',
      address: '',
      isPrimary: localState.length === 0,
    };
    setLocalState((prev) => {
      const nextState = [...prev, newEm];
      syncToContext(nextState);
      return nextState;
    });
  };

  const handleUpdate = <K extends keyof EmergencyContact>(
    id: string,
    field: K,
    value: EmergencyContact[K],
  ) => {
    setLocalState((prev) => {
      const nextState = prev.map((em) => {
        if (field === 'isPrimary' && value === true) {
          return em.id === id ? { ...em, isPrimary: true } : { ...em, isPrimary: false };
        }
        return em.id === id ? { ...em, [field]: value } : em;
      });
      syncToContext(nextState);
      return nextState;
    });
  };

  const handleRemove = (id: string) => {
    setLocalState((prev) => {
      const nextState = prev.filter((em) => em.id !== id);
      syncToContext(nextState);
      return nextState;
    });
  };

  return (
    <Card
      bg={isDark ? 'dark' : 'white'}
      text={isDark ? 'white' : 'dark'}
      className="border shadow-sm"
      onBlur={() => syncToContext.flush()}
    >
      <Card.Header className="py-2.5 px-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold small text-uppercase text-muted">Emergency Contact</span>
          {localState.length > 0 && (
            <Badge bg="secondary" pill className="fw-normal" style={{ fontSize: '0.75rem' }}>
              {localState.length}
            </Badge>
          )}
        </div>
        <ActionButton
          name="Add Emergency Contact"
          icon={Plus}
          action={handleAdd}
          variant="outline-primary"
          size="sm"
        />
      </Card.Header>
      <Card.Body className="p-3">
        {localState.length === 0 ? (
          <p className="text-muted small text-center py-4 mb-0">No emergency contacts added yet.</p>
        ) : (
          <div>
            {/* Desktop Column Headers */}
            <div className="d-none d-md-block px-3 py-1 mb-2 border-bottom bg-light bg-opacity-25 rounded-top">
              <Row className="g-2 text-muted small fw-semibold align-items-center">
                <Col md={2}>Name</Col>
                <Col md={1}>Relationship</Col>
                <Col md={2}>Mobile</Col>
                <Col md={2}>Alternate Mobile</Col>
                <Col md={2}>Email</Col>
                <Col md={2}>Address</Col>
                <Col md={1} className="text-end">
                  Action
                </Col>
              </Row>
            </div>

            {/* Contact Records */}
            <div className="d-flex flex-column gap-2">
              {localState.map((em) => (
                <div
                  key={em.id}
                  className={`px-3 py-2 rounded border ${
                    isDark
                      ? 'bg-secondary bg-opacity-10 border-secondary'
                      : 'bg-light bg-opacity-40 border-light-subtle'
                  }`}
                >
                  <Row className="g-2 align-items-center">
                    {/* Name */}
                    <Col xs={12} md={2}>
                      <span className="d-md-none small fw-semibold text-muted d-block">
                        Contact Name:
                      </span>
                      <Form.Control
                        size="sm"
                        value={em.name}
                        placeholder="Full Name"
                        onChange={(e) => handleUpdate(em.id, 'name', e.target.value)}
                      />
                    </Col>

                    {/* Relationship */}
                    <Col xs={12} md={1}>
                      <span className="d-md-none small fw-semibold text-muted d-block">
                        Relationship:
                      </span>
                      <Form.Control
                        size="sm"
                        value={em.relationship || ''}
                        placeholder="e.g. Father, Spouse"
                        onChange={(e) => handleUpdate(em.id, 'relationship', e.target.value)}
                      />
                    </Col>

                    {/* Mobile */}
                    <Col xs={6} md={2}>
                      <span className="d-md-none small fw-semibold text-muted d-block">
                        Mobile:
                      </span>
                      <Form.Control
                        size="sm"
                        value={em.mobile || ''}
                        placeholder="+91 XXXXX XXXXX"
                        onChange={(e) => handleUpdate(em.id, 'mobile', e.target.value)}
                      />
                    </Col>

                    {/* Alternate Mobile */}
                    <Col xs={6} md={2}>
                      <span className="d-md-none small fw-semibold text-muted d-block">
                        Alternate Mobile:
                      </span>
                      <Form.Control
                        size="sm"
                        value={em.alternateMobile || ''}
                        placeholder="Alt Phone"
                        onChange={(e) => handleUpdate(em.id, 'alternateMobile', e.target.value)}
                      />
                    </Col>
                    <Col xs={6} md={2}>
                      <span className="d-md-none small fw-semibold text-muted d-block">Email:</span>
                      <Form.Control
                        size="sm"
                        value={em.email || ''}
                        placeholder="contact@email.com (optional)"
                        onChange={(e) => handleUpdate(em.id, 'email', e.target.value)}
                      />
                    </Col>

                    {/* Address */}
                    <Col xs={12} md={2}>
                      <span className="d-md-none small fw-semibold text-muted d-block">
                        Address:
                      </span>
                      <Form.Control
                        size="sm"
                        value={em.address || ''}
                        placeholder="City / Address"
                        onChange={(e) => handleUpdate(em.id, 'address', e.target.value)}
                      />
                    </Col>

                    {/* Delete Action */}
                    <Col xs={12} md={1} className="text-end">
                      <ActionButton
                        name="Delete"
                        icon={Trash2}
                        action={() => handleRemove(em.id)}
                        variant="outline-danger"
                        size="sm"
                        iconOnly
                        title="Delete Contact"
                        className="border-0"
                      />
                    </Col>
                  </Row>

                  {/* Secondary Details: Primary Flag */}
                  <div className="mt-1.5 pt-1 border-top border-light-subtle d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <Form.Check
                      type="checkbox"
                      id={`primary-check-${em.id}`}
                      label={<span className="small text-muted">Primary Emergency Contact</span>}
                      checked={!!em.isPrimary}
                      onChange={(e) => handleUpdate(em.id, 'isPrimary', e.target.checked)}
                      className="mb-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export const ContactsTab = FormContactsTab;
export default ContactsTab;
