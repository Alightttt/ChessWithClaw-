const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// 6. Rewrite Move History in mobile (using scrollHeight and max-height 240px, transitioning height)
const oldMobileMoveHistory = /\{\/\* E\) MOVE HISTORY \*\/\}([\s\S]*?)<\/div>\s*\{\/\* STEP 4: BOTTOM INFO BAR \*\/\}/;

const newMobileMoveHistory = `
        {/* E) MOVE HISTORY */}
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
                                onError={(e)=>{ if(!e.target.dataset.fb){e.target.dataset.fb='1'; e.target.src=\`https://lichess1.org/assets/piece/cburnett/w\${letter}.svg\`;} }}
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
                                onError={(e)=>{ if(!e.target.dataset.fb){e.target.dataset.fb='1'; e.target.src=\`https://lichess1.org/assets/piece/cburnett/b\${letter}.svg\`;} }}
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
`;

code = code.replace(oldMobileMoveHistory, newMobileMoveHistory + "\n      {/* STEP 4: BOTTOM INFO BAR */}");

fs.writeFileSync('src/pages/Game.jsx', code);
console.log('Patch 2 applied');
