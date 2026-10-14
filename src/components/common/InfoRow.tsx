import type { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

type InfoRowLayout =
  'start' | 'end' | 'between' | 'center' | 'around' | 'evenly' | 'inline' | 'stacked';

const layoutClasses: Record<InfoRowLayout, string> = {
  inline: 'd-flex align-items-center gap-2',
  start: 'd-flex align-items-center justify-content-start gap-2',
  end: 'd-flex align-items-center justify-content-end gap-2',
  between: 'd-flex align-items-center justify-content-between gap-2',
  center: 'd-flex align-items-center justify-content-center gap-2',
  around: 'd-flex align-items-center justify-content-around gap-2',
  evenly: 'd-flex align-items-center justify-content-evenly gap-2',
  stacked: 'd-flex flex-column align-items-start gap-1',
};

interface InfoRowProps {
  icon?: LucideIcon;
  label?: string;
  value?: React.ReactNode;
  primary?: boolean;
  iconSize?: number;
  className?: string;
  layout?: InfoRowLayout;
}

export const InfoRow = ({
  icon: Icon,
  label,
  value,
  primary = false,
  iconSize = 15,
  layout = 'inline',
  className = '',
}: InfoRowProps) => {
  return (
    <div className={`${layoutClasses[layout]} ${className}`.trim()}>
      {Icon && <Icon size={iconSize} className={primary ? 'text-primary' : 'text-muted'} />}
      {label && <span className="text-muted">{label}:</span>}

      <span className={primary ? 'fw-semibold' : undefined}>{value || '—'}</span>
    </div>
  );
};

export default InfoRow;
