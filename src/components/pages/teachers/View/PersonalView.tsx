import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { MapPin } from 'lucide-react';
import { Teacher, EmergencyContact } from '@/components/pages/teachers/types';
import { Card, InfoRow } from '@/components/common';
import { useTheme } from '@/context/ThemeContext';

interface Address {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface AddressCardProps {
  title: string;
  address?: Address;
  iconClassName?: string;
  headerAction?: React.ReactNode;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  title,
  address,
  iconClassName = 'text-primary',
  headerAction,
}) => {
  const hasAddress = Boolean(
    address?.addressLine1 ||
    address?.addressLine2 ||
    address?.city ||
    address?.state ||
    address?.postalCode ||
    address?.country,
  );

  return (
    <Card className="border shadow-sm h-100">
      <Card.Header className="py-2.5 px-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <MapPin size={15} className={iconClassName} />
          <span className="fw-bold small text-uppercase text-muted">{title}</span>
        </div>

        {headerAction}
      </Card.Header>

      <Card.Body className="p-3">
        {hasAddress ? (
          <div className="d-flex flex-column gap-2 small">
            {address?.addressLine1 && <InfoRow label="Address" value={address.addressLine1} />}

            {address?.addressLine2 && (
              <InfoRow label="Address Line 2" value={address.addressLine2} />
            )}

            {(address?.city || address?.state) && (
              <InfoRow
                label="City / State"
                value={
                  <>
                    {address.city}
                    {address.city && address.state ? ', ' : ''}
                    {address.state}
                    {address.postalCode ? ` - ${address.postalCode}` : ''}
                  </>
                }
              />
            )}

            {address?.country && <InfoRow label="Country" value={address.country} />}
          </div>
        ) : (
          <InfoRow label="Address" value="—" />
        )}
      </Card.Body>
    </Card>
  );
};
export const DemographicHeader: React.FC = () => (
  <Card.Header className="py-2.5 px-3">
    <span className="fw-bold small text-uppercase text-muted">Demographic & Personal Data</span>
  </Card.Header>
);

export const DemographicDetails: React.FC<{ teacher: Teacher }> = ({ teacher }) => (
  <Row className="g-3 small">
    <Col xs={6} sm={3}>
      <InfoRow label="Gender" value={teacher.gender || '—'} />
    </Col>

    <Col xs={6} sm={3}>
      <InfoRow label="Date of Birth" value={teacher.dateOfBirth} />
    </Col>

    <Col xs={6} sm={3}>
      <InfoRow label="Nationality" value={teacher.nationality || 'Indian'} />
    </Col>

    <Col xs={6} sm={3}>
      <InfoRow label="Marital Status" value={teacher.maritalStatus} />
    </Col>

    <Col xs={6} sm={3}>
      <InfoRow label="Blood Group" value={teacher.bloodGroup} className="text-danger" />
    </Col>

    <Col xs={6} sm={3}>
      <InfoRow
        label="Languages Known"
        value={teacher.languages?.length ? teacher.languages.join(', ') : 'English, Hindi'}
      />
    </Col>

    <Col xs={12} sm={6}>
      <InfoRow
        label="Special Skills"
        value={teacher.specialSkills?.length ? teacher.specialSkills.join(', ') : '—'}
      />
    </Col>
  </Row>
);

export const ContactsHeader: React.FC<{ count: number }> = ({ count }) => (
  <Card.Header className="py-2.5 px-3 d-flex align-items-center justify-content-between">
    <span className="fw-bold small text-uppercase text-muted">Emergency Contacts</span>
    {count > 0 && (
      <Badge bg="secondary" pill className="fw-normal" style={{ fontSize: '0.75rem' }}>
        {count}
      </Badge>
    )}
  </Card.Header>
);

export const ContactsTableHeader: React.FC = () => (
  <div className="d-none d-md-block px-3 py-1 mb-2 border-bottom bg-light bg-opacity-25 rounded-top">
    <Row className="g-2 text-muted small fw-semibold align-items-center">
      <Col md={3}>Name</Col>
      <Col md={2}>Relationship</Col>
      <Col md={2}>Mobile</Col>
      <Col md={2}>Alternate Mobile</Col>
      <Col md={3}>Address</Col>
    </Row>
  </div>
);

