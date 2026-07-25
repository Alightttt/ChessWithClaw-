const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// 1. Update text "No signup. No subscription."
code = code.replace(
  /fontSize: 13, color:'rgba\(242,242,242,0\.35\)',\n *fontFamily:'Inter, sans-serif', marginTop:12, letterSpacing:'0\.02em',/g,
  "fontSize: 14.5, color:'rgba(255,255,255,1)',\n                fontFamily:'Inter, sans-serif', marginTop:12, letterSpacing:'0.01em',"
);
code = code.replace(
  /fontSize: 13, color:'rgba\(242,242,242,0\.35\)',\n *fontFamily:'Inter, sans-serif', marginTop:8, letterSpacing:'0\.02em', textAlign: 'center'/g,
  "fontSize: 14.5, color:'rgba(255,255,255,1)',\n              fontFamily:'Inter, sans-serif', marginTop:8, letterSpacing:'0.01em', textAlign: 'center'"
);

// 2. Replace ChessPiecesIcon with knight SVG
const newIcon = `const ChessPiecesIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 20h12" />
    <path d="M8 20v-3c0-3 1.5-5 3.5-7l1.5-2c1-1.5 1-2.5 0-3.5 2 0 4.5 1.5 5 4s-2 2-2 2c2 2 2 5 2 7v2" />
    <path d="M8.5 12.5 11 11" />
  </svg>
);`;

code = code.replace(/const ChessPiecesIcon = \(\{.*?\}\);\n?/s, newIcon + '\n');

fs.writeFileSync('src/pages/Home.jsx', code);
