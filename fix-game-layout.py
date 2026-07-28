import re

with open('src/pages/Game.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_tag = "{/* RIGHT DESKTOP COLUMN */}"
end_tag = "{/* STATUS BAR */}"

start_idx = code.find(start_tag)
end_idx = code.find(end_tag, start_idx)

if start_idx != -1 and end_idx != -1:
    new_jsx = """{/* RIGHT DESKTOP COLUMN */}
          <div style={{ width: '40%', minWidth: '380px', display: 'flex', flexDirection: 'column', padding: '12px 16px 12px 8px', gap: '8px', overflow: 'hidden', minHeight: 0 }}>
            
            {/* ACTION BUTTONS (Desktop) */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button style={{ flex: 1, background: '#1c1c1c', border: 'none', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.44l5.46 5.46"/></svg>
              </button>
              <button onClick={() => setChatMobileOpen(true)} style={{ flex: 1, background: '#1c1c1c', border: 'none', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666', position: 'relative', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <div style={{ position: 'absolute', top: 10, right: '50%', marginRight: '-8px', width: '6px', height: '6px', background: '#e63946', borderRadius: '50%' }} />
              </button>
            </div>
            
            {/* MOVE HISTORY (Desktop) */}
            <div style={{ background: '#111111', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden', height: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0 12px', height: '36px', borderBottom: '1px solid #1a1a1a', background: '#161616', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(242,242,242,0.3)', letterSpacing: '0.08em' }}>
                  MOVE HISTORY · {game?.move_history?.length || 0} MOVES
                </span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }} className="scrollbar-none">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: '8px', paddingBottom: '4px', borderBottom: '1px solid #111', marginBottom: '4px' }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'rgba(242,242,242,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>#</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'rgba(242,242,242,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>You</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'rgba(242,242,242,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>{agentName}</div>
                  </div>
                  {Array.from({ length: Math.ceil((game?.move_history || []).length / 2) }).map((_, i) => {
                    const youMove = game?.player_color === 'b' ? game.move_history[i * 2 + 1] : game.move_history[i * 2];
                    const agentMove = game?.player_color === 'b' ? game.move_history[i * 2] : game.move_history[i * 2 + 1];
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: '8px', padding: '3px 0', fontFamily: "'Inter', sans-serif", fontSize: '12px' }}>
                        <div style={{ color: 'rgba(242,242,242,0.25)' }}>{i + 1}.</div>
                        <div style={{ color: '#f2f2f2', display:'flex', alignItems:'center', gap:4 }}>
                          {youMove?.san && (() => {
                            const { letter, rest } = sanToPieceImg(youMove.san, true, pieceTheme);
                            return (
                              <>
                                <img src={pieceImgUrl(letter, true, pieceTheme)} alt="" style={{width:15,height:15,objectFit:'contain'}}
                                  onError={(e)=>{ if(!e.target.dataset.fb){e.target.dataset.fb='1'; e.target.src=`https://lichess1.org/assets/piece/cburnett/w${letter}.svg`;} }}
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
                                  onError={(e)=>{ if(!e.target.dataset.fb){e.target.dataset.fb='1'; e.target.src=`https://lichess1.org/assets/piece/cburnett/b${letter}.svg`;} }}
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

            {/* CHAT SECTION (Desktop) */}
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
              <form onSubmit={sendMessage} style={{ padding: '6px 12px', borderTop: '1px solid #111', display: 'flex', alignItems: 'center', gap: '8px', height: '44px', boxSizing: 'border-box' }}>
                <input id="chat-input" type="text" value={chatInput} onChange={handleChatInputChange} placeholder={isSpectator ? "Spectating..." : `Message ${agentName}...`} disabled={isSpectator} style={{ flex: 1, height: '34px', background: '#080808', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f2f2f2', fontFamily: "'Inter', sans-serif", fontSize: '13px', padding: '0 10px', outline: 'none', boxSizing: 'border-box' }} />
                <button type="submit" disabled={isSpectator || !chatInput.trim()} style={{ width: '34px', height: '34px', background: (!isSpectator && chatInput.trim()) ? '#e63946' : 'rgba(230,57,70,0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (!isSpectator && chatInput.trim()) ? 'pointer' : 'default', border: 'none', color: 'white', flexShrink: 0 }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* MOBILE LAYOUT */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            
            {/* AGENT CARD (Mobile) */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', position: 'relative', flexShrink: 0 }}>
              {!agentConnected ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, position: 'relative' }}>
                    <span style={{ fontSize: '56px', lineHeight: 1, userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🦞</span>
                    <div style={{ background: '#111111', border: '1.5px solid rgba(230,57,70,0.5)', borderRadius: '9999px', padding: '4px 10px', color: 'rgba(242,242,242,0.6)', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, maxWidth: '90px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {game?.agent_name && game?.agent_name !== 'Your Agent' ? game.agent_name : 'Your Agent'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, minWidth: 0, paddingTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.4)', borderRadius: '14px', padding: '12px 16px' }}>
                      <div style={{ width: '20px', height: '20px', background: '#fbbf24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 'bold', lineHeight: 1 }}>!</span></div>
                      <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Invite your Agent first</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, position: 'relative' }}>
                    <span style={{ fontSize: '56px', lineHeight: 1, userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: emojiAnimating ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>{displayedEmoji}</span>
                    <button onClick={(e) => { e.stopPropagation(); setShowStatusPopover(prev => !prev); }} style={{ background: '#111111', border: `1.5px solid ${presenceColor}`, borderRadius: '9999px', padding: '4px 10px', color: '#f2f2f2', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, cursor: 'pointer', maxWidth: '90px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', outline: 'none' }}>
                      {game?.agent_name && game?.agent_name !== 'Your Agent' ? game.agent_name : 'Your Agent'}
                    </button>
                    {showStatusPopover && (
                      <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#f2f2f2', zIndex: 100, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: presenceColor }}>{statusLabel}</span>
                        <span style={{ color: 'rgba(242,242,242,0.6)', fontSize: '11px' }}>{getAgentLastSeenText()}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1, minWidth: 0, paddingTop: '8px' }}>
                    {previousThoughtText && ( <CloudBubble isPrevious={true}>{previousThoughtText}</CloudBubble> )}
                    {thoughtText && thoughtVisible && ( <CloudBubble isPrevious={false}>{thoughtText}</CloudBubble> )}
                  </div>
                </>
              )}
            </div>

            {/* CHESS BOARD (Mobile) */}
            <div style={{ width: '100%', flex: 1, minHeight: 0, position: 'relative', padding: '12px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {game?.in_check && game.status === 'active' && (
                <div style={{ background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)', borderRadius: '8px', padding: '6px 12px', marginBottom: '8px', color: '#e63946', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600, textAlign: 'center', flexShrink: 0 }}>⚠️ Check!</div>
              )}
              <div style={{ width: '100%', maxHeight: '100%', aspectRatio: '1/1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: "4px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", position: "relative", transition: "box-shadow 0.8s ease" }}>
                  <ChessBoard fen={optimisticFen || game.fen} showCoordinates={false} onMove={makeMove} isMyTurn={isMyTurn} lastMove={lastMoveHighlight || optimisticLastMove || (game.move_history || [])[(game.move_history || [])?.length - 1] || null} arrivedSquare={arrivedSquare} moveHistory={game.move_history || []} boardTheme={boardTheme} pieceTheme={pieceTheme} playerColor={game?.player_color || 'w'} onIllegalMove={handleIllegalMove} onCapture={handleCapture} />
                </div>
              </div>
              <CapturedPiecesRow byWhite={getCapturedPieces(game?.fen).byWhite} byBlack={getCapturedPieces(game?.fen).byBlack} pieceTheme={pieceTheme} humanColor={game?.player_color || 'w'} />
              {(game.status === 'finished' || game.status === 'abandoned') && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center pointer-events-none">
                  <div className="font-sans text-[32px] font-bold text-white tracking-widest drop-shadow-md">{game.status === 'abandoned' ? 'GAME ABANDONED' : 'GAME OVER'}</div>
                  <div className="font-sans text-sm text-red-500 mt-1 font-bold tracking-wide">{game?.status === 'abandoned' ? 'Game expired due to inactivity' : (game?.result === 'draw' ? 'Draw by ' + game?.result_reason : (game?.winner === (game?.player_color === 'b' ? 'white' : 'black') ? 'You won by ' : agentName + ' won by ') + game?.result_reason)}</div>
                </div>
              )}
            </div>
            
            {/* MOBILE BUTTONS */}
            <div style={{ display: 'flex', gap: '12px', padding: '12px 16px', background: 'transparent', flexShrink: 0, justifyContent: 'space-between', alignItems: 'center' }}>
              <button style={{ flex: 1, background: '#1c1c1c', border: 'none', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.44l5.46 5.46"/></svg>
              </button>
              <button onClick={() => setChatMobileOpen(true)} style={{ flex: 1, background: '#1c1c1c', border: 'none', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666', position: 'relative', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <div style={{ position: 'absolute', top: 12, right: '50%', marginRight: '-8px', width: '8px', height: '8px', background: '#e63946', borderRadius: '50%' }} />
              </button>
            </div>

            {/* MOVE HISTORY (Mobile) */}
            <div style={{ background: '#0a0a0a', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'relative' }}>
              <div 
                onClick={() => setMoveHistoryOpen(!moveHistoryOpen)}
                style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', zIndex: 2 }}
              >
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(242,242,242,0.4)', letterSpacing: '0.08em' }}>
                  MOVE HISTORY · {game.move_history?.length || 0} MOVES
                </span>
                <ChevronDown size={16} className="text-neutral-500" style={{ transform: moveHistoryOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 280ms ease-out' }} />
              </div>
              <div style={{ 
                height: moveHistoryOpen ? Math.min((moveHistoryScrollRef.current?.scrollHeight || 240), 240) + 'px' : '0px',
                transition: 'height 280ms ease-out',
                overflow: 'hidden'
              }}>
                <div 
                  ref={moveHistoryScrollRef}
                  style={{ 
                    maxHeight: '240px', 
                    overflowY: 'auto', 
                    padding: '0 16px 16px', 
                    opacity: moveHistoryOpen ? 1 : 0, 
                    transition: moveHistoryOpen ? 'opacity 140ms ease-out 140ms' : 'opacity 140ms ease-out 0ms',
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '2px'
                  }} 
                  className="scrollbar-none"
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: '8px', paddingBottom: '6px', borderBottom: '1px solid #1a1a1a', marginBottom: '4px' }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'rgba(242,242,242,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>#</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'rgba(242,242,242,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>You</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'rgba(242,242,242,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>{agentName}</div>
                    </div>
                    {Array.from({ length: Math.ceil((game.move_history || []).length / 2) }).map((_, i) => {
                      const youMove = game.player_color === 'b' ? game.move_history[i * 2 + 1] : game.move_history[i * 2];
                      const agentMove = game.player_color === 'b' ? game.move_history[i * 2] : game.move_history[i * 2 + 1];
                      return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: '8px', padding: '4px 0', fontFamily: "'Inter', sans-serif", fontSize: '13px' }}>
                          <div style={{ color: 'rgba(242,242,242,0.25)' }}>{i + 1}.</div>
                          <div style={{ color: '#f2f2f2', display:'flex', alignItems:'center', gap:6 }}>
                            {youMove?.san && (() => {
                              const { letter, rest } = sanToPieceImg(youMove.san, true, pieceTheme);
                              return (
                                <>
                                  <img src={pieceImgUrl(letter, true, pieceTheme)} alt="" style={{width:16,height:16,objectFit:'contain'}}
                                    onError={(e)=>{ if(!e.target.dataset.fb){e.target.dataset.fb='1'; e.target.src=`https://lichess1.org/assets/piece/cburnett/w${letter}.svg`;} }}
                                  />
                                  <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:14}}>{rest}</span>
                                </>
                              );
                            })()}
                          </div>
                          <div style={{ color: '#e63946', display:'flex', alignItems:'center', gap:6 }}>
                            {agentMove?.san && (() => {
                              const { letter, rest } = sanToPieceImg(agentMove.san, false, pieceTheme);
                              return (
                                <>
                                  <img src={pieceImgUrl(letter, false, pieceTheme)} alt="" style={{width:16,height:16,objectFit:'contain'}}
                                    onError={(e)=>{ if(!e.target.dataset.fb){e.target.dataset.fb='1'; e.target.src=`https://lichess1.org/assets/piece/cburnett/b${letter}.svg`;} }}
                                  />
                                  <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:14}}>{rest}</span>
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
          </div>
          
          {/* BOTTOM INFO BAR (Mobile) */}
          <BottomStatusBar agentConnected={agentConnected} game={game} agentName={agentName} isMobile={true} />
        </>
      )}
      
      {/* STATUS BAR */}\n"""

    code = code[:start_idx] + new_jsx + code[end_idx + len(end_tag):]
    with open('src/pages/Game.jsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Replaced structure")
else:
    print("Tags not found", start_idx, end_idx)
