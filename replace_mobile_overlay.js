const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// The mobile overlay container:
const oldOverlayContainer = `<div style={{ background: '#2c2826', display: 'flex', flexDirection: 'column', position: 'absolute', left: 0, right: 0, bottom: '100%', zIndex: 40, boxShadow: (moveHistoryOpen || chatMobileOpen) ? '0 -8px 24px rgba(0,0,0,0.35)' : 'none' }}>`;

const newOverlayContainer = `<div style={{ background: '#221f1e', display: 'flex', flexDirection: 'column', position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 50, boxShadow: (moveHistoryOpen || chatMobileOpen) ? '0 -8px 24px rgba(0,0,0,0.35)' : 'none', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>`;

code = code.replace(oldOverlayContainer, newOverlayContainer);

// 1. Fix Move History drawer header and height
code = code.replace(
  /height: moveHistoryOpen \? Math.min\(\(moveHistoryScrollRef.current\?\.scrollHeight \|\| 240\) \+ 44, 280\) \+ 'px' : '0px',/g,
  "height: moveHistoryOpen ? '50vh' : '0px',"
);
code = code.replace(
  /<div \n                  onClick=\{.*?setMoveHistoryOpen\(\!moveHistoryOpen\)\}\n                  style=\{\{ minHeight: '44px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', zIndex: 2 \}\}\n                >\n                  <span style=\{\{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600, color: 'rgba\(255,255,255,0.9\)', margin: '0 auto', textTransform: 'uppercase', letterSpacing: '0.05em' \}\}>Move history<\/span>\n                  <ChevronDown size=\{18\} color="rgba\(255,255,255,0.5\)" style=\{\{ transform: moveHistoryOpen \? 'rotate\(0deg\)' : 'rotate\(180deg\)', transition: 'transform 0.3s' \}\} \/>\n                <\/div>/g,
  `<div 
                  onClick={() => setMoveHistoryOpen(!moveHistoryOpen)}
                  style={{ minHeight: '48px', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', zIndex: 2, background: '#2c2826', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Move history</span>
                  <ChevronDown size={20} color="rgba(255,255,255,0.7)" style={{ transform: moveHistoryOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
                </div>`
);

// 2. Fix Chat Drawer height and header
code = code.replace(
  /height: chatMobileOpen \? '280px' : '0px',/g,
  "height: chatMobileOpen ? '50vh' : '0px',"
);

// Add Chat Header
const oldChatDrawerStart = `              {/* CHAT DRAWER */}
              <div style={{
                height: chatMobileOpen ? '50vh' : '0px',
                transition: 'height 280ms ease-out',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>`;
const newChatDrawerStart = `              {/* CHAT DRAWER */}
              <div style={{
                height: chatMobileOpen ? '50vh' : '0px',
                transition: 'height 280ms ease-out',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div 
                  onClick={() => setChatMobileOpen(!chatMobileOpen)}
                  style={{ minHeight: '48px', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', zIndex: 2, background: '#2c2826', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Chat with {agentName}</span>
                  <ChevronDown size={20} color="rgba(255,255,255,0.7)" style={{ transform: chatMobileOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
                </div>`;
code = code.replace(oldChatDrawerStart, newChatDrawerStart);

// Remove the inline chat emoji title
code = code.replace(
  /<div style=\{\{ color: '#2a2a2a', fontSize: '13px', textAlign: 'center', margin: 'auto', fontFamily: "'Inter', sans-serif'", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' \}\}>\n\s*<span style=\{\{ fontSize: '24px' \}\}><LobsterEmoji \/><\/span>\n\s*<span>\{agentName\} can chat while playing<\/span>\n\s*<\/div>/g,
  ""
);

fs.writeFileSync('src/pages/Game.jsx', code);
console.log('Successfully updated mobile overlays.');
