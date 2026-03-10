import React from 'react';

export default function Card({
  children,
  className = '',
  glowing = false,
  hoverable = false,
  padding = 'p-4 md:p-6',
  onClick,
  ...props
}) {
  const baseStyles = 'bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-lg';
  const glowStyles = glowing ? 'shadow-[0_0_15px_rgba(229,62,62,0.15)] border-[var(--color-red-primary)]/50' : '';
  const hoverStyles = hoverable ? 'transition-all duration-200 hover:border-[var(--color-border-default)] hover:-translate-y-[2px] cursor-pointer hover:shadow-lg hover:shadow-black/50' : '';

  return (
    <div
      className={`${baseStyles} ${glowStyles} ${hoverStyles} ${padding} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
