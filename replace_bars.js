const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

const target1 = `      {/* STEP 4: BOTTOM INFO BAR */}
      {!agentConnected ? (
        <div style={{ flexShrink: 0, width: '100%', background: 'rgba(230,57,70,0.15)', borderTop: '1px solid rgba(230,57,70,0.3)', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 40, boxSizing: 'border-box' }}>
          <div style={{ width: '16px', height: '16px', background: '#fbbf24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#1a1a1a', fontSize: '11px', fontWeight: 'bold', lineHeight: 1 }}>!</span>
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: '#fbbf24' }}>
            Your Agent is not here yet
          </span>
        </div>
      ) : (
        <div style={{ flexShrink: 0, background: '#111111', border: '1px solid #1a1a1a', borderRadius: '8px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 40 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: game?.turn === (game?.player_color || 'w') ? 'white' : 'rgba(242,242,242,0.3)', background: game?.turn === (game?.player_color || 'w') ? '#e63946' : '#161616', padding: '4px 12px', borderRadius: '6px', border: game?.turn !== (game?.player_color || 'w') ? '1px solid #222' : 'none' }}>
            {game?.turn === (game?.player_color || 'w') ? 'YOUR TURN' : 'WAITING'}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(242,242,242,0.25)' }}>
            Move {game?.move_history?.length ? Math.floor(game.move_history.length / 2) + 1 : 1}
          </span>
        </div>
      )}`;

const target2 = `      {/* STEP 4: BOTTOM INFO BAR */}
      {!agentConnected ? (
        <div style={{ flexShrink: 0, width: '100%', background: 'rgba(230,57,70,0.15)', borderTop: '1px solid rgba(230,57,70,0.3)', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 40, boxSizing: 'border-box' }}>
          <div style={{ width: '16px', height: '16px', background: '#fbbf24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#1a1a1a', fontSize: '11px', fontWeight: 'bold', lineHeight: 1 }}>!</span>
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: '#fbbf24' }}>
            Your Agent is not here yet
          </span>
        </div>
      ) : (
        <div style={{ flexShrink: 0, height: '48px', background: '#0a0a0a', borderTop: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 40 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: game?.turn === (game?.player_color || 'w') ? 'white' : 'rgba(242,242,242,0.3)', background: game?.turn === (game?.player_color || 'w') ? '#e63946' : '#161616', padding: '4px 12px', borderRadius: '6px', border: game?.turn !== (game?.player_color || 'w') ? '1px solid #222' : 'none' }}>
            {game?.turn === (game?.player_color || 'w') ? 'YOUR TURN' : 'WAITING'}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(242,242,242,0.25)' }}>
            Move {game?.move_history?.length ? Math.floor(game.move_history.length / 2) + 1 : 1}
          </span>
        </div>
      )}`;

code = code.replace(target1, `      {/* STEP 4: BOTTOM INFO BAR */}
      <BottomStatusBar agentConnected={agentConnected} game={game} agentName={agentName} isMobile={false} />`);

code = code.replace(target2, `      {/* STEP 4: BOTTOM INFO BAR */}
      <BottomStatusBar agentConnected={agentConnected} game={game} agentName={agentName} isMobile={true} />`);

fs.writeFileSync('src/pages/Game.jsx', code);
