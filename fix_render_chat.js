const fs = require('fs');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  const startStr = "const renderChatMessages = () => {";
  const endStr = "  };";
  
  const startIndex = content.indexOf(startStr);
  if (startIndex === -1) return;
  const nextEnd = content.indexOf(endStr, startIndex);
  if (nextEnd === -1) return;
  
  const closingBrace = nextEnd + endStr.length;

  const newRender = `const renderChatMessages = () => {
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
      </div>
    );
  };`;
  
  content = content.substring(0, startIndex) + newRender + content.substring(closingBrace);
  fs.writeFileSync(file, content);
}

processFile('src/pages/Game.jsx');
processFile('src/pages/Agent.jsx');
