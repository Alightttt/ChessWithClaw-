const fs = require('fs');
const files = [
  'src/components/InteractiveQuickStart.jsx',
  'src/components/LivePlatformActivity/index.jsx',
  'src/components/GameCreated.jsx',
  'src/pages/NotFound.jsx'
];
for (const f of files) {
  let content = fs.readFileSync(f, 'utf-8');
  content = content.replace(/['"]framer-motion['"]/g, "'motion/react'");
  fs.writeFileSync(f, content);
}
console.log('Fixed imports');
