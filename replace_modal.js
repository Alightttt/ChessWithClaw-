const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

const target = `      </Modal>`;
const replacement = `      </Modal>

      {chatMobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #1a1a1a' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: 'white' }}>Chat with {agentName}</span>
            <button onClick={() => setChatMobileOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white' }}>
              <XIcon size={20} />
            </button>
          </div>
          <div ref={chatMessagesRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {normalizedMessages.length === 0 ? (
              <div style={{ color: '#2a2a2a', fontSize: '13px', textAlign: 'center', margin: 'auto', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>💬</span>
                <span>{agentName} can chat while playing</span>
              </div>
            ) : (
              renderChatMessages()
            )}
          </div>
          <form 
            onSubmit={(e) => { sendMessage(e); setChatMobileOpen(false); }} 
            style={{ padding: '12px 16px', borderTop: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '8px', background: '#111111' }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={handleChatInputChange}
              placeholder={\`Message \${agentName}...\`}
              style={{ flex: 1, height: '40px', background: '#1a1a1a', border: 'none', borderRadius: '20px', color: 'white', padding: '0 16px', fontSize: '14px', outline: 'none' }}
            />
            <button 
              type="submit"
              disabled={!chatInput.trim()}
              style={{ width: '40px', height: '40px', background: chatInput.trim() ? '#e63946' : '#2a2a2a', borderRadius: '50%', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Game.jsx', code);
