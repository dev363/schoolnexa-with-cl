import React from 'react';

interface StudentAvatarProps {
  name: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  name,
  photoUrl,
  size = 'md',
  className = '',
}) => {
  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'S';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const dimensions = {
    sm: { width: '32px', height: '32px', fontSize: '12px' },
    md: { width: '40px', height: '40px', fontSize: '14px' },
    lg: { width: '56px', height: '56px', fontSize: '18px' },
    xl: { width: '80px', height: '80px', fontSize: '24px' },
  }[size];

  // Palette generator based on name hash for consistent pleasing tint
  const colors = [
    { bg: 'rgba(59, 130, 246, 0.15)', text: '#2563eb' },
    { bg: 'rgba(16, 185, 129, 0.15)', text: '#059669' },
    { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706' },
    { bg: 'rgba(139, 92, 246, 0.15)', text: '#7c3aed' },
    { bg: 'rgba(236, 72, 153, 0.15)', text: '#db2777' },
    { bg: 'rgba(20, 184, 166, 0.15)', text: '#0d9488' },
  ];
  const charCode = name.charCodeAt(0) || 0;
  const color = colors[charCode % colors.length];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`rounded-circle object-fit-cover border ${className}`}
        style={{ width: dimensions.width, height: dimensions.height }}
      />
    );
  }

  return (
    <div
      className={`rounded-circle d-flex align-items-center justify-content-center font-bold flex-shrink-0 ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        fontSize: dimensions.fontSize,
        backgroundColor: color.bg,
        color: color.text,
        border: `1px solid ${color.text}33`,
      }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
