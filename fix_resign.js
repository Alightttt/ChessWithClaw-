const fs = require('fs');
let content = fs.readFileSync('api/actions.js', 'utf-8');

content = content.replace(
  /if \(action === 'resign'\) \{\s*if \(role === 'human'\) \{\s*updates = \{ status: 'finished', result: 'black_wins', finished_at: now, result_reason: 'resignation' \};\s*chatText = message \|\| `You have resigned. \$\{agentName\} wins! 🦞`;\s*result = 'black_wins';\s*\} else \{\s*updates = \{ status: 'finished', result: 'white_wins', finished_at: now, result_reason: 'resignation' \};\s*chatText = message \|\| `\$\{agentName\} has resigned. Well played! 🦞`;\s*result = 'white_wins';\s*\}/s,
  `if (action === 'resign') {
      if (role === 'human') {
        const humanLoses = game.player_color === 'w' ? 'black' : 'white';
        updates = { status: 'finished', result: humanLoses, finished_at: now, result_reason: 'resignation' };
        chatText = message || \`You have resigned. \${agentName} wins! 🦞\`;
        result = humanLoses;
      } else {
        const agentLoses = game.player_color === 'w' ? 'white' : 'black';
        updates = { status: 'finished', result: agentLoses, finished_at: now, result_reason: 'resignation' };
        chatText = message || \`\${agentName} has resigned. Well played! 🦞\`;
        result = agentLoses;
      }`
);

fs.writeFileSync('api/actions.js', content);
