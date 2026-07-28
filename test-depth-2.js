const fs = require('fs');
const code = fs.readFileSync('src/pages/Game.jsx', 'utf8');
const start = code.indexOf('{isDesktop ? (');
const segment = code.substring(start, start + 5000);
let depth = 0;
let lines = segment.split('\n');
for (let i = 0; i <= 300; i++) {
    let line = lines[i] || '';
    let openCount = (line.match(/<div/g) || []).length;
    let closeCount = (line.match(/<\/div>/g) || []).length;
    depth += openCount - closeCount;
    if (openCount !== closeCount) {
        console.log(`Line ${i}: +${openCount} -${closeCount} => depth ${depth}`);
    }
}
