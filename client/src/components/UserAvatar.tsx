import React, { useState } from 'react';

interface UserAvatarProps {
  name?: string;
  avatar?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showOnlineBadge?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatar,
  size = 'md',
  className = '',
  showOnlineBadge = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
    '2xl': 'w-24 h-24 text-3xl',
  };

  const badgeSizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  // Strictly check if a real custom photo was uploaded by user
  // Must NOT be empty, must NOT be default unsplash / placeholder stock photo
  const isCustomUploadedPhoto =
    !imgError &&
    Boolean(avatar) &&
    typeof avatar === 'string' &&
    avatar.trim().length > 0 &&
    !avatar.includes('photo-1534528741775-53994a69daeb') &&
    !avatar.includes('unsplash.com');

  const initialLetter = (name?.trim() || 'U')[0].toUpperCase();

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      {isCustomUploadedPhoto ? (
        <img
          src={avatar!}
          alt={name || 'User Profile'}
          onError={() => setImgError(true)}
          className={`${sizeClasses[size]} rounded-2xl object-cover border border-indigo-500/30 shadow-md`}
        />
      ) : (
        /* Default User Font / Initial Avatar - No photo unless uploaded */
        <div
          className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-black flex items-center justify-center shadow-lg shadow-indigo-600/25 border border-white/20 select-none tracking-tight transition-transform`}
          title={name || 'User Profile'}
        >
          <span>{initialLetter}</span>
        </div>
      )}

      {showOnlineBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${badgeSizeClasses[size]} bg-emerald-500 border-2 border-slate-950 rounded-full shadow-sm`}
        />
      )}
    </div>
  );
};

