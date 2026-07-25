import React from 'react';
import { renderToString } from 'react-dom/server';

const KnightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 20v-3c0-1.5-1-2.5-2.5-3.5L5 13c-1-1-1-2 0-3 1.5-1 3.5-.5 5 1 .5.5 1.5.5 2.5 0C14 10 15 8 15 6" />
    <path d="M15 6c2 1 3 3 3 5.5V20" />
    <path d="M6 20h12" />
    <path d="M9 10l-1 1" />
  </svg>
);

console.log(renderToString(<KnightIcon />));
