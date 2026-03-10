import React from 'react';

export default function Input({
  value,
  onChange,
  placeholder,
  leftIcon,
  rightIcon,
  error,
  disabled,
  className = '',
  ...props
}) {
  const baseStyles = 'w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-md h-10 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] transition-all duration-200 focus:outline-none focus:border-[var(--color-red-primary)] focus:ring-1 focus:ring-[var(--color-red-primary)]';
  const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  const paddingLeft = leftIcon ? 'pl-10' : 'pl-3';
  const paddingRight = rightIcon ? 'pr-10' : 'pr-3';

  return (
    <div className={`relative w-full ${className}`}>
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          {leftIcon}
        </div>
      )}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${baseStyles} ${errorStyles} ${disabledStyles} ${paddingLeft} ${paddingRight}`}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          {rightIcon}
        </div>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
