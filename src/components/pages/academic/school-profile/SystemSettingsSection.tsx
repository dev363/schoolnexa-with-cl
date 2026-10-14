import React from 'react';
import { Card, Table, Badge, Form } from 'react-bootstrap';
import { Sliders, ShieldCheck } from 'lucide-react';
import { SchoolSettingItem } from '@/types';

interface SystemSettingsSectionProps {
  settings: SchoolSettingItem[];
  canEdit: boolean;
  isDark: boolean;
  onSettingChange: (settingKey: string, newValue: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: 'secondary',
  ACADEMIC: 'primary',
  ATTENDANCE: 'success',
  GRADING: 'warning',
  NOTIFICATIONS: 'info',
  SECURITY: 'danger',
};

export const SystemSettingsSection: React.FC<SystemSettingsSectionProps> = ({
  settings,
  canEdit,
  isDark,
  onSettingChange,
}) => {
  return (
    <Card
      bg={isDark ? 'dark' : 'white'}
      text={isDark ? 'white' : 'dark'}
      className="border shadow-none"
    >
      <Card.Header className="py-2.5 px-3 bg-transparent d-flex align-items-center justify-content-between border-bottom">
        <div className="d-flex align-items-center gap-2 fw-semibold small">
          <Sliders size={16} className="text-primary" />
          <span>System & Academic Configuration Parameters</span>
        </div>
        <Badge bg="secondary" className="fw-normal" style={{ fontSize: '0.75rem' }}>
          {settings.length} active parameters
        </Badge>
      </Card.Header>

      <div className="table-responsive mb-0">
        <Table
          hover
          size="sm"
          variant={isDark ? 'dark' : undefined}
          className="align-middle mb-0 text-nowrap"
        >
          <thead className="small text-muted border-bottom">
            <tr>
              <th className="ps-3 py-2">Parameter / Configuration Key</th>
              <th className="py-2">Category</th>
              <th className="py-2" style={{ minWidth: '220px' }}>
                Current Value
              </th>
              <th className="py-2">Type</th>
              <th className="pe-3 py-2 text-end">Security</th>
            </tr>
          </thead>
          <tbody className="small">
            {settings.map((item) => {
              const isBool =
                item.dataType === 'BOOLEAN' ||
                item.settingValue === 'true' ||
                item.settingValue === 'false';

              return (
                <tr key={item.id || item.settingKey}>
                  <td className="ps-3 py-2">
                    <div className="font-monospace fw-semibold text-primary">{item.settingKey}</div>
                    {item.description && (
                      <div
                        className="text-muted"
                        style={{ fontSize: '0.75rem', whiteSpace: 'normal', maxWidth: '420px' }}
                      >
                        {item.description}
                      </div>
                    )}
                  </td>

                  <td className="py-2">
                    <Badge
                      bg={CATEGORY_COLORS[item.category || 'GENERAL'] || 'secondary'}
                      className="fw-normal"
                    >
                      {item.category || 'GENERAL'}
                    </Badge>
                  </td>

                  <td className="py-2">
                    {isBool ? (
                      <Form.Select
                        id={`select-setting-${item.settingKey}`}
                        size="sm"
                        style={{ maxWidth: '160px' }}
                        value={item.settingValue}
                        onChange={(e) => onSettingChange(item.settingKey, e.target.value)}
                        disabled={!canEdit}
                      >
                        <option value="true">Enabled (true)</option>
                        <option value="false">Disabled (false)</option>
                      </Form.Select>
                    ) : (
                      <Form.Control
                        id={`input-setting-${item.settingKey}`}
                        size="sm"
                        type={item.dataType === 'NUMBER' ? 'number' : 'text'}
                        value={item.settingValue}
                        onChange={(e) => onSettingChange(item.settingKey, e.target.value)}
                        disabled={!canEdit}
                        style={{ maxWidth: '280px' }}
                      />
                    )}
                  </td>

                  <td className="py-2">
                    <span
                      className="badge bg-light text-dark border font-monospace"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {item.dataType}
                    </span>
                  </td>

                  <td className="pe-3 py-2 text-end">
                    {item.isEncrypted ? (
                      <Badge
                        bg="danger"
                        className="fw-normal d-inline-flex align-items-center gap-1"
                      >
                        <ShieldCheck size={11} /> Encrypted
                      </Badge>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Standard
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Card>
  );
};
