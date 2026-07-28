const fs = require('fs');
const code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// I will find the left desktop column and count divs
const start = code.indexOf('{/* LEFT DESKTOP COLUMN */}');
const end = code.indexOf('{/* RIGHT DESKTOP COLUMN */}');
const segment = code.substring(start, end);
let depth = 0;
for(let i=0; i<segment.length; i++) {
  if (segment.substr(i, 4) === '<div') depth++;
  if (segment.substr(i, 5) === '</div') depth--;
}
console.log('Depth inside left desktop column (should be -1 if it closes itself):', depth);
