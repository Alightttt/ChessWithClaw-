const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// 1. Fix logo size
code = code.replace(
  /style=\{\{ \n              height: '24px',/g,
  "style={{ \n              height: '28px',"
);

// 2. Fix animation for settings
const oldSettingsModal = `<Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Settings" hideOverlay={isDesktop}>`;
const newSettingsModal = `<Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Settings" hideOverlay={isDesktop} className="animate-in slide-in-from-bottom-4 duration-300">`;
// Alternatively, let's just use Modal's animation. I see the Modal might not have animate-in natively, let's check Modal.jsx
fs.writeFileSync('src/pages/Game.jsx', code);
console.log('Fixed logo.');
