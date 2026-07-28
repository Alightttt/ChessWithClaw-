const fs = require('fs');
const code = fs.readFileSync('src/pages/Game.jsx', 'utf8');
const start = code.indexOf('{isDesktop ? (');
const segment = code.substring(start);
const lines = segment.split('\n');
console.log("Lines 285-300:");
for(let i=285; i<=300; i++) console.log(i + ": " + lines[i]);
