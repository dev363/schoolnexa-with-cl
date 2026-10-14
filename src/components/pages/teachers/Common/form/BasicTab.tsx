import React, { useState } from 'react';
import { Card, Form, Row, Col, Badge, Alert, Button } from 'react-bootstrap';
import { X } from 'lucide-react';
import { useTeacherFormContext } from '@/components/pages/teachers/context/TeacherFormContext';
import { Address } from '@/components/pages/teachers/types';
import { TeacherFormState } from '@/components/pages/teachers/teacherFormTypes';
import {
  GENDER_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  MARITAL_STATUS_OPTIONS,
} from '@/components/pages/teachers/constants';

export interface FormBasicTabProps {
  isDark?: boolean;
}

export const FormBasicTab: React.FC<FormBasicTabProps> = ({
  isDark = false,
}) => {
  const { state, handleTopStateChange } = useTeacherFormContext();

  // Local draft inputs for tag additions
  const [newLanguage, setNewLanguage] = useState('');
  const [newSkill, setNewSkill] = useState('');

  // Field updates backed by Context
  const updateField = (key: keyof TeacherFormState, value: string) => {
    handleTopStateChange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateCurrentAddress = (key: keyof Address, value: string) => {
    handleTopStateChange((prev) => {
      const nextCurr = { ...prev.currentAddress, [key]: value };
      return {
        ...prev,
        currentAddress: nextCurr,
        permanentAddress: prev.sameAsCurrentAddress ? { ...nextCurr } : prev.permanentAddress,
      };
    });
  };

  const updatePermanentAddress = (key: keyof Address, value: string) => {
    handleTopStateChange((prev) => ({
      ...prev,
      permanentAddress: { ...prev.permanentAddress, [key]: value },
    }));
  };

  const handleToggleSameAddress = (checked: boolean) => {
    handleTopStateChange((prev) => ({
      ...prev,
      sameAsCurrentAddress: checked,
      permanentAddress: checked ? { ...prev.currentAddress } : prev.permanentAddress,
    }));
  };

  const handleAddLanguage = () => {
    const trimmed = newLanguage.trim();
    if (!trimmed) return;
    if (!state.languages.includes(trimmed)) {
      handleTopStateChange((prev) => ({
        ...prev,
        languages: [...prev.languages, trimmed],
      }));
    }
    setNewLanguage('');
  };

  const handleRemoveLanguage = (lang: string) => {
    handleTopStateChange((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (!state.specialSkills.includes(trimmed)) {
      handleTopStateChange((prev) => ({
        ...prev,
        specialSkills: [...prev.specialSkills, trimmed],
      }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    handleTopStateChange((prev) => ({
      ...prev,
      specialSkills: prev.specialSkills.filter((s) => s !== skill),
    }));
  };

  const effectiveTeacherId = state.teacherId || 'TCH-AUTO';

  return (
    <div className="d-flex flex-column gap-3">
      {/* Identity & Basic Info Card */}
      <Card
        bg={isDark ? 'dark' : 'white'}
        text={isDark ? 'white' : 'dark'}
        className="border shadow-sm"
      >
        <Card.Header className="py-2 px-3 fw-bold small text-uppercase text-muted d-flex align-items-center justify-content-between">
          <span>Teacher Identity & Basic Profile</span>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted fw-normal" style={{ fontSize: '0.78rem' }}>
              Permanent Teacher ID:
            </span>
            <Badge bg="primary" className="font-monospace px-2.5 py-1">
              {effectiveTeacherId}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-3">
          <Alert variant="light" className="border small py-2 mb-3">
            <strong>SchoolNexa Architecture Rule:</strong> Every teacher has one permanent, unique
            Teacher ID (e.g. <code>{effectiveTeacherId}</code>). It is generated automatically and
            cannot be manually modified.
          </Alert>

          <Row className="g-3">
            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">
                  First Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  size="sm"
                  value={state.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="e.g. Raj"
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Middle Name</Form.Label>
                <Form.Control
                  size="sm"
                  value={state.middleName}
                  onChange={(e) => updateField('middleName', e.target.value)}
                  placeholder="e.g. Kumar"
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">
                  Last Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  size="sm"
                  value={state.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="e.g. Sharma"
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Preferred Name / Salutation</Form.Label>
                <Form.Control
                  size="sm"
                  value={state.preferredName}
                  onChange={(e) => updateField('preferredName', e.target.value)}
                  placeholder="e.g. Raj Sir / Mrs. Sharma"
                />
              </Form.Group>
            </Col>

            <Col xs={6} sm={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Gender</Form.Label>
                <Form.Select
                  size="sm"
                  value={state.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={6} sm={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={state.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Profile Photo URL</Form.Label>
                <Form.Control
                  size="sm"
                  value={state.profilePhoto}
                  onChange={(e) => updateField('profilePhoto', e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </Form.Group>
            </Col>

            <Col xs={6} sm={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Blood Group</Form.Label>
                <Form.Select
                  size="sm"
                  value={state.bloodGroup}
                  onChange={(e) => updateField('bloodGroup', e.target.value)}
                >
                  {BLOOD_GROUP_OPTIONS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={6} sm={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Marital Status</Form.Label>
                <Form.Select
                  size="sm"
                  value={state.maritalStatus}
                  onChange={(e) => updateField('maritalStatus', e.target.value)}
                >
                  {MARITAL_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Contact Information Card */}
      <Card
        bg={isDark ? 'dark' : 'white'}
        text={isDark ? 'white' : 'dark'}
        className="border shadow-sm"
      >
        <Card.Header className="py-2 px-3 fw-bold small text-uppercase text-muted">
          Contact & Communication
        </Card.Header>
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">
                  Primary Mobile <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  size="sm"
                  value={state.mobile}
                  onChange={(e) => updateField('mobile', e.target.value)}
                  placeholder="+91 98140 XXXXX"
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Alternate Mobile</Form.Label>
                <Form.Control
                  size="sm"
                  value={state.alternateMobile}
                  onChange={(e) => updateField('alternateMobile', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">
                  Official School Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  size="sm"
                  value={state.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="teacher.name@schoolnexa.edu.in"
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Personal Alternate Email</Form.Label>
                <Form.Control
                  type="email"
                  size="sm"
                  value={state.alternateEmail}
                  onChange={(e) => updateField('alternateEmail', e.target.value)}
                  placeholder="personal@gmail.com"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Addresses Card */}
      <Card
        bg={isDark ? 'dark' : 'white'}
        text={isDark ? 'white' : 'dark'}
        className="border shadow-sm"
      >
        <Card.Header className="py-2 px-3 fw-bold small text-uppercase text-muted">
          Address Information
        </Card.Header>
        <Card.Body className="p-3">
          {/* Current Address */}
          <h6 className="fw-bold mb-2 small text-primary">Current Residential Address</h6>
          <Row className="g-2 mb-3">
            <Col xs={12} sm={6}>
              <Form.Control
                size="sm"
                placeholder="Address Line 1"
                value={state.currentAddress.addressLine1}
                onChange={(e) => updateCurrentAddress('addressLine1', e.target.value)}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Form.Control
                size="sm"
                placeholder="Address Line 2 (Area, Landmark)"
                value={state.currentAddress.addressLine2}
                onChange={(e) => updateCurrentAddress('addressLine2', e.target.value)}
              />
            </Col>
            <Col xs={6} sm={3}>
              <Form.Control
                size="sm"
                placeholder="City"
                value={state.currentAddress.city}
                onChange={(e) => updateCurrentAddress('city', e.target.value)}
              />
            </Col>
            <Col xs={6} sm={3}>
              <Form.Control
                size="sm"
                placeholder="State"
                value={state.currentAddress.state}
                onChange={(e) => updateCurrentAddress('state', e.target.value)}
              />
            </Col>
            <Col xs={6} sm={3}>
              <Form.Control
                size="sm"
                placeholder="Postal Code"
                value={state.currentAddress.postalCode}
                onChange={(e) => updateCurrentAddress('postalCode', e.target.value)}
              />
            </Col>
            <Col xs={6} sm={3}>
              <Form.Control
                size="sm"
                placeholder="Country"
                value={state.currentAddress.country}
                onChange={(e) => updateCurrentAddress('country', e.target.value)}
              />
            </Col>
          </Row>

          {/* Toggle Same */}
          <div className="mb-2">
            <Form.Check
              type="checkbox"
              id="same-address-toggle"
              label="Permanent Address is same as Current Address"
              checked={state.sameAsCurrentAddress}
              onChange={(e) => handleToggleSameAddress(e.target.checked)}
            />
          </div>

          {/* Permanent Address */}
          {!state.sameAsCurrentAddress && (
            <div>
              <h6 className="fw-bold mb-2 small text-secondary">Permanent Address</h6>
              <Row className="g-2">
                <Col xs={12} sm={6}>
                  <Form.Control
                    size="sm"
                    placeholder="Address Line 1"
                    value={state.permanentAddress.addressLine1}
                    onChange={(e) => updatePermanentAddress('addressLine1', e.target.value)}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Control
                    size="sm"
                    placeholder="Address Line 2"
                    value={state.permanentAddress.addressLine2}
                    onChange={(e) => updatePermanentAddress('addressLine2', e.target.value)}
                  />
                </Col>
                <Col xs={6} sm={3}>
                  <Form.Control
                    size="sm"
                    placeholder="City"
                    value={state.permanentAddress.city}
                    onChange={(e) => updatePermanentAddress('city', e.target.value)}
                  />
                </Col>
                <Col xs={6} sm={3}>
                  <Form.Control
                    size="sm"
                    placeholder="State"
                    value={state.permanentAddress.state}
                    onChange={(e) => updatePermanentAddress('state', e.target.value)}
                  />
                </Col>
                <Col xs={6} sm={3}>
                  <Form.Control
                    size="sm"
                    placeholder="Postal Code"
                    value={state.permanentAddress.postalCode}
                    onChange={(e) => updatePermanentAddress('postalCode', e.target.value)}
                  />
                </Col>
                <Col xs={6} sm={3}>
                  <Form.Control
                    size="sm"
                    placeholder="Country"
                    value={state.permanentAddress.country}
                    onChange={(e) => updatePermanentAddress('country', e.target.value)}
                  />
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Languages & Special Skills */}
      <Card
        bg={isDark ? 'dark' : 'white'}
        text={isDark ? 'white' : 'dark'}
        className="border shadow-sm"
      >
        <Card.Header className="py-2 px-3 fw-bold small text-uppercase text-muted">
          Languages & Special Talents
        </Card.Header>
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Label className="small fw-semibold">Languages Known</Form.Label>
              <div className="d-flex gap-1 mb-2">
                <Form.Control
                  size="sm"
                  placeholder="e.g. French, Sanskrit"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLanguage();
                    }
                  }}
                />
                <Button variant="outline-primary" size="sm" onClick={handleAddLanguage}>
                  Add
                </Button>
              </div>
              <div className="d-flex flex-wrap gap-1">
                {state.languages.map((lang) => (
                  <Badge
                    key={lang}
                    bg="light"
                    text="dark"
                    className="border d-flex align-items-center gap-1"
                  >
                    <span>{lang}</span>
                    <X
                    size={12}
                    className="text-danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRemoveLanguage(lang)}
                  />
                </Badge>
              ))}
            </div>
          </Col>

          <Col xs={12} md={6}>
            <Form.Label className="small fw-semibold">
              Special Skills & Pedagogical Focus
            </Form.Label>
            <div className="d-flex gap-1 mb-2">
              <Form.Control
                size="sm"
                placeholder="e.g. Olympiad Coach, Robotics"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button variant="outline-primary" size="sm" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
            <div className="d-flex flex-wrap gap-1">
              {state.specialSkills.map((skill) => (
                <Badge
                  key={skill}
                  bg="light"
                  text="dark"
                  className="border d-flex align-items-center gap-1"
                >
                  <span>{skill}</span>
                  <X
                    size={12}
                    className="text-danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRemoveSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  </div>
);
};

export const BasicTab = FormBasicTab;
export default BasicTab;
