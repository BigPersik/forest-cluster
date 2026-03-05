import React from 'react';

/**
 * Tree / forest icon — під лісовий фон.
 */
export function ForestIcon({ className, size = 64 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Trunk */}
      <path d="M26 38 L26 56 L38 56 L38 38 Z" fill="#3d2e1e" />
      <path d="M28 40 L28 54 L36 54 L36 40 Z" fill="#4a3a28" />
      {/* Foliage - three layers */}
      <ellipse cx="32" cy="22" rx="20" ry="18" fill="#2d5a2f" />
      <ellipse cx="32" cy="22" rx="16" ry="14" fill="#3d6b40" />
      <ellipse cx="32" cy="26" rx="14" ry="12" fill="#4a7c38" />
      <ellipse cx="28" cy="20" rx="8" ry="7" fill="#5a9c3d" />
      <ellipse cx="36" cy="20" rx="8" ry="7" fill="#5a9c3d" />
    </svg>
  );
}
