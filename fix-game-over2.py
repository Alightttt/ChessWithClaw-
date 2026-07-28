import re

with open('src/pages/Game.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_tag = "{showGameOverModal && ("
end_tag = "<style dangerouslySetInnerHTML="

start_idx = code.find(start_tag)
end_idx = code.find(end_tag, start_idx)

if start_idx != -1 and end_idx != -1:
    new_modal = """      {showGameOverModal && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 1000, 
            background: 'rgba(0,0,0,0.85)', 
            backdropFilter: 'blur(4px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            opacity: closingGameOver ? 0 : 1, 
            transition: 'opacity 200ms ease',
            animation: 'fadeIn 200ms ease-out'
          }}
        >
          <div 
            style={{ 
              background: '#111111', 
              border: '1px solid #222222', 
              borderRadius: '20px', 
              padding: '28px', 
              maxWidth: '340px', 
              width: 'calc(100% - 32px)', 
              textAlign: 'center', 
              position: 'relative', 
              zIndex: 1,
              animation: 'springUp 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275) 80ms backwards'
            }}
          >
            <div 
              style={{ 
                fontSize: '56px', 
                marginBottom: '16px', 
                display: 'flex', 
                justifyContent: 'center',
                animation: 'popIn 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275) 180ms backwards'
              }}
            >
              {game?.winner === (game?.player_color === 'w' ? 'white' : 'black') ? <span style={{ color: '#739552' }}>👑</span> : game?.result === 'draw' ? '🤝' : <LobsterEmoji />}
            </div>
            
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '24px', color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              {game?.result === 'draw' ? 'Draw' : (game?.winner === (game?.player_color === 'b' ? 'white' : 'black') ? 'You Won' : `${agentName} Won`)}
            </h2>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(242,242,242,0.5)', margin: '0 0 24px 0', fontWeight: 500 }}>
              {game?.result_reason}
            </div>

            {/* Final Agent Thought/Chat in CloudBubble */}
            {(thoughtText || normalizedMessages.length > 0) && (
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                <CloudBubble isPrevious={false}>
                  {thoughtText || normalizedMessages[normalizedMessages.length - 1]?.content || 'Good game!'}
                </CloudBubble>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                data-testid="game-over-rematch"
                onClick={handleRematch} 
                style={{
                  flex: 1, 
                  background: '#e63946', 
                  color: 'white', 
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600, 
                  fontSize: '14px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'rgba(255,255,255,0.15) 0px 1px 0px 0px inset'
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <RotateCcw size={16} />
                Rematch
              </button>
              <button 
                onClick={handleCloseGameOverModal} 
                style={{
                  flex: 1, 
                  background: 'transparent', 
                  color: '#f2f2f2', 
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600, 
                  fontSize: '14px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  border: '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer'
                }}
                onMouseDown={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'scale(0.96)'; }}
                onMouseUp={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
      
      """
      
    code = code[:start_idx] + new_modal + code[end_idx:]
    
    keyframes = """
        @keyframes springUp {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0); }
          80% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
"""
    code = code.replace("@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }", "@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }" + keyframes)
    
    with open('src/pages/Game.jsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Replaced game over modal")
else:
    print("Tags not found", start_idx, end_idx)
