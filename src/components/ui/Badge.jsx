import React from 'react';

export default function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded font-bold uppercase tracking-widest';
  
  const variants = {
    default: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]',
    secondary: 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]',
    red: 'bg-[var(--color-red-primary)]/10 text-[var(--color-red-primary)] border border-[var(--color-red-primary)]/20',
    green: 'bg-green-500/10 text-green-400 border border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
