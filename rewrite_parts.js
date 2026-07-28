const fs = require('fs');

function writeSettingsSheet() {
  return `      {/* SETTINGS BOTTOM SHEET */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pointerEvents: 'none' }}>
          <div 
            onClick={() => setShowSettings(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)', pointerEvents: 'auto', animation: 'fadeIn 200ms ease-out forwards' }} 
          />
          <div style={{ 
            background: '#0a0a0a', 
            width: '100%', 
            maxHeight: '85vh', 
            borderTopLeftRadius: '20px', 
            borderTopRightRadius: '20px', 
            pointerEvents: 'auto', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column',
            animation: 'slideUp 320ms cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '22px', fontWeight: 800, color: 'white' }}>Settings</span>
              <button 
                onClick={() => setShowSettings(false)}
                style={{ width: '36px', height: '36px', background: 'transparent', border: '1px solid transparent', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease', outline: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#e63946'; e.currentTarget.style.boxShadow = '0 0 8px rgba(230,57,70,0.4)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                onMouseDown={(e) => { e.currentTarget.style.borderColor = '#e63946'; e.currentTarget.style.boxShadow = '0 0 8px rgba(230,57,70,0.4)'; }}
                onMouseUp={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <XIcon size={24} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }} className="scrollbar-none">
              
              {/* PREFERENCES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 700, color: 'rgba(242,242,242,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  PREFERENCES
                </div>
                
                {/* Board Theme */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: 'white' }}>Board Theme</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {[
                      { id: 'green', c1: '#eeeed2', c2: '#769656' },
                      { id: 'brown', c1: '#f0d9b5', c2: '#b58863' },
                      { id: 'blue', c1: '#dee3e6', c2: '#8ca2ad' },
                      { id: 'red', c1: '#e8ecef', c2: '#c27a76' },
                      { id: 'icy_sea', c1: '#c4d7e2', c2: '#6d92a4' },
                      { id: 'tournament', c1: '#e0dfdb', c2: '#61855e' }
                    ].map(theme => {
                      const isSel = boardTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => {
                            setBoardTheme(theme.id);
                            localStorage.setItem('cwc_theme', theme.id);
                            fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': agentToken || '' }, body: JSON.stringify({ gameId, action: 'set_board_theme', value: theme.id }) }).catch(()=>{});
                            const btn = document.getElementById(\`theme-btn-\${theme.id}\`);
                            if(btn) {
                              btn.style.animation = 'none';
                              void btn.offsetWidth;
                              btn.style.animation = 'scalePulse 200ms ease-out';
                            }
                          }}
                          id={\`theme-btn-\${theme.id}\`}
                          style={{ 
                            position: 'relative', 
                            aspectRatio: '1', 
                            borderRadius: '12px', 
                            overflow: 'hidden', 
                            border: \`2px solid \${isSel ? '#e63946' : 'transparent'}\`, 
                            padding: 0, 
                            cursor: 'pointer',
                            background: \`conic-gradient(\${theme.c1} 90deg, \${theme.c2} 90deg 180deg, \${theme.c1} 180deg 270deg, \${theme.c2} 270deg) 0 0 / 25% 25%\`
                          }}
                        >
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isSel ? 1 : 0, transition: 'opacity 150ms ease' }}>
                            <Check size={28} color="white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Piece Style */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: 'white' }}>Piece Style</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {[
                      { id: 'neo', label: 'Neo' },
                      { id: 'tournament', label: 'Tournament' },
                      { id: 'ocean', label: 'Ocean' }
                    ].map((piece, idx) => {
                      const isSel = pieceTheme === piece.id;
                      return (
                        <button
                          key={piece.id}
                          onClick={() => {
                            setPieceTheme(piece.id);
                            localStorage.setItem('cwc_pieces', piece.id);
                            fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': agentToken || '' }, body: JSON.stringify({ gameId, action: 'set_piece_style', value: piece.id }) }).catch(()=>{});
                            const btn = document.getElementById(\`piece-btn-\${piece.id}\`);
                            if(btn) {
                              btn.style.animation = 'none';
                              void btn.offsetWidth;
                              btn.style.animation = 'scalePulse 200ms ease-out';
                            }
                          }}
                          id={\`piece-btn-\${piece.id}\`}
                          style={{ 
                            gridColumn: idx === 2 ? '1 / -1' : 'auto',
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px',
                            background: '#1a1a1a', 
                            borderRadius: '12px', 
                            padding: '16px', 
                            border: \`2px solid \${isSel ? '#e63946' : 'transparent'}\`, 
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ width: 48, height: 48 }}><WN pieceStyle={piece.id} /></div>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: 'white' }}>{piece.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sound Effects */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: 'white' }}>Sound Effects</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(242,242,242,0.5)' }}>Play sounds for moves and captures</span>
                  </div>
                  <button 
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      const btn = document.getElementById('sound-toggle-btn');
                      if(btn) {
                        btn.style.animation = 'none';
                        void btn.offsetWidth;
                        btn.style.animation = 'pressPulse 150ms ease-out';
                      }
                    }}
                    id="sound-toggle-btn"
                    style={{ 
                      width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
                      background: soundEnabled ? '#e63946' : '#2a2a2a',
                      transition: 'background 200ms ease'
                    }}
                  >
                    <div style={{ position: 'relative', width: 24, height: 24 }}>
                      <Volume2 size={24} color="white" style={{ position: 'absolute', inset: 0, opacity: soundEnabled ? 1 : 0, transition: 'opacity 200ms ease' }} />
                      <VolumeX size={24} color="white" style={{ position: 'absolute', inset: 0, opacity: !soundEnabled ? 1 : 0, transition: 'opacity 200ms ease' }} />
                    </div>
                  </button>
                </div>

                {/* Agent Thoughts Language */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: 'white' }}>Agent Thoughts Language</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {[
                      { value: 'english', label: 'English' },
                      { value: 'hindi', label: 'Hindi' },
                      { value: 'hinglish', label: 'Hinglish' },
                      { value: 'simple_english', label: 'Simple English' }
                    ].map(lang => {
                      const isSel = thoughtLanguage === lang.value;
                      return (
                        <button
                          key={lang.value}
                          onClick={async () => {
                            setThoughtLanguage(lang.value);
                            await fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': agentToken }, body: JSON.stringify({action: 'update', data: { thought_language: lang.value }, gameId}) });
                            const btn = document.getElementById(\`lang-btn-\${lang.value}\`);
                            if(btn) {
                              btn.style.animation = 'none';
                              void btn.offsetWidth;
                              btn.style.animation = 'scalePulse 200ms ease-out';
                            }
                          }}
                          id={\`lang-btn-\${lang.value}\`}
                          style={{ 
                            background: '#1a1a1a', 
                            borderRadius: '12px', 
                            padding: '16px', 
                            border: \`2px solid \${isSel ? '#e63946' : 'transparent'}\`, 
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: 'white',
                            textAlign: 'center'
                          }}
                        >
                          {lang.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)' }} />

              {/* GAME ID */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: 'white' }}>Game ID</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(gameId);
                    // could show toast here
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px', color: 'rgba(242,242,242,0.5)' }}
                >
                  <Copy size={14} />
                  {gameId.slice(0,8)}...
                </button>
              </div>

              <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)' }} />

              {/* GAME CONTROLS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 700, color: 'rgba(242,242,242,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  GAME CONTROLS
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={handleDraw}
                    disabled={game?.status === 'finished' || game?.status === 'abandoned'}
                    style={{ flex: 1, height: '48px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontFamily: "'Inter', sans-serif", fontSize: '15px', fontWeight: 600, color: 'white', cursor: 'pointer', opacity: (game?.status === 'finished' || game?.status === 'abandoned') ? 0.5 : 1 }}
                  >
                    Offer Draw
                  </button>
                  <button 
                    onClick={handleResign}
                    disabled={game?.status === 'finished' || game?.status === 'abandoned'}
                    style={{ flex: 1, height: '48px', background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'Inter', sans-serif", fontSize: '15px', fontWeight: 600, color: '#e63946', cursor: 'pointer', opacity: (game?.status === 'finished' || game?.status === 'abandoned') ? 0.5 : 1 }}
                  >
                    <Flag size={18} />
                    Resign
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}`;
}

