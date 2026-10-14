import { Card, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import ActionButton, { ActionButtonProps } from './Buttons';
import BadgeButton, { BadgeButtonGroup, BadgeButtonProps } from './Badge';

export type TopHeaderBadge = {
  bg: string;
  label: string;
};

export type TopHeaderProps = {
  title: string;
  subtitle?: string | ReactNode;
  icon?: LucideIcon;
  badges?: BadgeButtonProps[];
  actions?: ActionButtonProps[];
  rightContent?: ReactNode;
};

export const TopHeader = ({
  title,
  subtitle,
  icon: HeaderIcon = LayoutDashboard,
  badges = [],
  actions = [],
  rightContent,
}: TopHeaderProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border shadow-none">
      <Card.Body className="p-3">
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
          {/* Header Info */}
          <div
            className={`d-flex align-items-center gap-3 min-w-0 ${
              actions.length > 0 || rightContent ? 'shrink' : 'grow'
            }`}
          >
            <div className="rounded bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0 h-10 w-10">
              <HeaderIcon size={20} />
            </div>

            <div className="min-w-0">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h5 className="mb-0 fw-bold uppercase" style={{ fontSize: '1rem' }}>
                  {title}
                </h5>

                <BadgeButtonGroup badges={badges} />
              </div>

              {subtitle && <div className="text-muted small mb-0">{subtitle}</div>}
            </div>
          </div>

          {/* Right Side */}
          {(actions.length > 0 || rightContent) && (
            <div className="d-flex align-items-center justify-content-end gap-2 flex-wrap grow">
              {actions.map((item) => {
                return <ActionButton key={item.name} {...item} />;
              })}

              {rightContent}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TopHeader;
