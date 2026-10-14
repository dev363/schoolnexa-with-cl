import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Calendar, Check, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import AcademicYearModal from './AcademicYearModal';

export const AcademicYearManage: React.FC = () => {
  const { activeSchool, activeAcademicYear, switchAcademicYear } = useAuth();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState<boolean>(false);

  if (!activeSchool) {
    return null;
  }

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle
          id="header-year-selector-btn"
          variant="outline-secondary"
          size="sm"
          className="d-flex align-items-center gap-1.5 py-1 px-2.5 text-truncate"
          style={{ maxWidth: '180px', fontSize: '0.8rem' }}
        >
          <Calendar size={14} className="text-success flex-shrink-0" />
          <span className="text-truncate d-none d-sm-inline">
            {activeAcademicYear?.name || t.topbar.academicYear}
          </span>
          <span className="text-truncate d-sm-none font-monospace">
            {activeAcademicYear?.code || t.common.session}
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu className="shadow border p-1" style={{ minWidth: '220px' }}>
          <Dropdown.Header
            className="text-uppercase small fw-bold px-2 py-1"
            style={{ fontSize: '0.7rem' }}
          >
            {t.topbar.academicAnchors} ({activeSchool.code})
          </Dropdown.Header>

          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {activeSchool.academicYears?.map((ay) => (
              <Dropdown.Item
                key={ay.id}
                id={`switch-year-${ay.id}`}
                active={activeAcademicYear?.id === ay.id}
                onClick={() => switchAcademicYear(ay.id)}
                className="d-flex align-items-center justify-content-between py-1.5 px-2 rounded small"
              >
                <div>
                  <div className="fw-medium">{ay.name}</div>
                  <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                    {ay.code} &bull; {ay.status} {ay.isCurrent ? ` (${t.common.current})` : ''}
                  </div>
                </div>
                {activeAcademicYear?.id === ay.id && (
                  <Check size={14} className="text-success flex-shrink-0" />
                )}
              </Dropdown.Item>
            ))}
          </div>

          <Dropdown.Divider className="my-1" />
          <Dropdown.Item
            id="open-new-year-btn"
            onClick={() => setShowModal(true)}
            className="d-flex align-items-center gap-1.5 text-success py-1.5 px-2 rounded small"
          >
            <Plus size={14} />
            <span>{t.topbar.addAcademicSession}</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <AcademicYearModal show={showModal} onHide={() => setShowModal(false)} />
    </>
  );
};

export default AcademicYearManage;