function writeChatOverlay() {
  return `      {/* CHAT FULL-SCREEN OVERLAY */}
      {chatMobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
          <div style={{ 
            background: '#0a0a0a', 
            position: 'absolute', 
            inset: 0, 
            pointerEvents: 'auto', 
            display: 'flex', 
            flexDirection: 'column',
            animation: 'slideRight 280ms cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 700, color: 'white' }}>Chat with {agentName}</span>
              <button 
                onClick={() => setChatMobileOpen(false)} 
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
                placeholder={\`Message \${agentName}...\`}
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
      )}`;
}

let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// 1) Replace Settings Modal
const sStart = code.indexOf('{/* SETTINGS MODAL (Untouched) */}');
const sEnd = code.indexOf('</Modal>', sStart);
if (sStart !== -1 && sEnd !== -1) {
  code = code.substring(0, sStart) + writeSettingsSheet() + code.substring(sEnd + 8);
}

// 2) Replace Chat Mobile Modal
const cStart = code.indexOf('{chatMobileOpen && (');
const cEnd = code.indexOf(')}', cStart + 1500); // just grab a chunk
if (cStart !== -1) {
  // Let's use string replace for this specific block since it's exact:
  const targetStr = code.substring(cStart, code.indexOf(')}', code.indexOf('</form>', cStart)) + 2);
  if (targetStr.includes('form')) {
    code = code.replace(targetStr, writeChatOverlay().replace('      {/* CHAT FULL-SCREEN OVERLAY */}\n      ', ''));
  }
}

// 3) Append keyframes for new animations
const kStart = code.indexOf('<style dangerouslySetInnerHTML={{__html: `');
if (kStart !== -1) {
  const animations = `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes scalePulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        @keyframes pressPulse { 0% { transform: scale(1); } 50% { transform: scale(0.94); } 100% { transform: scale(1); } }
  `;
  code = code.substring(0, kStart + 43) + animations + code.substring(kStart + 43);
}

fs.writeFileSync('src/pages/Game.jsx', code);
console.log('Replacements complete');
