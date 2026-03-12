import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import PageTransition from './components/PageTransition';
import ScrollToTop from './components/ScrollToTop';

const Home = lazy(() => import('./pages/Home'));
const Game = lazy(() => import('./pages/Game'));
const Agent = lazy(() => import('./pages/Agent'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Fallback = () => (
  <div
    style={{
      minHeight: '100dvh',
      background: '#080808',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: '#e63946',
        animation: 'pulse 1s ease-in-out infinite',
        willChange: 'transform, opacity',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}
    />
    <style>
      {`
        @keyframes pulse {
          0%, 100% { transform: scale(1) translateZ(0); opacity: 1; }
          50% { transform: scale(0.8) translateZ(0); opacity: 0.5; }
        }
      `}
    </style>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.key}>
      <Route path="/" element={<PageTransition><Home /></PageTransition>} />
      <Route path="/game/:id" element={<PageTransition><Game /></PageTransition>} />
      <Route path="/Agent" element={<PageTransition><Agent /></PageTransition>} />
      <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<Fallback />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  );
}
