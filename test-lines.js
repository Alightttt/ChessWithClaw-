const fs = require('fs');
const code = fs.readFileSync('src/pages/Game.jsx', 'utf8');
const start = code.indexOf('{isDesktop ? (');
const segment = code.substring(start, start + 5000);
const lines = segment.split('\n');
console.log("Lines 195-205 (approx end of left column):");
for(let i=195; i<=210; i++) console.log(i + ": " + lines[i]);
