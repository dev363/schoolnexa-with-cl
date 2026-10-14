import React from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { Guardian } from '../types';
import { useTheme } from '@/context/ThemeContext';

interface GuardianListProps {
  guardians: Guardian[];
  onAddClick: () => void;
  onEditClick: (guardian: Guardian) => void;
  onRemoveClick: (guardianId: string) => void;
  readOnly?: boolean;
}

export const GuardianList: React.FC<GuardianListProps> = ({
  guardians,
  onAddClick,
  onEditClick,
  onRemoveClick,
  readOnly = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div>
      {/* Header bar with counter & Add button */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted">
            {guardians.length === 0
              ? 'No parent or guardian registered'
              : `${guardians.length} ${guardians.length === 1 ? 'Guardian' : 'Guardians'} Registered`}
          </span>
        </div>

        {!readOnly && (
          <Button
            variant="outline-primary"
            size="sm"
            type="button"
            onClick={onAddClick}
            className="d-inline-flex align-items-center gap-1.5 px-2.5 py-1"
          >
            <Plus size={14} />
            <span>Add Guardian</span>
          </Button>
        )}
      </div>

      {/* Empty State */}
      {guardians.length === 0 && (
        <div
          className={`text-center py-4 px-3 rounded border border-dashed ${
            isDark
              ? 'border-secondary bg-secondary bg-opacity-10'
              : 'border-light-subtle bg-light bg-opacity-50'
          }`}
        >
          <UserCheck size={28} className="text-muted opacity-50 mb-2" />
          <div className="fw-medium small mb-1">No Guardians Added Yet</div>
          <p className="text-muted small mb-3" style={{ maxWidth: '420px', margin: '0 auto' }}>
            Add at least one parent, guardian, or emergency contact record for this student.
          </p>
          {!readOnly && (
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={onAddClick}
              className="d-inline-flex align-items-center gap-1.5 px-3"
            >
              <Plus size={14} />
              <span>Add Guardian</span>
            </Button>
          )}
        </div>
      )}

      {/* Guardian Cards Grid */}
      {guardians.length > 0 && (
        <Row className="g-3">
          {guardians.map((guardian) => {
            const fullName =
              `${guardian.firstName} ${guardian.middleName ? guardian.middleName + ' ' : ''}${guardian.lastName}`.trim();
            const locationString = [guardian.city, guardian.state].filter(Boolean).join(', ');

            return (
              <Col xs={12} md={6} key={guardian.id}>
                <Card
                  bg={isDark ? 'dark' : 'white'}
                  text={isDark ? 'white' : 'dark'}
                  className={`h-100 border transition-all ${
                    isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'
                  } ${guardian.isPrimary ? 'border-primary border-opacity-50' : ''}`}
                >
                  <Card.Body className="p-3 d-flex flex-column justify-content-between">
                    <div>
                      {/* Top Header with Name, Relationship and Actions */}
                      <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-semibold text-base">{fullName}</span>
                            <Badge
                              bg={
                                guardian.relationship === 'Father' ||
                                guardian.relationship === 'Mother'
                                  ? 'primary'
                                  : 'secondary'
                              }
                              className="fw-normal px-2 py-0.5"
                              style={{ fontSize: '11px' }}
                            >
                              {guardian.relationship}
                            </Badge>
                          </div>
                          {guardian.occupation && (
                            <div className="text-muted small d-flex align-items-center gap-1 mt-0.5">
                              <Briefcase size={12} className="opacity-75" />
                              <span>{guardian.occupation}</span>
                            </div>
                          )}
                        </div>

                        {!readOnly && (
                          <div className="d-flex align-items-center gap-1 flex-shrink-0">
                            <Button
                              variant={isDark ? 'outline-secondary' : 'light'}
                              size="sm"
                              type="button"
                              onClick={() => onEditClick(guardian)}
                              className="p-1 text-primary border-0"
                              title="Edit Guardian"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant={isDark ? 'outline-secondary' : 'light'}
                              size="sm"
                              type="button"
                              onClick={() => onRemoveClick(guardian.id)}
                              className="p-1 text-danger border-0"
                              title="Remove Guardian"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="mb-2 py-2 border-top border-bottom border-light-subtle">
                        <div className="d-flex align-items-center gap-2 small mb-1">
                          <Phone size={13} className="text-muted flex-shrink-0" />
                          <span className="font-monospace fw-medium">{guardian.mobile}</span>
                          {guardian.alternateMobile && (
                            <span
                              className="text-muted font-monospace"
                              style={{ fontSize: '11px' }}
                            >
                              / {guardian.alternateMobile}
                            </span>
                          )}
                        </div>

                        {guardian.email && (
                          <div className="d-flex align-items-center gap-2 small text-muted text-truncate mb-1">
                            <Mail size={13} className="text-muted flex-shrink-0" />
                            <span className="text-truncate">{guardian.email}</span>
                          </div>
                        )}

                        {(guardian.address || locationString) && (
                          <div className="d-flex align-items-center gap-2 small text-muted text-truncate">
                            <MapPin size={13} className="text-muted flex-shrink-0" />
                            <span className="text-truncate">
                              {[guardian.address, locationString].filter(Boolean).join(' • ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Flags / Badges */}
                    <div className="d-flex align-items-center gap-1.5 flex-wrap pt-1">
                      {guardian.isPrimary && (
                        <span
                          className={`badge d-inline-flex align-items-center gap-1 ${
                            isDark
                              ? 'bg-primary bg-opacity-20 text-primary border border-primary border-opacity-25'
                              : 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20'
                          }`}
                          style={{ fontSize: '11px' }}
                        >
                          <ShieldCheck size={12} />
                          <span>Primary Guardian</span>
                        </span>
                      )}

                      {guardian.isEmergencyContact && (
                        <span
                          className={`badge d-inline-flex align-items-center gap-1 ${
                            isDark
                              ? 'bg-danger bg-opacity-20 text-danger border border-danger border-opacity-25'
                              : 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20'
                          }`}
                          style={{ fontSize: '11px' }}
                        >
                          <PhoneCall size={12} />
                          <span>Emergency Contact</span>
                        </span>
                      )}

                      {guardian.isAuthorizedPickup && (
                        <span
                          className={`badge d-inline-flex align-items-center gap-1 ${
                            isDark
                              ? 'bg-success bg-opacity-20 text-success border border-success border-opacity-25'
                              : 'bg-success bg-opacity-10 text-success border border-success border-opacity-20'
                          }`}
                          style={{ fontSize: '11px' }}
                        >
                          <CheckCircle2 size={12} />
                          <span>Authorized Pickup</span>
                        </span>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};
