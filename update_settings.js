const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// 1. Add animation to Settings overlay
code = code.replace(
  /<div style=\{\{ position: 'fixed', inset: 0, background: '#1c1a19', zIndex: 200, display: 'flex', flexDirection: 'column', overflowY: 'auto' \}\}>/,
  `<div style={{ position: 'fixed', inset: 0, background: '#1c1a19', zIndex: 200, display: 'flex', flexDirection: 'column', overflowY: 'auto', animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>`
);

// 2. Add slideInRight to keyframes
if (!code.includes('slideInRight')) {
  code = code.replace(
    /@keyframes msgSlide \{/,
    `@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes msgSlide {`
  );
}

fs.writeFileSync('src/pages/Game.jsx', code);
console.log('Added settings animation.');
