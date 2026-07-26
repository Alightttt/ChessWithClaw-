const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

const startIdx = code.indexOf('{/* C) YOU CARD */}');
const endMarker = '{/* E) MOVE HISTORY */}';
const endIdx = code.indexOf(endMarker, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `{/* C) MOBILE BUTTONS */}
        <div style={{ display: 'flex', gap: '12px', padding: '12px 16px', background: 'transparent', flexShrink: 0, justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{ flex: 1, background: '#1c1c1c', border: 'none', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.44l5.46 5.46"/></svg>
          </button>
          <button onClick={() => setChatMobileOpen(true)} style={{ flex: 1, background: '#1c1c1c', border: 'none', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666', position: 'relative', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <div style={{ position: 'absolute', top: 12, right: '50%', marginRight: '-8px', width: '8px', height: '8px', background: '#e63946', borderRadius: '50%' }} />
          </button>
        </div>

        `;

  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  fs.writeFileSync('src/pages/Game.jsx', code);
  console.log('Replaced successfully');
} else {
  console.log('Not found');
}
