const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

const target1 = `<div style={{display:'flex',gap:2,padding:'4px 8px',minHeight:20,flexWrap:'wrap',alignItems:'center'}}>
            {Object.entries(getCapturedPieces(game?.fen).byBlack).flatMap(([t,n])=>
              Array.from({length:n}).map((_,i)=>(
                <span key={t+i} style={{fontSize:13,color:'rgba(242,242,242,0.45)',lineHeight:1}}>{PIECE_SYMBOLS[t]}</span>
              ))
            )}
          </div>`;
          
const target2 = `<div style={{display:'flex',gap:2,padding:'4px 8px',minHeight:20,flexWrap:'wrap',alignItems:'center'}}>
            {Object.entries(getCapturedPieces(game?.fen).byWhite).flatMap(([t,n])=>
              Array.from({length:n}).map((_,i)=>(
                <span key={t+i} style={{fontSize:13,color:'rgba(242,242,242,0.45)',lineHeight:1}}>{PIECE_SYMBOLS[t]}</span>
              ))
            )}
          </div>`;

code = code.replaceAll(target1, '');
code = code.replaceAll(target2, `<CapturedPiecesRow byWhite={getCapturedPieces(game?.fen).byWhite} byBlack={getCapturedPieces(game?.fen).byBlack} pieceTheme={pieceTheme} humanColor={game?.player_color || 'w'} />`);

fs.writeFileSync('src/pages/Game.jsx', code);
