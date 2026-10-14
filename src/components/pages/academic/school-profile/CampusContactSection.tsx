import React from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { Phone, Mail, User, Globe } from 'lucide-react';
import { SchoolProfile } from '@/types';

interface CampusContactSectionProps {
  profile: SchoolProfile;
  canEdit: boolean;
  isDark: boolean;
  onChange: (field: keyof SchoolProfile, value: any) => void;
}

export const CampusContactSection: React.FC<CampusContactSectionProps> = ({
  profile,
  canEdit,
  isDark,
  onChange,
}) => {
  return (
    <Card
      bg={isDark ? 'dark' : 'white'}
      text={isDark ? 'white' : 'dark'}
      className="border shadow-none"
    >
      <Card.Header className="py-2.5 px-3 bg-transparent d-flex align-items-center gap-2 fw-semibold small border-bottom">
        <Phone size={16} className="text-success" />
        <span>Contact & Administration</span>
      </Card.Header>

      <Card.Body className="p-3">
        <Row className="g-3">
          <Col md={3} sm={6}>
            <Form.Group id="form-group-official-email">
              <Form.Label className="small fw-semibold mb-1 d-flex align-items-center gap-1">
                <Mail size={13} className="text-muted" />
                <span>Official Email</span> <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                id="input-official-email"
                size="sm"
                type="email"
                value={profile.email}
                onChange={(e) => onChange('email', e.target.value)}
                disabled={!canEdit}
                required
                placeholder="admin@school.com"
              />
            </Form.Group>
          </Col>

          <Col md={3} sm={6}>
            <Form.Group id="form-group-official-phone">
              <Form.Label className="small fw-semibold mb-1 d-flex align-items-center gap-1">
                <Phone size={13} className="text-muted" />
                <span>Official Phone</span> <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                id="input-official-phone"
                size="sm"
                type="tel"
                value={profile.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                disabled={!canEdit}
                required
                placeholder="+1 (555) 019-2834"
              />
            </Form.Group>
          </Col>

          <Col md={3} sm={6}>
            <Form.Group id="form-group-principal-name">
              <Form.Label className="small fw-semibold mb-1 d-flex align-items-center gap-1">
                <User size={13} className="text-muted" />
                <span>Principal / Head of School</span>
              </Form.Label>
              <Form.Control
                id="input-principal-name"
                size="sm"
                type="text"
                value={profile.principalName || ''}
                onChange={(e) => onChange('principalName', e.target.value)}
                disabled={!canEdit}
                placeholder="Dr. Eleanor Vance, Ed.D."
              />
            </Form.Group>
          </Col>

          <Col md={3} sm={6}>
            <Form.Group id="form-group-official-website">
              <Form.Label className="small fw-semibold mb-1 d-flex align-items-center gap-1">
                <Globe size={13} className="text-muted" />
                <span>Official Website</span>
              </Form.Label>
              <Form.Control
                id="input-official-website"
                size="sm"
                type="url"
                value={profile.website || ''}
                onChange={(e) => onChange('website', e.target.value)}
                disabled={!canEdit}
                placeholder="https://oakridge.schoolnexa.com"
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
