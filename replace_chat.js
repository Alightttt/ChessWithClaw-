const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

const oldRenderChatMessages = `  const renderChatMessages = () => {
    const msgs = normalizedMessages;
    return (
      <div style={{ paddingBottom: '10px' }}>
        {msgs.map((msg, index) => {
          if (!msg) return null;
          const isAgent = msg.role === 'agent' || msg.sender === 'agent' || (msg.role !== 'human' && msg.sender !== 'agent');
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
        
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isAgent ? 'flex-start' : 'flex-end',
                marginBottom: '4px',
                position: 'relative',
                animation: isNew ? 'msgSlide 0.2s ease-out' : 'none'
              }}
            >
              <CloudBubble isPrevious={!isFirstInGroup} isHuman={isHuman}>
                {msg.text || msg.message || msg.content}
              </CloudBubble>
            </div>
          );
        })}
        {game?.agent_typing && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginBottom: '4px',
            position: 'relative',
            animation: 'msgSlide 0.2s ease-out'
          }}>
            <CloudBubble isPrevious={false} isHuman={false}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '20px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1a1a1a', animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1a1a1a', animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1a1a1a', animation: 'typingBounce 1.4s infinite ease-in-out both' }} />
              </div>
            </CloudBubble>
          </div>
        )}
      </div>
    );
  };`;

const newRenderChatMessages = `  const renderChatMessages = () => {
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
                animation: isNew ? 'msgSlide 0.2s ease-out' : 'none'
              }}
            >
              {isFirstInGroup && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', padding: '0 4px', display: 'flex', gap: '4px', alignItems: 'center', fontFamily: "'Inter', sans-serif", width: '100%', justifyContent: isAgent ? 'flex-start' : 'flex-end' }}>
                  {isAgent ? (
                    <>
                      <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{agentName}</span>
                      <span style={{ opacity: 0.5 }}>|</span>
                      <span>{timeStr}</span>
                    </>
                  ) : (
                    <>
                      <span>{timeStr}</span>
                      <span style={{ opacity: 0.5 }}>|</span>
                      <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>You</span>
                    </>
                  )}
                </div>
              )}
              
              <div style={{
                background: isHuman ? 'linear-gradient(135deg, #f0525f 0%, #e63946 100%)' : 'linear-gradient(135deg, #605c5a 0%, #4a4644 100%)',
                color: isHuman ? '#ffffff' : '#f2f2f2',
                borderRadius: isHuman 
                  ? (isFirstInGroup ? '14px 14px 4px 14px' : '14px 4px 4px 14px')
                  : (isFirstInGroup ? '14px 14px 14px 4px' : '4px 14px 14px 4px'),
                padding: '10px 14px',
                fontSize: '14.5px',
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                wordBreak: 'break-word',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                position: 'relative'
              }}>
                {isFirstInGroup && (
                  <svg 
                    width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg"
                    style={{
                      position: 'absolute',
                      top: isHuman ? 'auto' : 'auto',
                      bottom: '0px',
                      left: isHuman ? 'auto' : '-11px',
                      right: isHuman ? '-11px' : 'auto',
                      transform: isHuman ? 'none' : 'scaleX(-1)'
                    }}
                  >
                    <path d="M0 14V0C0 0 2 10 12 14H0Z" fill={isHuman ? '#e63946' : '#4a4644'} />
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
            marginTop: '8px',
            position: 'relative',
            animation: 'msgSlide 0.2s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #605c5a 0%, #4a4644 100%)',
              borderRadius: '14px 14px 14px 4px',
              padding: '12px 14px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              <svg 
                width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', bottom: '0px', left: '-11px', transform: 'scaleX(-1)' }}
              >
                <path d="M0 14V0C0 0 2 10 12 14H0Z" fill="#4a4644" />
              </svg>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '14px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f2f2f2', opacity: 0.8, animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f2f2f2', opacity: 0.8, animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f2f2f2', opacity: 0.8, animation: 'typingBounce 1.4s infinite ease-in-out both' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };`;

if (code.includes('const renderChatMessages = () => {')) {
  const indexStart = code.indexOf('const renderChatMessages = () => {');
  const indexEnd = code.indexOf('  };', indexStart) + 4;
  code = code.slice(0, indexStart) + newRenderChatMessages + code.slice(indexEnd);
  fs.writeFileSync('src/pages/Game.jsx', code);
  console.log('Successfully replaced renderChatMessages.');
} else {
  console.log('Could not find renderChatMessages');
}
