const fs = require('fs');
let content = fs.readFileSync('src/pages/Game.jsx', 'utf-8');

// Copy Game ID button feedback
content = content.replace(
  /<button onClick=\{\(\) => \{ navigator\.clipboard\.writeText\(gameId\); toast\.success\('Game ID copied'\); \}\} style=\{\{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2a2a2a', border: 'none', borderRadius: '8px', padding: '8px 12px', color: 'rgba\(242,242,242,0\.7\)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', cursor: 'pointer' \}\}>\s*<Copy size=\{14\} \/>\s*\{gameId \? `\$\{gameId\.slice\(0, 13\)\}\.\.\.` : ''\}\s*<\/button>/s,
  `<button onClick={() => { navigator.clipboard.writeText(gameId); toast.success('Game ID copied'); setCopyGameIdTick(true); setTimeout(() => setCopyGameIdTick(false), 2000); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2a2a2a', border: 'none', borderRadius: '8px', padding: '8px 12px', color: 'rgba(242,242,242,0.7)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', cursor: 'pointer' }}>
                {copyGameIdTick ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                {gameId ? \`\${gameId.slice(0, 13)}...\` : ''}
              </button>`
);

content = content.replace(
  /const \[copied, setCopied\] = useState\(false\);/,
  `const [copied, setCopied] = useState(false);\n  const [copyGameIdTick, setCopyGameIdTick] = useState(false);`
);

// Swipeable toggle component
const swipeableToggleComponent = `
const SwipeableToggle = ({ checked, onChange }) => {
  return (
    <div 
      onClick={() => onChange(!checked)}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.startX = e.clientX; }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          const delta = e.clientX - e.currentTarget.startX;
          if (delta > 10 && !checked) { onChange(true); e.currentTarget.releasePointerCapture(e.pointerId); }
          else if (delta < -10 && checked) { onChange(false); e.currentTarget.releasePointerCapture(e.pointerId); }
        }
      }}
      style={{ width: '48px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: checked ? '#4ade80' : '#3a3a3a', position: 'relative', transition: 'background 0.2s', touchAction: 'none' }}
    >
      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: checked ? '23px' : '3px', transition: 'left 0.2s', pointerEvents: 'none' }} />
    </div>
  );
};
`;

content = content.replace(
  /export default function Game\(\) \{/,
  swipeableToggleComponent + '\nexport default function Game() {'
);

content = content.replace(
  /<button onClick=\{\(\) => setSoundEnabled\(\!soundEnabled\)\} style=\{\{ width: '48px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: soundEnabled \? '#4ade80' : '#3a3a3a', position: 'relative', transition: 'background 0\.2s' \}\}>\s*<div style=\{\{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: soundEnabled \? '23px' : '3px', transition: 'left 0\.2s' \}\} \/>\s*<\/button>/s,
  `<SwipeableToggle checked={soundEnabled} onChange={setSoundEnabled} />`
);

content = content.replace(
  /<button onClick=\{\(\) => setBgmEnabled\(\!bgmEnabled\)\} style=\{\{ width: '48px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: bgmEnabled \? '#4ade80' : '#3a3a3a', position: 'relative', transition: 'background 0\.2s' \}\}>\s*<div style=\{\{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: bgmEnabled \? '23px' : '3px', transition: 'left 0\.2s' \}\} \/>\s*<\/button>/s,
  `<SwipeableToggle checked={bgmEnabled} onChange={setBgmEnabled} />`
);

fs.writeFileSync('src/pages/Game.jsx', content);
