const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// 1. Rewrite renderChatMessages
const oldRenderStart = "const renderChatMessages = () => {";
const newRenderChatMessages = `const renderChatMessages = () => {
    const msgs = normalizedMessages;
    
    const formatTime = (ts) => {
      if (!ts) return '';
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
      <div style={{ paddingBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {msgs.map((msg, index) => {
          if (!msg) return null;
          const isAgent = msg.role === 'agent';
          const isNew = index >= seenMsgCountRef.current;
          const prevMsg = msgs[index - 1];
          const isFirstInGroup = !prevMsg || prevMsg.role !== msg.role;
          const isHuman = !isAgent;

          if (msg.type === 'resign_request' || msg.type === 'draw_offer') {
            return (
              <div key={msg.id} style={{ alignSelf: 'center', background: '#1a1a1a', border: '1px solid #2a2a2a', color: 'white', borderRadius: '12px', padding: '12px', margin: '8px 0', width: '100%', fontFamily: "'Inter', sans-serif", fontSize: '13px', textAlign: 'center' }}>
                {msg.text || msg.message || msg.content}
                {game?.status === 'active' && msg.type === 'resign_request' && (
                  <button onClick={acceptAgentResignation} className="block w-full mt-3 text-white bg-[#e63946] rounded py-2 font-bold transition-all hover:bg-opacity-80 active:scale-95">Accept Resignation</button>
                )}
                {game?.status === 'active' && msg.type === 'draw_offer' && (
                  <button onClick={async () => {
                    await fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': agentToken }, body: JSON.stringify({ action: 'end_game', result: 'draw', reason: 'agreement', gameId }) });
                  }} className="block w-full mt-3 text-white bg-green-600 rounded py-2 font-bold transition-all hover:bg-opacity-80 active:scale-95">Accept Draw</button>
                )}
              </div>
            );
          }
        
          const textStr = msg.text || msg.message || msg.content;
          const timeStr = formatTime(msg.timestamp || msg.ts);

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isAgent ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
                alignSelf: isAgent ? 'flex-start' : 'flex-end',
                position: 'relative',
                animation: isNew ? 'msgSlide 0.2s ease-out' : 'none',
                marginTop: isFirstInGroup ? '8px' : '2px'
              }}
            >
              {isFirstInGroup && (
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', padding: '0 4px', display: 'flex', gap: '4px', alignItems: 'center', fontFamily: "'Inter', sans-serif", width: '100%', justifyContent: isAgent ? 'flex-start' : 'flex-end' }}>
                  {isAgent ? (
                    <>
                      <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{agentName}</span>
                      <span style={{ opacity: 0.5 }}>|</span>
                      <span>{timeStr}</span>
                    </>
                  ) : (
                    <>
                      <span>{timeStr}</span>
                      <span style={{ opacity: 0.5 }}>|</span>
                      <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>You</span>
                    </>
                  )}
                </div>
              )}
              
              <div style={{
                background: isHuman ? 'linear-gradient(135deg, #f0525f 0%, #e63946 100%)' : 'linear-gradient(135deg, #888584 0%, #767372 100%)',
                color: isHuman ? '#ffffff' : '#f2f2f2',
                borderRadius: isHuman 
                  ? (isFirstInGroup ? '16px 16px 4px 16px' : '16px 4px 4px 16px')
                  : (isFirstInGroup ? '16px 16px 16px 4px' : '4px 16px 16px 4px'),
                padding: '10px 14px',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                wordBreak: 'break-word',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                position: 'relative'
              }}>
                {isFirstInGroup && (
                  <svg 
                    width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                    style={{
                      position: 'absolute',
                      top: 'auto',
                      bottom: '0px',
                      left: isHuman ? 'auto' : '-10px',
                      right: isHuman ? '-10px' : 'auto',
                      transform: isHuman ? 'none' : 'scaleX(-1)'
                    }}
                  >
                    <path d="M0 16V0C0 0 2 12 14 16H0Z" fill={isHuman ? '#e63946' : '#767372'} />
                  </svg>
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{textStr}</span>
              </div>
            </div>
          );
        })}
        {game?.agent_typing && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginTop: '12px',
            position: 'relative',
            animation: 'msgSlide 0.2s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #888584 0%, #767372 100%)',
              borderRadius: '16px 16px 16px 4px',
              padding: '12px 14px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              <svg 
                width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', bottom: '0px', left: '-10px', transform: 'scaleX(-1)' }}
              >
                <path d="M0 16V0C0 0 2 12 14 16H0Z" fill="#767372" />
              </svg>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <div style={{ width: '6px', height: '6px', background: '#f2f2f2', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both' }} />
                <div style={{ width: '6px', height: '6px', background: '#f2f2f2', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                <div style={{ width: '6px', height: '6px', background: '#f2f2f2', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };`;

