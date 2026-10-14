import React from 'react';
import { Card, Form, Row, Col, Badge } from 'react-bootstrap';
import { Building2, Award, Calendar, Hash, Globe, Image } from 'lucide-react';
import { SchoolProfile } from '@/types';

interface InstitutionalIdentitySectionProps {
  profile: SchoolProfile;
  canEdit: boolean;
  isDark: boolean;
  onChange: (field: keyof SchoolProfile, value: any) => void;
}

export const InstitutionalIdentitySection: React.FC<InstitutionalIdentitySectionProps> = ({
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
      <Card.Header className="py-2.5 px-3 bg-transparent d-flex align-items-center justify-content-between border-bottom">
        <div className="d-flex align-items-center gap-2 fw-semibold small">
          <Building2 size={16} className="text-primary" />
          <span>General Institutional Identity</span>
        </div>
        <Badge bg="primary" className="fw-normal font-monospace" style={{ fontSize: '0.7rem' }}>
          ID: {profile.code}
        </Badge>
      </Card.Header>

      <Card.Body className="p-3">
        <Row className="g-3">
          <Col md={6}>
            <Form.Group id="form-group-school-name">
              <Form.Label className="small fw-semibold mb-1">
                Official School Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                id="input-school-name"
                size="sm"
                type="text"
                value={profile.name}
                onChange={(e) => onChange('name', e.target.value)}
                disabled={!canEdit}
                required
                placeholder="e.g. Oakridge International Academy"
              />
            </Form.Group>
          </Col>

          <Col md={3} sm={6}>
            <Form.Group id="form-group-school-code">
              <Form.Label className="small fw-semibold mb-1 d-flex align-items-center gap-1">
                <Hash size={13} className="text-muted" />
                <span>School Identifier</span>
              </Form.Label>
              <Form.Control
                id="input-school-code"
                size="sm"
                type="text"
                value={profile.code}
                disabled
                className="font-monospace bg-body-secondary text-muted"
                title="System-assigned unique institutional code"
              />
            </Form.Group>
          </Col>

          <Col md={3} sm={6}>
            <Form.Group id="form-group-school-domain">
              <Form.Label className="small fw-semibold mb-1 d-flex align-items-center gap-1">
                <Globe size={13} className="text-muted" />
                <span>Custom Domain</span>
              </Form.Label>
              <Form.Control
                id="input-school-domain"
                size="sm"
                type="text"
                value={profile.domain || ''}
                onChange={(e) => onChange('domain', e.target.value)}
                disabled={!canEdit}
                placeholder="oakridge.schoolnexa.com"
              />
            </Form.Group>
          </Col>

          <Col md={4} sm={6}>
            <Form.Group id="form-group-affiliation-board">
              <Form.Label className="small fw-semibold mb-1 d-flex align-items-center gap-1">
                <Award size={13} className="text-primary" />
                <span>Accreditation / Board</span>
              </Form.Label>
              <Form.Control
                id="input-affiliation-board"
                size="sm"
                type="text"
                value={profile.affiliationBoard || ''}
                onChange={(e) => onChange('affiliationBoard', e.target.value)}
                disabled={!canEdit}
                placeholder="e.g. CBSE / Cambridge / IB / State Board"
              />
            </Form.Group>
          </Col>

          <Col md={4} sm={6}>
            <Form.Group id="form-group-registration-number">
              <Form.Label className="small fw-semibold mb-1">
                Registration / Charter Number
              </Form.Label>
              <Form.Control
                id="input-registration-number"
                size="sm"
                type="text"
                value={profile.registrationNumber || ''}
                onChange={(e) => onChange('registrationNumber', e.target.value)}
                disabled={!canEdit}
                placeholder="REG-2024-XXXX"
              />
            </Form.Group>
          </Col>

          <Col md={4} sm={6}>
            <Form.Group id="form-group-established-year">
              <Form.Label className="small fw-semibold mb-1 d-flex align-items-center gap-1">
                <Calendar size={13} className="text-muted" />
                <span>Year Established</span>
              </Form.Label>
              <Form.Control
                id="input-established-year"
                size="sm"
                type="number"
                min={1800}
                max={2099}
                value={profile.establishedYear || ''}
                onChange={(e) =>
                  onChange('establishedYear', e.target.value ? Number(e.target.value) : undefined)
                }
                disabled={!canEdit}
                placeholder="e.g. 2008"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group id="form-group-logo-url">
              <Form.Label className="small fw-semibold mb-1 d-flex align-items-center gap-1">
                <Image size={13} className="text-muted" />
                <span>Institutional Emblem / Logo URL</span>
              </Form.Label>
              <div className="d-flex align-items-center gap-3">
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="School Emblem"
                    className="rounded border object-fit-cover flex-shrink-0"
                    style={{ width: '42px', height: '42px' }}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    className="rounded bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                    style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}
                  >
                    {profile.name ? profile.name.charAt(0) : 'S'}
                  </div>
                )}
                <Form.Control
                  id="input-logo-url"
                  size="sm"
                  type="url"
                  value={profile.logoUrl || ''}
                  onChange={(e) => onChange('logoUrl', e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://cdn.example.com/branding/school-logo.png"
                  className="font-monospace"
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
