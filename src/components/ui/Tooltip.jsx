import React, { useState, useRef, useEffect } from 'react';

export default function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--color-bg-elevated)] border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-bg-elevated)] border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--color-bg-elevated)] border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--color-bg-elevated)] border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div 
      className={`relative inline-flex ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      
      {isVisible && content && (
        <div className={`absolute z-50 ${positionStyles[position]} animate-in fade-in duration-200 pointer-events-none whitespace-nowrap`}>
          <div className="bg-[var(--color-bg-elevated)] text-white text-xs px-2.5 py-1.5 rounded shadow-md border border-[var(--color-border-subtle)] font-sans">
            {content}
          </div>
          <div className={`absolute border-4 ${arrowStyles[position]}`}></div>
        </div>
      )}
    </div>
  );
}
