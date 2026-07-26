const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

const target = `        {/* C) YOU CARD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#0e0e0e', borderTop: '1px solid #111' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)', border: '1px solid #333', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            ♙
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: '#f2f2f2' }}>You</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#666' }}>
              {game?.turn === (game?.player_color || 'w') ? 'your turn' : 'waiting'}
            </span>
          </div>
          {(youCaptured.length > 0 || youAdvantage > 0) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '16px', color: 'white' }}>
              {youCaptured.map((p, i) => (
                <span key={i} style={{ marginLeft: '-4px' }}>
                  {game?.player_color === 'w' ? blackPieceMap[p] : whitePieceMap[p]}
                </span>
              ))}
              {youAdvantage > 0 && <span style={{ fontSize: '12px', color: '#888', marginLeft: '4px', fontWeight: 'bold' }}>+{youAdvantage}</span>}
            </div>
          )}
        </div>
            

        {/* D) CHAT SECTION */}
        <div style={{ flexShrink: 0, height: '180px', display: 'flex', flexDirection: 'column', padding: '0', borderTop: '1px solid #111111', background: '#0a0a0a' }}>
          <div style={{ flexShrink: 0, padding: '10px 12px', fontFamily: "'Inter', sans-serif", fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(242,242,242,0.3)' }}>
            CHAT WITH {agentName.toUpperCase()}
          </div>
          <div ref={chatMessagesRef} style={{ flex: 1, overflowY: 'auto', padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="scrollbar-none scroll-smooth">
            {normalizedMessages.length === 0 ? (
              <div style={{ color: '#2a2a2a', fontSize: '13px', textAlign: 'center', margin: 'auto', fontFamily: "'Inter', sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px" }}>
                <span style={{ fontSize: '24px' }}><LobsterEmoji /></span>
                <span>{agentName} can chat while playing</span>
              </div>
            ) : (
              renderChatMessages()
            )}
          </div>
          <form 
            onSubmit={sendMessage} 
            style={{ padding: '6px 12px', borderTop: '1px solid #111', display: 'flex', alignItems: 'center', gap: '8px', height: '44px', boxSizing: 'border-box' }}
          >
            <input
              id="chat-input"
              data-testid="chat-input"
              type="text"
              value={chatInput}
              onChange={handleChatInputChange}
              placeholder={isSpectator ? "Spectating..." : \`Message \${agentName}...\`}
              disabled={isSpectator}
              style={{ flex: 1, height: '34px', background: '#080808', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f2f2f2', fontFamily: "'Inter', sans-serif", fontSize: '13px', padding: '0 10px', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = '#e63946'; e.target.style.boxShadow = 'rgba(0,0,0,0.08) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.16) 0px -0.5px 0px 0px inset, #e63946 0px 0px 0px 1px inset'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
            />
            <button 
              data-testid="chat-send"
              type="submit"
              disabled={isSpectator || !chatInput.trim()}
              style={{ width: '34px', height: '34px', background: (!isSpectator && chatInput.trim()) ? '#e63946' : 'rgba(230,57,70,0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (!isSpectator && chatInput.trim()) ? 'pointer' : 'default', border: 'none', color: 'white', flexShrink: 0, boxShadow: (!isSpectator && chatInput.trim()) ? 'rgba(255,255,255,0.15) 0px 1px 0px 0px inset, rgba(0,0,0,0.4) 0px -0.5px 0px 0px inset', transition: 'all 0.1s ease' }}
              onMouseDown={(e) => { if(!isSpectator && chatInput.trim()) { e.currentTarget.style.transform = 'scale(0.92)'; } }}
              onMouseUp={(e) => { if(!isSpectator && chatInput.trim()) { e.currentTarget.style.transform = 'scale(1)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>`;

const replaceWith = `        {/* C) MOBILE BUTTONS */}
        <div style={{ display: 'flex', gap: '12px', padding: '12px 16px', background: 'transparent', flexShrink: 0, justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{ flex: 1, background: '#333333', border: 'none', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.44l5.46 5.46"/></svg>
          </button>
          <button onClick={() => setChatMobileOpen(true)} style={{ flex: 1, background: '#333333', border: 'none', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888', position: 'relative' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <div style={{ position: 'absolute', top: 12, right: '50%', marginRight: '-8px', width: '8px', height: '8px', background: '#e63946', borderRadius: '50%' }} />
          </button>
        </div>`;

code = code.replace(target, replaceWith);
fs.writeFileSync('src/pages/Game.jsx', code);
