import { Badge } from 'react-bootstrap';

export type BadgeButtonProps = {
  label: string;
  bg?: string;
  pill?: boolean;
  className?: string;
};

export const BadgeButton = ({
  label,
  bg = 'secondary',
  pill = false,
  className = '',
}: BadgeButtonProps) => {
  return (
    <Badge bg={bg} pill={pill} className={`fw-normal ${className}`}>
      {label}
    </Badge>
  );
};

export const BadgeButtonGroup = ({
  badges,
  className = '',
}: {
  badges: BadgeButtonProps[];
  className?: string;
}) => {
  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      {badges?.map((badge, index) => (
        <BadgeButton key={`${badge.label}-${index}`} {...badge} />
      ))}
    </div>
  );
};

export default BadgeButton;
