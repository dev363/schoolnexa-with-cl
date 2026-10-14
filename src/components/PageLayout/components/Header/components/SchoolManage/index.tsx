import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Building2, Check, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import SchoolProvisionModal from './SchoolProvisionModal';

export const SchoolManage: React.FC = () => {
  const { activeSchool, schools, switchSchool } = useAuth();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle
          id="header-school-selector-btn"
          variant="outline-secondary"
          size="sm"
          className="d-flex align-items-center gap-1.5 py-1 px-2.5 text-truncate"
          style={{ maxWidth: '220px', fontSize: '0.8rem' }}
        >
          <Building2 size={14} className="text-primary flex-shrink-0" />
          <span className="text-truncate">{activeSchool?.name || t.topbar.selectSchool}</span>
        </Dropdown.Toggle>

        <Dropdown.Menu className="shadow border p-1" style={{ minWidth: '240px' }}>
          <Dropdown.Header
            className="text-uppercase small fw-bold px-2 py-1"
            style={{ fontSize: '0.7rem' }}
          >
            {t.topbar.authorizedCampuses}
          </Dropdown.Header>

          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {schools.map((s) => (
              <Dropdown.Item
                key={s.id}
                id={`switch-school-${s.id}`}
                active={activeSchool?.id === s.id}
                onClick={() => switchSchool(s.id)}
                className="d-flex align-items-center justify-content-between py-1.5 px-2 rounded small"
              >
                <div className="text-truncate me-2">
                  <div className="fw-medium text-truncate">{s.name}</div>
                  <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                    {s.code} &bull; {s.status}
                  </div>
                </div>
                {activeSchool?.id === s.id && (
                  <Check size={14} className="text-primary flex-shrink-0" />
                )}
              </Dropdown.Item>
            ))}
          </div>

          <Dropdown.Divider className="my-1" />
          <Dropdown.Item
            id="open-new-school-btn"
            onClick={() => setShowModal(true)}
            className="d-flex align-items-center gap-1.5 text-primary py-1.5 px-2 rounded small"
          >
            <Plus size={14} />
            <span>{t.topbar.provisionNewSchool}</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <SchoolProvisionModal show={showModal} onHide={() => setShowModal(false)} />
    </>
  );
};

export default SchoolManage;
