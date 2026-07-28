const fs = require('fs');
const code = fs.readFileSync('src/pages/Game.jsx', 'utf8');
const start = code.indexOf('{isDesktop ? (');
const segment = code.substring(start);
const lines = segment.split('\n');
console.log("Lines 195-215 (approx end of left column):");
for(let i=195; i<=215; i++) console.log(i + ": " + lines[i]);
