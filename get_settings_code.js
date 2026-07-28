const fs = require('fs');
const lines = fs.readFileSync('src/pages/Game.jsx', 'utf8').split('\n');
console.log(lines.slice(2370, 2520).join('\n'));
