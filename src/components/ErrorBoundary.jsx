'use client';

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Something went wrong.</h1>
          <p className="text-zinc-400 mb-8 max-w-md">
            The application encountered an unexpected error. This is often due to a hydration mismatch or a rendering bug.
          </p>
          <pre className="bg-zinc-900 p-4 rounded text-left text-sm text-red-400 overflow-auto max-w-2xl w-full border border-red-900/30">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => {
                localStorage.removeItem('chess_save');
                window.location.reload();
            }}
            className="mt-8 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Clear Save & Reload
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
