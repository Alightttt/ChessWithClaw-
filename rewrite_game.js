const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// 1. Fix setLocalMessages bug
code = code.replace(
  /setLocalMessages\(prev => \[\.\.\.prev, \{ role: 'agent', sender: 'agent', text: text, timestamp: Date\.now\(\) \}\]\);/,
  "setLocalMessages(prev => [...prev, { role: 'human', sender: 'human', text: text, timestamp: Date.now() }]);"
);

// 2. Fix red dot logic
code = code.replace(
  /chatMobileOpen === false && normalizedMessages\.length > 0 && normalizedMessages\[normalizedMessages\.length - 1\]\.sender === 'agent'/g,
  "chatMobileOpen === false && normalizedMessages.length > 0 && normalizedMessages[normalizedMessages.length - 1].role === 'agent'"
);

fs.writeFileSync('src/pages/Game.jsx', code);
console.log('Fixed simple bugs.');
