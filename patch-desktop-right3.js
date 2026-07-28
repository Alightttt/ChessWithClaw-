const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

const startStr = "{/* RIGHT DESKTOP COLUMN */}";
const endStr = "\n      ) : (";

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  // get the part from start to end
  const before = code.substring(0, startIdx);
  const after = code.substring(endIdx);
  
  const newDesktopRight = `
          {/* RIGHT DESKTOP COLUMN */}
          <div style={{ width: '40%', minWidth: '380px', display: 'flex', flexDirection: 'column', padding: '12px 16px 12px 8px', gap: '8px', overflow: 'hidden', minHeight: 0 }}>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button style={{ flex: 1, background: '#1c1c1c', border: 'none', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.44l5.46 5.46"/></svg>
              </button>
              <button onClick={() => setChatMobileOpen(true)} style={{ flex: 1, background: '#1c1c1c', border: 'none', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666', position: 'relative', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <div style={{ position: 'absolute', top: 12, right: '50%', marginRight: '-8px', width: '8px', height: '8px', background: '#e63946', borderRadius: '50%' }} />
              </button>
            </div>
            
            {/* MOVE HISTORY (Always Expanded on Desktop) */}
            <div style={{ background: '#111111', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden', height: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0 12px', height: '36px', borderBottom: '1px solid #1a1a1a', background: '#161616', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(242,242,242,0.3)' }}>
                  MOVE HISTORY · {game.move_history?.length || 0} MOVES
                </span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }} className="scrollbar-none">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: '8px', paddingBottom: '4px', borderBottom: '1px solid #111', marginBottom: '4px' }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'rgba(242,242,242,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>#</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'rgba(242,242,242,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>You</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'rgba(242,242,242,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>{agentName}</div>
                  </div>
                  {Array.from({ length: Math.ceil((game.move_history || []).length / 2) }).map((_, i) => {
                    const youMove = game.player_color === 'b' ? game.move_history[i * 2 + 1] : game.move_history[i * 2];
                    const agentMove = game.player_color === 'b' ? game.move_history[i * 2] : game.move_history[i * 2 + 1];
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: '8px', padding: '3px 0', fontFamily: "'Inter', sans-serif", fontSize: '12px' }}>
                        <div style={{ color: 'rgba(242,242,242,0.25)' }}>{i + 1}.</div>
                        <div style={{ color: '#f2f2f2', display:'flex', alignItems:'center', gap:4 }}>
                          {youMove?.san && (() => {
                            const { letter, rest } = sanToPieceImg(youMove.san, true, pieceTheme);
                            return (
                              <>
                                <img src={pieceImgUrl(letter, true, pieceTheme)} alt="" style={{width:15,height:15,objectFit:'contain'}}
                                  onError={(e)=>{ if(!e.target.dataset.fb){e.target.dataset.fb='1'; e.target.src=\`https://lichess1.org/assets/piece/cburnett/w\${letter}.svg\`;} }}
                                />
                                <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:13}}>{rest}</span>
                              </>
                            );
                          })()}
                        </div>
                        <div style={{ color: '#e63946', display:'flex', alignItems:'center', gap:4 }}>
                          {agentMove?.san && (() => {
                            const { letter, rest } = sanToPieceImg(agentMove.san, false, pieceTheme);
                            return (
                              <>
                                <img src={pieceImgUrl(letter, false, pieceTheme)} alt="" style={{width:15,height:15,objectFit:'contain'}}
                                  onError={(e)=>{ if(!e.target.dataset.fb){e.target.dataset.fb='1'; e.target.src=\`https://lichess1.org/assets/piece/cburnett/b\${letter}.svg\`;} }}
                                />
                                <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:13}}>{rest}</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CHAT SECTION */}
            <div style={{ flexShrink: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '0', borderTop: 'none', background: '#111111', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ flexShrink: 0, padding: '10px 12px', fontFamily: "'Inter', sans-serif", fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(242,242,242,0.3)' }}>
                CHAT WITH {agentName.toUpperCase()}
              </div>
              <div ref={chatMessagesRef} style={{ flex: 1, overflowY: 'auto', padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="scrollbar-none scroll-smooth">
                {normalizedMessages.length === 0 ? (
                  <div style={{ color: '#2a2a2a', fontSize: '13px', textAlign: 'center', margin: 'auto', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
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
                  style={{ width: '34px', height: '34px', background: (!isSpectator && chatInput.trim()) ? '#e63946' : 'rgba(230,57,70,0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (!isSpectator && chatInput.trim()) ? 'pointer' : 'default', border: 'none', color: 'white', flexShrink: 0, boxShadow: (!isSpectator && chatInput.trim()) ? 'rgba(255,255,255,0.15) 0px 1px 0px 0px inset, rgba(0,0,0,0.4) 0px -0.5px 0px 0px inset' : 'none', transition: 'all 0.1s ease' }}
                  onMouseDown={(e) => { if(!isSpectator && chatInput.trim()) { e.currentTarget.style.transform = 'scale(0.92)'; } }}
                  onMouseUp={(e) => { if(!isSpectator && chatInput.trim()) { e.currentTarget.style.transform = 'scale(1)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>`;
  fs.writeFileSync('src/pages/Game.jsx', before + newDesktopRight + after);
  console.log("Successfully replaced Desktop Right!");
} else {
  console.log("Failed to find boundaries");
}
