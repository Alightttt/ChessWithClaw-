const fs = require('fs');

let file = fs.readFileSync('api/actions.js', 'utf8');

file = file.replace(/} else if \(action === 'send_reengagement_push'\) \{[\s\S]*?\} else if \(action === 'get_vapid_key'\) \{/, "} else if (action === 'get_vapid_key') {");

fs.writeFileSync('api/actions.js', file);
console.log('Patched actions.js');
