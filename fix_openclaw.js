const fs = require('fs');
let content = fs.readFileSync('src/pages/Game.jsx', 'utf-8');
content = content.replace("Invite your {agentName || 'OpenClaw'} first", "Invite your {agentName || 'Agent'} first");
fs.writeFileSync('src/pages/Game.jsx', content);
console.log('Fixed OpenClaw fallback');
