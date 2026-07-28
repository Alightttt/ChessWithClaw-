const fs = require('fs');
const code = fs.readFileSync('src/pages/Game.jsx', 'utf8');
const start = code.indexOf('{isDesktop ? (');
const end = code.indexOf(') : (\n        <>\n          {/* MOBILE LAYOUT */}');

const segment = code.substring(start, end);
let depth = 0;
let lines = segment.split('\n');
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let openCount = (line.match(/<div/g) || []).length;
    let closeCount = (line.match(/<\/div>/g) || []).length;
    depth += openCount - closeCount;
    if (depth <= 0 && i > 0) {
        console.log(`Depth reached ${depth} at line ${i}: ${line}`);
    }
}
