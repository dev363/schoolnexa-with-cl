import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { UserCheck, Copy, Check } from 'lucide-react';
import { Guardian, GuardianRelationship, Gender } from '../types';
import { GUARDIAN_RELATIONSHIPS, GENDERS } from '@/config/Options';
import { useTheme } from '@/context/ThemeContext';

interface GuardianModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (guardian: Guardian) => void;
  initialGuardian?: Guardian | null;
  studentAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

const DEFAULT_GUARDIAN: Omit<Guardian, 'id'> = {
  relationship: 'Father',
  firstName: '',
  middleName: '',
  lastName: '',
  gender: 'MALE',
  mobile: '',
  alternateMobile: '',
  email: '',
  occupation: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  postalCode: '',
  isPrimary: false,
  isEmergencyContact: true,
  isAuthorizedPickup: true,
};

export const GuardianModal: React.FC<GuardianModalProps> = ({
  show,
  onHide,
  onSave,
  initialGuardian,
  studentAddress,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState<Omit<Guardian, 'id'>>({
    ...DEFAULT_GUARDIAN,
  });
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (show) {
      if (initialGuardian) {
        setFormData({
          relationship: initialGuardian.relationship,
          firstName: initialGuardian.firstName,
          middleName: initialGuardian.middleName || '',
          lastName: initialGuardian.lastName || '',
          gender: initialGuardian.gender || '',
          mobile: initialGuardian.mobile,
          alternateMobile: initialGuardian.alternateMobile || '',
          email: initialGuardian.email || '',
          occupation: initialGuardian.occupation || '',
          address: initialGuardian.address || '',
          city: initialGuardian.city || '',
          state: initialGuardian.state || '',
          country: initialGuardian.country || 'India',
          postalCode: initialGuardian.postalCode || '',
          isPrimary: initialGuardian.isPrimary,
          isEmergencyContact: initialGuardian.isEmergencyContact,
          isAuthorizedPickup: initialGuardian.isAuthorizedPickup,
        });
      } else {
        setFormData({
          ...DEFAULT_GUARDIAN,
        });
      }
      setValidated(false);
    }
  }, [show, initialGuardian]);

  const handleChange = (field: keyof Omit<Guardian, 'id'>, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCopyStudentAddress = () => {
    if (!studentAddress) return;
    const combinedAddress = [studentAddress.addressLine1, studentAddress.addressLine2]
      .filter(Boolean)
      .join(', ');

    setFormData((prev) => ({
      ...prev,
      address: combinedAddress || prev.address,
      city: studentAddress.city || prev.city,
      state: studentAddress.state || prev.state,
      country: studentAddress.country || prev.country,
      postalCode: studentAddress.postalCode || prev.postalCode,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidated(true);

    if (!formData.firstName.trim() || !formData.mobile.trim()) {
      return;
    }

    const savedRecord: Guardian = {
      id: initialGuardian ? initialGuardian.id : `g-${Date.now()}`,
      relationship: formData.relationship,
      firstName: formData.firstName.trim(),
      middleName: formData.middleName?.trim() || '',
      lastName: formData.lastName?.trim() || '',
      gender: formData.gender,
      mobile: formData.mobile.trim(),
      alternateMobile: formData.alternateMobile?.trim() || '',
      email: formData.email?.trim() || '',
      occupation: formData.occupation?.trim() || '',
      address: formData.address?.trim() || '',
      city: formData.city?.trim() || '',
      state: formData.state?.trim() || '',
      country: formData.country?.trim() || 'India',
      postalCode: formData.postalCode?.trim() || '',
      isPrimary: Boolean(formData.isPrimary),
      isEmergencyContact: Boolean(formData.isEmergencyContact),
      isAuthorizedPickup: Boolean(formData.isAuthorizedPickup),
    };

    onSave(savedRecord);
    onHide();
  };

  const isFirstNameInvalid = validated && !formData.firstName.trim();
  const isMobileInvalid = validated && !formData.mobile.trim();

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
      contentClassName={isDark ? 'bg-dark text-white border-secondary' : ''}
    >
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header
          closeButton
          closeVariant={isDark ? 'white' : undefined}
          className={isDark ? 'border-secondary' : ''}
        >
          <Modal.Title className="h5 fw-semibold d-flex align-items-center gap-2">
            <UserCheck size={20} className="text-primary" />
            <span>{initialGuardian ? 'Edit Guardian' : 'Add Guardian'}</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          {/* Guardian Profile Section */}
          <div className="mb-2.5">
            <div className="text-muted small fw-semibold text-uppercase tracking-wider mb-2">
              Guardian Details
            </div>
            <Row className="g-2.5">
              <Col xs={12} sm={6} md={4}>
                <Form.Group controlId="guardianRelationship" className="mb-2.5">
                  <Form.Label className="small font-medium">
                    Relationship <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={formData.relationship}
                    onChange={(e) =>
                      handleChange('relationship', e.target.value as GuardianRelationship)
                    }
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                    required
                  >
                    {GUARDIAN_RELATIONSHIPS.map((rel) => (
                      <option key={rel.id} value={rel.id}>
                        {rel.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={4}>
                <Form.Group controlId="guardianGender" className="mb-2.5">
                  <Form.Label className="small font-medium">Gender</Form.Label>
                  <Form.Select
                    size="sm"
                    value={formData.gender || ''}
                    onChange={(e) => handleChange('gender', e.target.value as Gender)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  >
                    <option value="">Select Gender</option>
                    {GENDERS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={4}>
                <Form.Group controlId="guardianOccupation" className="mb-2.5">
                  <Form.Label className="small font-medium">Occupation</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. Engineer, Doctor, Business"
                    value={formData.occupation || ''}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={4}>
                <Form.Group controlId="guardianFirstName" className="mb-2.5">
                  <Form.Label className="small font-medium">
                    First Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    isInvalid={isFirstNameInvalid}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    First name is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} sm={4}>
                <Form.Group controlId="guardianMiddleName" className="mb-2.5">
                  <Form.Label className="small font-medium">Middle Name</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Middle Name"
                    value={formData.middleName || ''}
                    onChange={(e) => handleChange('middleName', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={4}>
                <Form.Group controlId="guardianLastName" className="mb-2.5">
                  <Form.Label className="small font-medium">Last Name</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName || ''}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Contact Details */}
          <div className="mb-2.5 pt-2 border-top border-light-subtle">
            <div className="text-muted small fw-semibold text-uppercase tracking-wider mb-2">
              Contact Information
            </div>
            <Row className="g-2.5">
              <Col xs={12} sm={4}>
                <Form.Group controlId="guardianMobile" className="mb-2.5">
                  <Form.Label className="small font-medium">
                    Mobile Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="tel"
                    placeholder="e.g. 9820144520"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    isInvalid={isMobileInvalid}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Mobile number is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} sm={4}>
                <Form.Group controlId="guardianAlternateMobile" className="mb-2.5">
                  <Form.Label className="small font-medium">Alternate Mobile</Form.Label>
                  <Form.Control
                    size="sm"
                    type="tel"
                    placeholder="e.g. 9820144522"
                    value={formData.alternateMobile || ''}
                    onChange={(e) => handleChange('alternateMobile', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={4}>
                <Form.Group controlId="guardianEmail" className="mb-2.5">
                  <Form.Label className="small font-medium">Email Address</Form.Label>
                  <Form.Control
                    size="sm"
                    type="email"
                    placeholder="e.g. parent@example.com"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Address Details with "Same as student address" helper */}
          <div className="mb-2.5 pt-2 border-top border-light-subtle">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="text-muted small fw-semibold text-uppercase tracking-wider">
                Address Details
              </div>
              {studentAddress?.addressLine1 && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  type="button"
                  onClick={handleCopyStudentAddress}
                  className="py-0 px-2 d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '11px' }}
                >
                  <Copy size={12} />
                  <span>Same as student address</span>
                </Button>
              )}
            </div>

            <Row className="g-2.5">
              <Col xs={12}>
                <Form.Group controlId="guardianAddress" className="mb-2.5">
                  <Form.Label className="small font-medium">Address Line</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="House/Flat, Road, Area"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={6} sm={3}>
                <Form.Group controlId="guardianCity" className="mb-2.5">
                  <Form.Label className="small font-medium">City</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="City"
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={6} sm={3}>
                <Form.Group controlId="guardianState" className="mb-2.5">
                  <Form.Label className="small font-medium">State</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="State"
                    value={formData.state || ''}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={6} sm={3}>
                <Form.Group controlId="guardianCountry" className="mb-2.5">
                  <Form.Label className="small font-medium">Country</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Country"
                    value={formData.country || 'India'}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={6} sm={3}>
                <Form.Group controlId="guardianPostalCode" className="mb-2.5">
                  <Form.Label className="small font-medium">Postal Code</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="PIN Code"
                    value={formData.postalCode || ''}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Role Flags */}
          <div className="pt-2 border-top border-light-subtle">
            <div className="text-muted small fw-semibold text-uppercase tracking-wider mb-2">
              Guardian Permissions & Roles
            </div>
            <div
              className={`p-3 rounded border ${isDark ? 'bg-secondary bg-opacity-10 border-secondary' : 'bg-light border-light-subtle'}`}
            >
              <Row className="g-3">
                <Col xs={12} sm={4}>
                  <Form.Check
                    type="switch"
                    id="flag-primary"
                    label="Primary Guardian"
                    checked={formData.isPrimary}
                    onChange={(e) => handleChange('isPrimary', e.target.checked)}
                    className="small fw-medium"
                  />
                  <div className="text-muted" style={{ fontSize: '11px', marginLeft: '2.4em' }}>
                    Main point of contact for school notifications.
                  </div>
                </Col>

                <Col xs={12} sm={4}>
                  <Form.Check
                    type="switch"
                    id="flag-emergency"
                    label="Emergency Contact"
                    checked={formData.isEmergencyContact}
                    onChange={(e) => handleChange('isEmergencyContact', e.target.checked)}
                    className="small fw-medium"
                  />
                  <div className="text-muted" style={{ fontSize: '11px', marginLeft: '2.4em' }}>
                    Called immediately in urgent medical or campus alerts.
                  </div>
                </Col>

                <Col xs={12} sm={4}>
                  <Form.Check
                    type="switch"
                    id="flag-pickup"
                    label="Authorized Pickup"
                    checked={formData.isAuthorizedPickup}
                    onChange={(e) => handleChange('isAuthorizedPickup', e.target.checked)}
                    className="small fw-medium"
                  />
                  <div className="text-muted" style={{ fontSize: '11px', marginLeft: '2.4em' }}>
                    Authorized to collect student from school premises.
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className={isDark ? 'border-secondary' : ''}>
          <Button variant="outline-secondary" size="sm" onClick={onHide} className="px-3">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            className="d-inline-flex align-items-center gap-1.5 px-3"
          >
            <Check size={15} />
            <span>{initialGuardian ? 'Update' : 'Add'}</span>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
