const fs = require('fs');
const code = fs.readFileSync('src/pages/Game.jsx', 'utf8');
const isDesktopStart = code.indexOf('{isDesktop ? (');
const rightDesktop = code.indexOf('{/* RIGHT DESKTOP COLUMN */}');
const segment = code.substring(isDesktopStart, rightDesktop);
let depth = 0;
for(let i=0; i<segment.length; i++) {
  if (segment.substr(i, 4) === '<div') depth++;
  if (segment.substr(i, 5) === '</div') depth--;
}
console.log('Depth at RIGHT DESKTOP COLUMN:', depth);