export const ContactItem: React.FC<{ contact: EmergencyContact; isDark: boolean }> = ({
  contact,
  isDark,
}) => (
  <div
    className={`px-3 py-2 rounded border ${
      isDark
        ? 'bg-secondary bg-opacity-10 border-secondary'
        : 'bg-light bg-opacity-40 border-light-subtle'
    }`}
  >
    {/* Mobile info layout */}
    <div className="d-md-none d-flex flex-column gap-1">
      <div className="d-flex align-items-center justify-content-between">
        <InfoRow label="Name" value={contact.name} primary />
        {contact.isPrimary && (
          <Badge bg="success" className="fw-normal py-0.5 px-1.5" style={{ fontSize: '0.65rem' }}>
            Primary
          </Badge>
        )}
      </div>
      <InfoRow label="Relationship" value={contact.relationship} />
      <InfoRow label="Mobile" value={contact.mobile} />
      {contact.alternateMobile && (
        <InfoRow label="Alternate Mobile" value={contact.alternateMobile} />
      )}
      {contact.address && <InfoRow label="Address" value={contact.address} />}
    </div>

    {/* Desktop tabular columns */}
    <div className="d-none d-md-block">
      <Row className="g-2 align-items-center">
        <Col md={3}>
          <div className="d-flex align-items-center gap-1.5">
            <span className="fw-semibold text-primary text-truncate" title={contact.name}>
              {contact.name || '—'}
            </span>
            {contact.isPrimary && (
              <Badge
                bg="success"
                className="fw-normal py-0.5 px-1.5"
                style={{ fontSize: '0.65rem' }}
              >
                Primary
              </Badge>
            )}
          </div>
        </Col>
        <Col md={2}>
          <span className="text-truncate d-block">{contact.relationship || '—'}</span>
        </Col>
        <Col md={2}>
          <span className="font-monospace small">{contact.mobile || '—'}</span>
        </Col>
        <Col md={2}>
          <span className="text-muted small font-monospace">{contact.alternateMobile || '—'}</span>
        </Col>
        <Col md={3}>
          <span className="text-muted small text-truncate d-block" title={contact.address}>
            {contact.address || '—'}
          </span>
        </Col>
      </Row>
    </div>

    {/* Email if present */}
    {contact.email && (
      <div className="mt-1 text-muted small border-top pt-1 text-truncate">
        <span className="fst-italic">Email: {contact.email}</span>
      </div>
    )}
  </div>
);

export const TeacherContactsView: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const emergencyContacts = teacher.emergencyContacts || [];

  return (
    <Card className="shadow-sm border">
      <ContactsHeader count={emergencyContacts.length} />
      <Card.Body className="p-3">
        {emergencyContacts.length === 0 ? (
          <p className="text-muted small text-center py-4 mb-0">No emergency contacts on file.</p>
        ) : (
          <div>
            <ContactsTableHeader />
            <div className="d-flex flex-column gap-2">
              {emergencyContacts.map((contact) => (
                <ContactItem key={contact.id} contact={contact} isDark={isDark} />
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export interface PersonalViewProps {
  teacher: Teacher;
  showContacts?: boolean;
}

export const PersonalView: React.FC<PersonalViewProps> = ({ teacher, showContacts = true }) => {
  return (
    <div className="d-flex flex-column gap-3">
      {/* Demographic & Personal Data */}
      <Card className="border shadow-sm">
        <DemographicHeader />
        <Card.Body className="p-3">
          <DemographicDetails teacher={teacher} />
        </Card.Body>
      </Card>

      {/* Contact Channels & Addresses */}
      <Row className="g-3">
        <Col xs={12} md={6}>
          <AddressCard
            title="Current Residential Address"
            address={teacher.currentAddress}
            iconClassName="text-primary"
          />
        </Col>

        <Col xs={12} md={6}>
          <AddressCard
            title="Permanent Address"
            address={teacher.permanentAddress}
            iconClassName="text-secondary"
          />
        </Col>
      </Row>

      {/* Emergency Contacts */}
      {showContacts && <TeacherContactsView teacher={teacher} />}
    </div>
  );
};

export const TeacherBasicView = PersonalView;
export default PersonalView;
