import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    try {
      console.error('[ChessWithClaw Error]', error, info);
    } catch (e) {
      // Ignore
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: '#080808',
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '32px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <span
            style={{
              fontSize: '48px',
              display: 'block',
              color: '#1a1a1a',
              marginBottom: '16px',
            }}
          >
            ♚
          </span>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '26px',
              fontWeight: 800,
              color: '#e0e0e0',
              marginBottom: '8px',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#444',
              maxWidth: '260px',
              margin: '0 auto 24px',
            }}
          >
            {this.state.error?.message || 'Unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
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
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
