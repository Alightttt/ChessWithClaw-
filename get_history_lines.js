const fs = require('fs');
const lines = fs.readFileSync('src/pages/Game.jsx', 'utf8').split('\n');
let start = -1;
let end = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* E) MOVE HISTORY */}')) {
    start = i;
  }
  if (start !== -1 && lines[i].includes('{/* F) MOBILE TAB CONTENT */}')) {
    end = i;
    break;
  }
  if (start !== -1 && lines[i].includes('      </div>')) {
    if (i > start + 50) {
      // Let's print out what is there
    }
  }
}
console.log(start, end);