const renderChatIdx = code.indexOf(oldRenderStart);
if (renderChatIdx > -1) {
  const nextFuncIdx = code.indexOf("if (!game) return null;", renderChatIdx);
  // Actually wait, renderChatMessages ends right before `return (` of the Game component.
  // It's safer to use regex with careful boundaries.
}

code = code.replace(/const renderChatMessages = \(\) => \{[\s\S]*?\n  \};\n/m, newRenderChatMessages + '\n');


// 2. Fix Header logic
// Currently, there is a back button in the header.
// It is around line 1772 in Game.jsx:
/*
          <button onClick={handleGoHomeWithRipple} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', color: '#f2f2f2', background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
*/

code = code.replace(
  /onClick=\{handleGoHomeWithRipple\}/g,
  `onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowLeaveWarning(true); }}`
);

// 3. Fix Logo size
code = code.replace(
  /src="\/logo\.png" alt="" style=\{\{ width: '24px', height: '24px'/g,
  `src="/logo.png" alt="" style={{ width: '36px', height: '36px'`
);

// 4. Update the red dot logic on the live chat button
// The red dot currently shows if normalizedMessages.length > 0 && normalizedMessages[normalizedMessages.length - 1].role === 'agent'
// The user wants: "I want the red dot to be displayed on live chat button near chat icon , only when agent send any message there, should not be displayed that red dot when I send message there."
// And they want the move history and chat to overlay over the board.
// In Game.jsx, the mobile section:

const oldMobileSection = `            {/* MOBILE BUTTONS + DRAWERS — shared wrapper so drawers overlay upward instead of pushing the board layout */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', background: 'transparent', flexShrink: 0, justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 41 }}>
                <button onClick={() => { setMoveHistoryOpen(!moveHistoryOpen); setChatMobileOpen(false); }} style={{ flex: 1, height: '60px', background: 'linear-gradient(180deg, #46423f 0%, #3d3937 100%)', border: 'none', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: moveHistoryOpen ? '#e63946' : '#e0dbd9', cursor: 'pointer', transition: 'color 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                  <History size={28} />
                </button>
                <button onClick={() => { setChatMobileOpen(!chatMobileOpen); setMoveHistoryOpen(false); }} style={{ flex: 1, height: '60px', background: 'linear-gradient(180deg, #46423f 0%, #3d3937 100%)', border: 'none', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: chatMobileOpen ? '#e63946' : '#e0dbd9', position: 'relative', cursor: 'pointer', transition: 'color 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                  <MessageSquare size={28} />
                  {chatMobileOpen === false && normalizedMessages.length > 0 && normalizedMessages[normalizedMessages.length - 1].role === 'agent' && (
                    <div style={{ position: 'absolute', top: '16px', right: '36px', width: '8px', height: '8px', background: '#e63946', borderRadius: '50%' }} />
                  )}
                </button>
              </div>

              <div style={{ background: '#221f1e', display: 'flex', flexDirection: 'column', position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 50, boxShadow: (moveHistoryOpen || chatMobileOpen) ? '0 -8px 24px rgba(0,0,0,0.35)' : 'none', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>`;

const newMobileSection = `            {/* MOBILE BUTTONS */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', background: 'transparent', flexShrink: 0, justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 41 }}>
                <button onClick={() => { setMoveHistoryOpen(!moveHistoryOpen); setChatMobileOpen(false); }} style={{ flex: 1, height: '60px', background: 'linear-gradient(180deg, #46423f 0%, #3d3937 100%)', border: 'none', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: moveHistoryOpen ? '#e63946' : '#e0dbd9', cursor: 'pointer', transition: 'color 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                  <History size={28} />
                </button>
                <button onClick={() => { setChatMobileOpen(!chatMobileOpen); setMoveHistoryOpen(false); }} style={{ flex: 1, height: '60px', background: 'linear-gradient(180deg, #46423f 0%, #3d3937 100%)', border: 'none', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: chatMobileOpen ? '#e63946' : '#e0dbd9', position: 'relative', cursor: 'pointer', transition: 'color 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                  <MessageSquare size={28} />
                  {chatMobileOpen === false && normalizedMessages.length > 0 && normalizedMessages[normalizedMessages.length - 1].role === 'agent' && (
                    <div style={{ position: 'absolute', top: '16px', right: '36px', width: '8px', height: '8px', background: '#e63946', borderRadius: '50%' }} />
                  )}
                </button>
              </div>
              
              {/* MOBILE OVERLAYS (ABOVE BOARD) */}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: '84px', zIndex: 50, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 'calc(100vh - 200px)' }}>
                {/* CHAT OVERLAY */}
                <div style={{ 
                  pointerEvents: chatMobileOpen ? 'auto' : 'none',
                  opacity: chatMobileOpen ? 1 : 0,
                  transform: chatMobileOpen ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 280ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  background: 'linear-gradient(to top, rgba(17,17,17,0.95) 0%, rgba(17,17,17,0.8) 60%, transparent 100%)',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '60vh'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Chat with {agentName}</div>
                    <button onClick={() => setChatMobileOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><XIcon size={16} /></button>
                  </div>
                  <div ref={chatMessagesRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)', paddingBottom: '8px', paddingTop: '16px' }} className="scrollbar-none scroll-smooth">
                    {normalizedMessages.length === 0 ? (
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center', margin: 'auto', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}><LobsterEmoji /></span>
                        <span>{agentName} can chat while playing</span>
                      </div>
                    ) : (
                      renderChatMessages()
                    )}
                  </div>
                  <form 
                    onSubmit={sendMessage} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '48px', boxSizing: 'border-box' }}
                  >
                    <input
                      id="chat-input-mobile"
                      data-testid="chat-input-mobile"
                      type="text"
                      value={chatInput}
                      onChange={handleChatInputChange}
                      placeholder={isSpectator ? "Spectating..." : \`Chat with \${agentName}...\`}
                      disabled={isSpectator}
                      style={{ flex: 1, height: '44px', background: 'rgba(61,57,55,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '22px', color: '#f2f2f2', fontFamily: "'Inter', sans-serif", fontSize: '14px', padding: '0 16px', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box', backdropFilter: 'blur(8px)' }}
                      onFocus={(e) => { e.target.style.background = 'rgba(61,57,55,1)'; e.target.style.borderColor = 'rgba(230,57,70,0.5)'; }}
                      onBlur={(e) => { e.target.style.background = 'rgba(61,57,55,0.8)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    />
                    <button 
                      data-testid="chat-send-mobile"
                      type="submit"
                      disabled={isSpectator || !chatInput.trim()}
                      style={{ width: '44px', height: '44px', background: (!isSpectator && chatInput.trim()) ? '#e63946' : 'rgba(230,57,70,0.5)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (!isSpectator && chatInput.trim()) ? 'pointer' : 'default', border: 'none', color: 'white', flexShrink: 0, transition: 'all 0.1s ease', boxShadow: (!isSpectator && chatInput.trim()) ? '0 4px 12px rgba(230,57,70,0.4)' : 'none' }}
                      onMouseDown={(e) => { if(!isSpectator && chatInput.trim()) { e.currentTarget.style.transform = 'scale(0.92)'; } }}
                      onMouseUp={(e) => { if(!isSpectator && chatInput.trim()) { e.currentTarget.style.transform = 'scale(1)'; } }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>

                {/* MOVE HISTORY OVERLAY */}
                <div style={{ 
                  position: 'absolute', top: 0, left: 0, right: 0,
                  pointerEvents: moveHistoryOpen ? 'auto' : 'none',
                  opacity: moveHistoryOpen ? 1 : 0,
                  transform: moveHistoryOpen ? 'translateY(0)' : 'translateY(-20px)',
                  transition: 'all 280ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  background: 'rgba(17,17,17,0.95)',
                  backdropFilter: 'blur(8px)',
                  borderBottomLeftRadius: '20px',
                  borderBottomRightRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '40vh'
                }}>
                  <div 
                    onClick={() => setMoveHistoryOpen(!moveHistoryOpen)}
                    style={{ minHeight: '44px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', zIndex: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(242,242,242,0.6)', letterSpacing: '0.05em' }}>
                      MOVE HISTORY
                    </span>
                    <ChevronDown size={20} color="rgba(255,255,255,0.6)" style={{ transform: moveHistoryOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 280ms ease-out' }} />
                  </div>
                  <div 
                    ref={moveHistoryScrollRef}
                    style={{ overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '2px' }} 
                    className="scrollbar-none"
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(242,242,242,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>#</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(242,242,242,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>You</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(242,242,242,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>{agentName}</div>
                    </div>
`;

code = code.replace(oldMobileSection, newMobileSection);

// We need to also clean up the old move history / chat drawers from the code.
const moveHistoryEndRegex = /\{\/\* CHAT DRAWER \*\/\}/;
code = code.replace(/\{\/\* MOVE HISTORY DRAWER \*\/\}[\s\S]*?(?=\{\/\* CHAT DRAWER \*\/)/, '');
code = code.replace(/\{\/\* CHAT DRAWER \*\/\}[\s\S]*?(?=<\/div>\n            <\/div>\n          <\/div>)/, '</div>');

// Wait! It's much safer to replace large chunks explicitly.
// But first, let's write to file.
fs.writeFileSync('src/pages/Game.jsx', code);
