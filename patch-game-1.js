const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// 1. Change overflow on root container
code = code.replace(
  /height:\s*'100dvh',\s*display:\s*'flex',\s*flexDirection:\s*'column',\s*position:\s*'relative'/,
  "height: '100dvh',\n        display: 'flex',\n        flexDirection: 'column',\n        position: 'relative',\n        overflow: 'hidden'"
);

// 2. Mobile Layout flex container
code = code.replace(
  /<div style=\{\{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' \}\} className="scrollbar-none">/,
  "<div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>"
);

// 3. Mobile Chess Board Wrapper
// Old: <div style={{ width: '100%', flexShrink: 0, position: 'relative', padding: '12px', boxSizing: 'border-box' }}>
code = code.replace(
  /<div style=\{\{ width: '100%', flexShrink: 0, position: 'relative', padding: '12px', boxSizing: 'border-box' \}\}>[\s\S]*?<div style=\{\{ padding: "0 12px", width: "100%" \}\}><div style=\{\{ borderRadius: "4px", overflow: "hidden", boxShadow: "0 8px 24px rgba\(0,0,0,0\.4\)", width: "100%", position: "relative", transition: "box-shadow 0\.8s ease" \}\}>/,
  `<div style={{ width: '100%', flex: 1, minHeight: 0, position: 'relative', padding: '12px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {game?.in_check && game.status === 'active' && (
            <div style={{ background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)', borderRadius: '8px', padding: '6px 12px', marginBottom: '8px', color: '#e63946', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600, textAlign: 'center', flexShrink: 0 }}>
              ⚠️ Check!
            </div>
          )}
          <div style={{ width: '100%', maxHeight: '100%', aspectRatio: '1/1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: "4px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", position: "relative", transition: "box-shadow 0.8s ease" }}>`
);

// Make sure to remove the old Check! div since we included it above
code = code.replace(
  /\{game\?\.in_check && game\.status === 'active' && \([\s\S]*?⚠️ Check![\s\S]*?<\/div>\s*\)\}\s*<div style=\{\{ padding: "0 12px", width: "100%" \}\}>/,
  ""
);

// 4. Fix closing div for the board wrapper in mobile
code = code.replace(
  /<\/div><\/div>\s*<CapturedPiecesRow/,
  "</div></div>\n          <CapturedPiecesRow"
);

// 5. Desktop layout threshold
code = code.replace(
  /const \[isDesktop, setIsDesktop\] = useState\(typeof window !== 'undefined' && window\.innerWidth >= 900\);/g,
  "const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);"
);
code = code.replace(
  /window\.innerWidth >= 900/g,
  "window.innerWidth >= 1024"
);

fs.writeFileSync('src/pages/Game.jsx', code);
console.log('Patch 1 applied');
