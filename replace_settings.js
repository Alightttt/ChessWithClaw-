const fs = require('fs');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace settings
  const startStr = "{/* SETTINGS BOTTOM SHEET */}";
  const endStr = "      )}";
  
  const startIndex = content.indexOf(startStr);
  if (startIndex === -1) return;
  
  const nextEnd = content.indexOf(endStr, startIndex);
  if (nextEnd === -1) return;
  
  const closingBrace = nextEnd + endStr.length;

  const newSettings = `{/* SETTINGS BOTTOM SHEET */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pointerEvents: 'none' }}>
          <div 
            id="settings-sheet-backdrop"
            onClick={() => {
              const sheet = document.getElementById('settings-sheet-content');
              const backdrop = document.getElementById('settings-sheet-backdrop');
              if (sheet) sheet.style.animation = 'slideDown 220ms ease-in forwards';
              if (backdrop) backdrop.style.animation = 'fadeOut 220ms ease-in forwards';
              setTimeout(() => setShowSettings(false), 220);
            }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)', pointerEvents: 'auto', animation: 'fadeIn 200ms ease-out forwards' }} 
          />
          <div 
            id="settings-sheet-content"
            style={{ 
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
                onClick={() => {
                  const sheet = document.getElementById('settings-sheet-content');
                  const backdrop = document.getElementById('settings-sheet-backdrop');
                  if (sheet) sheet.style.animation = 'slideDown 220ms ease-in forwards';
                  if (backdrop) backdrop.style.animation = 'fadeOut 220ms ease-in forwards';
                  setTimeout(() => setShowSettings(false), 220);
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
                            const t = typeof agentToken !== 'undefined' ? agentToken : '';
                            fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': t }, body: JSON.stringify({ gameId, action: 'set_board_theme', value: theme.id }) }).catch(()=>{});
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
                            background: \`conic-gradient(\${theme.c1} 90deg, \${theme.c2} 90deg 180deg, \${theme.c1} 180deg 270deg, \${theme.c2} 270deg) 0 0 / 25px 25px\`
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
                            const t = typeof agentToken !== 'undefined' ? agentToken : '';
                            fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': t }, body: JSON.stringify({ gameId, action: 'set_piece_style', value: piece.id }) }).catch(()=>{});
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
                            const t = typeof agentToken !== 'undefined' ? agentToken : '';
                            await fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': t }, body: JSON.stringify({action: 'set_thought_language', value: lang.value, gameId}) });
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
                  onClick={(e) => {
                    navigator.clipboard.writeText(gameId);
                    const btn = e.currentTarget;
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
                    btn.style.color = 'white';
                    btn.style.borderColor = 'rgba(255,255,255,0.4)';
                    setTimeout(() => {
                      btn.innerHTML = originalHTML;
                      btn.style.color = 'rgba(242,242,242,0.5)';
                      btn.style.borderColor = '#2a2a2a';
                    }, 1500);
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
  
  content = content.substring(0, startIndex) + newSettings + content.substring(closingBrace);
  fs.writeFileSync(file, content);
}

processFile('src/pages/Game.jsx');
processFile('src/pages/Agent.jsx');

