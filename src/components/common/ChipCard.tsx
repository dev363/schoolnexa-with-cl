import { Button, Card } from 'react-bootstrap';
import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ChipCardProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;

  // Optional click action
  onClick?: () => void;

  // Custom styling
  className?: string;
  style?: CSSProperties;

  // Optional button variant
  variant?: string;
};

export const ChipCard = ({
  title,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  onClick,
  className = '',
  style,
  variant = 'light',
}: ChipCardProps) => {
  return (
    <Button
      variant={variant}
      className={`w-100 text-start p-2.5 border border-secondary-subtle selected-hover ${className}`}
      style={style}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <div className="d-flex align-items-center gap-1.5 fw-semibold small mb-0.5">
        <Icon size={14} className={iconColor} />
        <span>{title}</span>
      </div>

      {description && (
        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
          {description}
        </div>
      )}
    </Button>
  );
};

type InfoCardProps = {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  icon: LucideIcon;
  iconColor?: string;
  valueClassName?: string;
  className?: string;
  style?: CSSProperties;

  // Optional navigation/action
  link?: string | null;
  action?: (() => void) | null;
};

export const InfoCard = ({
  label,
  value,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  valueClassName = 'h5 fw-bold font-monospace mb-1',
  className = '',
  style,
  link = null,
  action = null,
}: InfoCardProps) => {
  const navigate = useNavigate();

  const isClickable = Boolean(link || action);

  const handleClick = () => {
    if (link) {
      navigate(link);
      return;
    }

    action?.();
  };

  return (
    <Card
      className={`h-100 border shadow-none ${className}`}
      style={{
        ...style,
        cursor: isClickable ? 'pointer' : undefined,
      }}
      onClick={isClickable ? handleClick : undefined}
    >
      <Card.Body className="p-3 selected-hover">
        <div className="d-flex align-items-center justify-content-between text-muted small mb-1">
          <span>{label}</span>
          <Icon size={15} className={iconColor} />
        </div>

        <div className={valueClassName}>{value}</div>

        {description && <div className="text-muted small text-truncate">{description}</div>}
      </Card.Body>
    </Card>
  );
};

export const CountCard = ({
  label,
  value,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  valueClassName = 'h5 fw-bold font-monospace mb-1',
  className = '',
  style,
  link = null,
  action = null,
}: InfoCardProps) => {
  const navigate = useNavigate();

  const isClickable = Boolean(link || action);

  const handleClick = () => {
    if (link) {
      navigate(link);
      return;
    }

    action?.();
  };

  return (
    <Card
      className={`h-60 border shadow-none ${className}`}
      style={{
        ...style,
        cursor: isClickable ? 'pointer' : undefined,
      }}
      onClick={isClickable ? handleClick : undefined}
    >
      <Card.Body className="px-3 py-1 selected-hover">
        <div className="d-flex align-items-center justify-content-between text-muted small mb-1">
          <div className="flex justify-start items-center gap-0.5">
            <Icon size={15} className={iconColor} />
            <span>{label}</span>
          </div>
          <div className={valueClassName}>{value}</div>
        </div>

        {description && <div className="text-muted small text-truncate">{description}</div>}
      </Card.Body>
    </Card>
  );
};

export default InfoCard;
