import React from 'react';

export default function Divider({ label, orientation = 'horizontal', className = '' }) {
  if (orientation === 'vertical') {
    return <div className={`w-px h-full bg-[var(--color-border-subtle)] ${className}`}></div>;
  }

  if (!label) {
    return <hr className={`border-[var(--color-border-subtle)] ${className}`} />;
  }

  return (
    <div className={`flex items-center w-full ${className}`}>
      <div className="flex-1 h-px bg-[var(--color-border-subtle)]"></div>
      <span className="px-3 text-xs text-[var(--color-text-muted)] uppercase tracking-widest font-bold">
        {label}
      </span>
      <div className="flex-1 h-px bg-[var(--color-border-subtle)]"></div>
    </div>
  );
}
