const fs = require('fs');

function fixMess(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Let's find the duplicate form which caused the parsing error
  const duplicateStart = `            </div>
            
            <form 
              onSubmit={(e) => { 
                sendMessage(e);`;
  
  if (content.includes(duplicateStart)) {
      console.log('Found duplicate in ' + file);
      // Wait, let's just find the first `{chatMobileOpen && (` and completely remove everything until `      <style dangerouslySetInnerHTML={{__html: \``
      const startChat = "{chatMobileOpen && (";
      const endChatStyle = "      <style dangerouslySetInnerHTML";
      
      const idx1 = content.indexOf(startChat);
      const idx2 = content.indexOf(endChatStyle);
      
      if (idx1 !== -1 && idx2 !== -1) {
          const newChat = `{chatMobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pointerEvents: 'none' }}>
          <div 
            id="chat-sheet-backdrop"
            onClick={() => {
              const sheet = document.getElementById('chat-sheet-content');
              const backdrop = document.getElementById('chat-sheet-backdrop');
              if (sheet) sheet.style.animation = 'slideOutRight 220ms ease-in forwards';
              if (backdrop) backdrop.style.animation = 'fadeOut 220ms ease-in forwards';
              setTimeout(() => setChatMobileOpen(false), 220);
            }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)', pointerEvents: 'auto', animation: 'fadeIn 200ms ease-out forwards' }} 
          />
          <div 
            id="chat-sheet-content"
            style={{ 
            background: '#0a0a0a', 
            width: '100%', 
            height: '65vh', 
            borderTopLeftRadius: '20px', 
            borderTopRightRadius: '20px', 
            pointerEvents: 'auto', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column',
            animation: 'slideUp 280ms cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 700, color: 'white' }}>Chat with {agentName || 'Your Agent'}</span>
              <button 
                onClick={() => {
                  const sheet = document.getElementById('chat-sheet-content');
                  const backdrop = document.getElementById('chat-sheet-backdrop');
                  if (sheet) sheet.style.animation = 'slideOutRight 220ms ease-in forwards';
                  if (backdrop) backdrop.style.animation = 'fadeOut 220ms ease-in forwards';
                  setTimeout(() => setChatMobileOpen(false), 220);
                }} 
                style={{ width: '36px', height: '36px', background: 'transparent', border: '1px solid transparent', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease', outline: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#e63946'; e.currentTarget.style.boxShadow = '0 0 8px rgba(230,57,70,0.4)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                onMouseDown={(e) => { e.currentTarget.style.borderColor = '#e63946'; e.currentTarget.style.boxShadow = '0 0 8px rgba(230,57,70,0.4)'; }}
                onMouseUp={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <XIcon size={24} />
              </button>
            </div>
            
            <div ref={chatMessagesRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="scrollbar-none">
              {normalizedMessages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(242,242,242,0.4)' }}>Your Agent can chat while playing</span>
                </div>
              ) : (
                renderChatMessages()
              )}
            </div>
            
            <form 
              onSubmit={(e) => { 
                sendMessage(e); 
                const btn = document.getElementById('chat-send-overlay');
                if(btn) {
                  btn.style.animation = 'none';
                  void btn.offsetWidth;
                  btn.style.animation = 'pressPulse 150ms ease-out';
                }
              }} 
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={handleChatInputChange}
                placeholder={\`Message \${agentName || 'Your Agent'}...\`}
                style={{ flex: 1, height: '48px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '24px', color: 'white', padding: '0 20px', fontSize: '15px', outline: 'none', fontFamily: "'Inter', sans-serif" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#e63946'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2a2a'; }}
              />
              <button 
                id="chat-send-overlay"
                type="submit"
                disabled={!chatInput.trim()}
                style={{ width: '48px', height: '48px', background: chatInput.trim() ? '#e63946' : '#2a2a2a', borderRadius: '50%', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 150ms ease' }}
              >
                <Send size={20} style={{ transform: 'translateX(-1px)' }} />
              </button>
            </form>
          </div>
        </div>
      )}

`;
          content = content.substring(0, idx1) + newChat + content.substring(idx2);
          fs.writeFileSync(file, content);
      }
  }
}

fixMess('src/pages/Game.jsx');
fixMess('src/pages/Agent.jsx');
