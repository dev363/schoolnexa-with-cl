import { Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';

export type ActionButtonProps = {
  name: string;
  icon?: LucideIcon;
  action?: () => void;
  link?: string;
  variant?: string;
  size?: 'sm' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  className?: string;
  iconOnly?: boolean;
};

export const ActionButton = ({
  name,
  icon: ActionIcon,
  action,
  link,
  variant = 'primary',
  size = 'sm',
  disabled = false,
  loading = false,
  title,
  className = '',
  iconOnly = false,
}: ActionButtonProps) => {
  const navigate = useNavigate();
  const isDisabled = disabled || loading;

  const handleClick = () => {
    if (link) {
      navigate(link);
    } else if (action) {
      action();
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isDisabled}
      title={title ?? name}
      aria-label={iconOnly ? name : undefined}
      className={`d-inline-flex align-items-center justify-content-center gap-1.5 ${
        iconOnly ? 'px-2' : ''
      } ${className}`}
    >
      {loading ? <Spinner animation="border" size="sm" /> : ActionIcon && <ActionIcon size={16} />}

      {!iconOnly && <span>{name}</span>}
    </Button>
  );
};

export const ActionButtonGroup = ({ actions }: { actions: ActionButtonProps[] }) => {
  return (
    <Fragment>
      {actions?.map((action: ActionButtonProps) => (
        <ActionButton {...action} />
      ))}
    </Fragment>
  );
};

export default ActionButton;
