import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: '#080808',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      <span
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '96px',
          fontWeight: 900,
          color: 'rgba(230,57,70,0.15)',
          display: 'block',
          textAlign: 'center',
          marginBottom: '8px',
          lineHeight: 1,
        }}
      >
        404
      </span>
      <h1
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '28px',
          fontWeight: 800,
          color: '#e0e0e0',
          textAlign: 'center',
          marginBottom: '8px',
        }}
      >
        Page not found
      </h1>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
          color: '#444',
          textAlign: 'center',
          marginBottom: '28px',
        }}
      >
        This room might have expired or never existed.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          background: '#e63946',
          color: 'white',
          height: '44px',
          padding: '0 28px',
          border: 'none',
          borderRadius: '8px',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '17px',
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.3px',
          transition: 'background 120ms ease, transform 80ms ease',
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          willChange: 'transform, opacity',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#cc2f3b')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#e63946')}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        Go Home
      </button>
    </div>
  );
}
