const fs = require('fs');

let file = fs.readFileSync('api/actions.js', 'utf8');

// The `send_reengagement_push` logic runs from line 136 down to line 219 (end of action blocks)
// I will just replace the `send_reengagement_push` action with a dummy block.

file = file.replace(/} else if \(action === 'send_reengagement_push'\) \{[\s\S]*?\} else if \(action === 'get_vapid_key'\) \{/, "} else if (action === 'send_reengagement_push') { return res.status(200).json({ success: true, dummy: true }); } else if (action === 'get_vapid_key') {");

fs.writeFileSync('api/actions.js', file);
console.log('Patched actions.js for real');
