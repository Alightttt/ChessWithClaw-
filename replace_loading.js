const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// 1. Remove "Agent page" text from loading
code = code.replace(
  /<div style=\{\{background: '#0f0f0f', borderBottom: '1px solid #1a1a1a', fontSize: '10px', color: '#333', textAlign: 'center', padding: '5px'\}\}>AGENT INTERFACE · AUTOMATED USE ONLY<\/div>/g,
  ""
);

// 2. Fix Leave warning back arrow
code = code.replace(
  /const \[showLeaveWarning, setShowLeaveWarning\] = useState\(false\);/g,
  "const [showLeaveWarning, setShowLeaveWarning] = useState(false);"
);

// Since showLeaveWarning state is not in the snippet seen, let's search for back arrow
