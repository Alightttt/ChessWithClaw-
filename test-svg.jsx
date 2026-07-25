const React = require('react');
const ChessPiecesIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 20h10" />
    <path d="M8 20v-3c0-1.5 1-2 1-3s-1-2-1-3c0-1.5 1-2 2-2h4c1 0 2 .5 2 2 0 1-1 2-1 3s1 1.5 1 3v3" />
    <circle cx="12" cy="7" r="2" />
  </svg>
)
console.log(ChessPiecesIcon({}));
