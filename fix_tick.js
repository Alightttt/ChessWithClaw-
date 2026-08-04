const fs = require('fs');
let content = fs.readFileSync('src/pages/Game.jsx', 'utf-8');

content = content.replace(
  /const \[copiedRoom, setCopiedRoom\] = useState\(false\);/,
  `const [copiedRoom, setCopiedRoom] = useState(false);\n  const [copyGameIdTick, setCopyGameIdTick] = useState(false);`
);

fs.writeFileSync('src/pages/Game.jsx', content);
