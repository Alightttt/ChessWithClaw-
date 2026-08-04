const fs = require('fs');
let content = fs.readFileSync('src/components/GameCreated.jsx', 'utf-8');

content = content.replace(
  /color: copied \? '#10b981' : '#e63946',/,
  `color: bounceCopy ? '#ffffff' : (copied ? '#10b981' : '#e63946'),`
);

fs.writeFileSync('src/components/GameCreated.jsx', content);
