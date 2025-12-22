import React from 'react';

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
};

export default function Spinner({ size = 'md' }) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  return (
    <div
      className={`${sizeClass} animate-spin rounded-full border-2 border-current border-t-transparent`}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
