const fs = require('fs');
const lines = fs.readFileSync('src/pages/Game.jsx', 'utf8').split('\n');
let start = -1;
let end = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('chatMobileOpen && (')) {
    start = i;
  }
  if (start !== -1 && lines[i].includes(')}')) {
    if (i > start + 30) {
      end = i;
      break;
    }
  }
}
console.log(start, end);
