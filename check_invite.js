const fs = require('fs');
let content = fs.readFileSync('src/pages/Game.jsx', 'utf-8');

const match = content.match(/<button[^>]*onClick=\{handleCopyInviteWithRipple\}[^>]*>[\s\S]*?<\/button>/);
if (match) {
  console.log(match[0]);
} else {
  console.log('not found');
}
