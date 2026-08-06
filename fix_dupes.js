const fs = require('fs');
let file = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// The resulting bad string:
// 'x-agent-token': agentToken || '', 'x-game-token': gameToken || '', 'x-game-token': gameToken || '' || ''
// or
// 'x-agent-token': agentToken || '', 'x-game-token': gameToken || '', 'x-game-token': gameToken || ''

file = file.replace(/'x-game-token': gameToken \|\| '', 'x-game-token': gameToken \|\| '' \|\| ''/g, "'x-game-token': gameToken || ''");
file = file.replace(/'x-game-token': gameToken \|\| '', 'x-game-token': gameToken \|\| ''/g, "'x-game-token': gameToken || ''");
file = file.replace(/, 'x-game-token': gameToken \|\| '' \|\| ''/g, ", 'x-game-token': gameToken || ''");

fs.writeFileSync('src/pages/Game.jsx', file);
console.log('Fixed dupes');
