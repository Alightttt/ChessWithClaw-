const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// I accidentally removed the contents of the if condition for mobile chat drawer, leaving nothing.
const oldSyntax = `{normalizedMessages.length === 0 ? (
                    
                  ) : (
                    renderChatMessages()
                  )}`;
                  
const newSyntax = `{normalizedMessages.length === 0 ? (
                    <div style={{ color: '#2a2a2a', fontSize: '13px', textAlign: 'center', margin: 'auto', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '24px' }}><LobsterEmoji /></span>
                      <span>{agentName} can chat while playing</span>
                    </div>
                  ) : (
                    renderChatMessages()
                  )}`;

code = code.replace(oldSyntax, newSyntax);
fs.writeFileSync('src/pages/Game.jsx', code);
console.log('Fixed syntax error.');
