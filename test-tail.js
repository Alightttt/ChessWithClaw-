const fs = require('fs');
const code = fs.readFileSync('src/pages/Game.jsx', 'utf8');
const start = code.indexOf('{isDesktop ? (');
const end = code.indexOf(') : (\n        <>\n          {/* MOBILE LAYOUT */}');
console.log(code.substring(end - 60, end + 60));
