const fs = require('fs');
let content = fs.readFileSync('src/pages/Game.jsx', 'utf-8');

const targetBanner = `              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, minWidth: 0, paddingTop: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(230,57,70,0.12)',
                  border: '1px solid rgba(230,57,70,0.4)',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  animation: 'pulseAlert 2s ease-in-out infinite',
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#e63946',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 'bold', lineHeight: 1 }}>!</span>
                  </div>
                  <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, sans-serif', lineHeight: 1.2 }}>
                    Invite your Agent first
                  </span>
                </div>
              </div>`;

const replacementBanner = `              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, minWidth: 0, paddingTop: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#e63946',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  boxShadow: '0 4px 12px rgba(230,57,70,0.3)',
                  animation: 'pulseAlert 2s ease-in-out infinite',
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #fbbf24',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 'bold', lineHeight: 1 }}>!</span>
                  </div>
                  <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, sans-serif', lineHeight: 1.2 }}>
                    Invite your {agentName || 'Agent'} first
                  </span>
                </div>
              </div>`;

content = content.replace(targetBanner, replacementBanner);
fs.writeFileSync('src/pages/Game.jsx', content);
console.log('Done banner');
