import React, { useState } from 'react';

interface TeacherAvatarProps {
  photoUrl?: string;
  name: string;
  size?: number;
  className?: string;
  showStatusIndicator?: boolean;
  status?: string;
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  photoUrl,
  name,
  size = 36,
  className = '',
  showStatusIndicator = false,
  status = 'ACTIVE',
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || 'T').toUpperCase();
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ACTIVE':
        return '#198754';
      case 'INACTIVE':
        return '#6c757d';
      case 'SUSPENDED':
        return '#ffc107';
      case 'RESIGNED':
      case 'TERMINATED':
        return '#dc3545';
      default:
        return '#0d6efd';
    }
  };

  return (
    <div
      className={`position-relative d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-circle ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: '#e2e8f0',
        color: '#334155',
        fontWeight: 600,
        fontSize: `${Math.max(12, Math.floor(size * 0.38))}px`,
        overflow: 'hidden',
      }}
    >
      {photoUrl && !imageError ? (
        <img
          src={photoUrl}
          alt={name}
          onError={() => setImageError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}

      {showStatusIndicator && (
        <span
          className="position-absolute rounded-circle border border-white"
          style={{
            width: `${Math.max(8, Math.floor(size * 0.25))}px`,
            height: `${Math.max(8, Math.floor(size * 0.25))}px`,
            backgroundColor: getStatusColor(),
            bottom: '0px',
            right: '0px',
          }}
        />
      )}
    </div>
  );
};

export const Avatar = TeacherAvatar;
export default TeacherAvatar;

