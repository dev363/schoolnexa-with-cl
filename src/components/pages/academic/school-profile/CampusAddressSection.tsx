import React from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { SchoolProfile } from '@/types';

interface CampusAddressSectionProps {
  profile: SchoolProfile;
  canEdit: boolean;
  isDark: boolean;
  onChange: (field: keyof SchoolProfile, value: any) => void;
}

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'UTC',
];

const COMMON_CURRENCIES = [
  { code: 'USD', label: 'USD - United States Dollar ($)' },
  { code: 'EUR', label: 'EUR - Euro (€)' },
  { code: 'GBP', label: 'GBP - British Pound (£)' },
  { code: 'INR', label: 'INR - Indian Rupee (₹)' },
  { code: 'CAD', label: 'CAD - Canadian Dollar (CA$)' },
  { code: 'AUD', label: 'AUD - Australian Dollar (A$)' },
  { code: 'AED', label: 'AED - United Arab Emirates Dirham (AED)' },
  { code: 'SGD', label: 'SGD - Singapore Dollar (S$)' },
];

export const CampusAddressSection: React.FC<CampusAddressSectionProps> = ({
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
        <MapPin size={16} className="text-warning" />
        <span>Campus Address & Regional Locale</span>
      </Card.Header>

      <Card.Body className="p-3">
        <Row className="g-3">
          <Col md={6}>
            <Form.Group id="form-group-street-address">
              <Form.Label className="small fw-semibold mb-1">
                Street Address <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                id="input-street-address"
                size="sm"
                type="text"
                value={profile.address}
                onChange={(e) => onChange('address', e.target.value)}
                disabled={!canEdit}
                required
                placeholder="e.g. 42 Academic Crest Way, North Campus"
              />
            </Form.Group>
          </Col>

          <Col md={3} sm={6}>
            <Form.Group id="form-group-city">
              <Form.Label className="small fw-semibold mb-1">
                City / Municipality <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                id="input-city"
                size="sm"
                type="text"
                value={profile.city}
                onChange={(e) => onChange('city', e.target.value)}
                disabled={!canEdit}
                required
                placeholder="San Jose"
              />
            </Form.Group>
          </Col>

          <Col md={3} sm={6}>
            <Form.Group id="form-group-state">
              <Form.Label className="small fw-semibold mb-1">
                State / Province <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                id="input-state"
                size="sm"
                type="text"
                value={profile.state}
                onChange={(e) => onChange('state', e.target.value)}
                disabled={!canEdit}
                required
                placeholder="California"
              />
            </Form.Group>
          </Col>

          <Col md={3} sm={6}>
            <Form.Group id="form-group-country">
              <Form.Label className="small fw-semibold mb-1">
                Country <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                id="input-country"
                size="sm"
                type="text"
                value={profile.country}
                onChange={(e) => onChange('country', e.target.value)}
                disabled={!canEdit}
                required
                placeholder="United States"
              />
            </Form.Group>
          </Col>

          <Col md={3} sm={6}>
            <Form.Group id="form-group-postal-code">
              <Form.Label className="small fw-semibold mb-1">Postal / ZIP Code</Form.Label>
              <Form.Control
                id="input-postal-code"
                size="sm"
                type="text"
                value={profile.postalCode}
                onChange={(e) => onChange('postalCode', e.target.value)}
                disabled={!canEdit}
                placeholder="95134"
              />
            </Form.Group>
          </Col>

          <Col md={3} sm={6}>
            <Form.Group id="form-group-timezone">
              <Form.Label className="small fw-semibold mb-1 d-flex align-items-center gap-1">
                <Clock size={13} className="text-muted" />
                <span>Operating Timezone</span>
              </Form.Label>
              <Form.Select
                id="select-timezone"
                size="sm"
                value={profile.timezone}
                onChange={(e) => onChange('timezone', e.target.value)}
                disabled={!canEdit}
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3} sm={6}>
            <Form.Group id="form-group-currency">
              <Form.Label className="small fw-semibold mb-1 d-flex align-items-center gap-1">
                <DollarSign size={13} className="text-muted" />
                <span>Base Currency</span>
              </Form.Label>
              <Form.Select
                id="select-currency"
                size="sm"
                value={profile.currency}
                onChange={(e) => onChange('currency', e.target.value)}
                disabled={!canEdit}
              >
                {COMMON_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
