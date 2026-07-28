const fs = require('fs');
let content = fs.readFileSync('api/actions.js', 'utf8');

const oldSubId = "const subId = Buffer.from(subscription.endpoint).toString('base64').substring(0, 50);";
const newSubId = "const crypto = require('crypto');\n      const subId = crypto.createHash('sha256').update(subscription.endpoint + (gameId || '')).digest('hex');";
content = content.replace(oldSubId, newSubId);
fs.writeFileSync('api/actions.js', content);
