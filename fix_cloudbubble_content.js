const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

code = code.replace(
  /\{thoughtText \|\| normalizedMessages\[normalizedMessages\.length - 1\]\?\.content \|\| 'Good game!'\}/g,
  "{thoughtText || (normalizedMessages.length > 0 ? (normalizedMessages[normalizedMessages.length - 1].content || normalizedMessages[normalizedMessages.length - 1].text) : 'Good game!')}"
);

fs.writeFileSync('src/pages/Game.jsx', code);
console.log('Fixed final thought render.');
