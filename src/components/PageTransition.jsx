import React, { useState, useEffect } from 'react';

export default function PageTransition({ children }) {
  const [state, setState] = useState('entering');

  useEffect(() => {
    setState('entering');
    const t = setTimeout(() => setState('visible'), 280);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        opacity: state === 'entering' ? 0 : 1,
        transform: state === 'entering' ? 'translateY(12px)' : 'translateY(0)',
        transition: 'opacity 280ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform, opacity',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        transform: state === 'entering' ? 'translateY(12px) translateZ(0)' : 'translateY(0) translateZ(0)',
        minHeight: '100dvh',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}
