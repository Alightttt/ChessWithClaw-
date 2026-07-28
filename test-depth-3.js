const fs = require('fs');
const code = fs.readFileSync('src/pages/Game.jsx', 'utf8');
const start = code.indexOf('{isDesktop ? (');
const segment = code.substring(start);
let depth = 0;
let lines = segment.split('\n');
for (let i = 0; i <= 300; i++) {
    let line = lines[i] || '';
    let openCount = (line.match(/<div/g) || []).length;
    let closeCount = (line.match(/<\/div>/g) || []).length;
    depth += openCount - closeCount;
    if (depth === 0 && (openCount > 0 || closeCount > 0)) {
        console.log(`ZERO DEPTH at line ${i}`);
    }
}
