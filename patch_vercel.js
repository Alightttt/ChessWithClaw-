const fs = require('fs');

let vercelJson = fs.readFileSync('vercel.json', 'utf8');

// We just remove the crons block.
vercelJson = vercelJson.replace(/"crons": \[\s*\{\s*"path": "\/api\/actions\?action=send_reengagement_push",\s*"schedule": "0 15 \* \* \*"\s*\}\s*\],/, '');
fs.writeFileSync('vercel.json', vercelJson);
console.log('Patched vercel.json');
