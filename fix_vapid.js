const fs = require('fs');

const fallbackPublicKey = "BGL6xxxlPvquFXopdjltYbw5Xgz36Gka6N4Onz4qLY2F78BjHqxTdx6opzZBc8d6IXcN87enRfYXD0Tdn9tPi4g";
const fallbackPrivateKey = "ME6VzfWt_j6nk9K8dsBDFYFynv_tvrum0Y3JK2ePiL4";

// 1. Fix api/actions.js
let actionsCode = fs.readFileSync('api/actions.js', 'utf8');
actionsCode = actionsCode.replace(
  /process\.env\.VAPID_PUBLIC_KEY \|\| ''/g,
  `process.env.VAPID_PUBLIC_KEY || "${fallbackPublicKey}"`
);
fs.writeFileSync('api/actions.js', actionsCode);

// 2. Fix api/chat.js
let chatCode = fs.readFileSync('api/chat.js', 'utf8');
chatCode = chatCode.replace(
  /if \(process\.env\.VAPID_PUBLIC_KEY && process\.env\.VAPID_PRIVATE_KEY\) \{/,
  `const pubKey = process.env.VAPID_PUBLIC_KEY || "${fallbackPublicKey}";\n    const privKey = process.env.VAPID_PRIVATE_KEY || "${fallbackPrivateKey}";\n    if (pubKey && privKey) {`
);
chatCode = chatCode.replace(
  /webpush\.setVapidDetails\([\s\S]*?process\.env\.VAPID_PUBLIC_KEY,[\s\S]*?process\.env\.VAPID_PRIVATE_KEY[\s\S]*?\);/,
  `webpush.setVapidDetails('mailto:hello@example.com', pubKey, privKey);`
);
fs.writeFileSync('api/chat.js', chatCode);
