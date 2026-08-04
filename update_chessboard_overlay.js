const fs = require('fs');
let content = fs.readFileSync('src/pages/Game.jsx', 'utf-8');

// For desktop layout
content = content.replace(
  /<ChessBoard \s*fen=\{reviewMoveIndex !== null \? getFenAtMove\(reviewMoveIndex\) : \(optimisticFen \|\| game\.fen\)\} \s*showCoordinates=\{false\}\s*onMove=\{makeMove\} \s*isMyTurn=\{isMyTurn\} \s*lastMove=\{lastMoveHighlight \|\| optimisticLastMove \|\| \(game\.move_history \|\| \[\]\)\[\(game\.move_history \|\| \[\]\)\?\.length - 1\] \|\| null\} arrivedSquare=\{arrivedSquare\} \s*moveHistory=\{game\.move_history \|\| \[\]\}\s*boardTheme=\{boardTheme\}\s*pieceTheme=\{pieceTheme\}\s*playerColor=\{'b'\}\s*onIllegalMove=\{handleIllegalMove\}\s*onCapture=\{handleCapture\}\s*\/>/s,
  `$&
          {!agentJoined && game?.status === 'waiting' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center pointer-events-none" style={{ borderRadius: '4px' }}>
              <div className="font-sans text-xl font-bold text-white tracking-wide drop-shadow-md">Awaiting Agent...</div>
            </div>
          )}`
);

// For mobile layout
content = content.replace(
  /<ChessBoard fen=\{reviewMoveIndex !== null \? getFenAtMove\(reviewMoveIndex\) : \(optimisticFen \|\| game\.fen\)\} showCoordinates=\{false\} onMove=\{makeMove\} isMyTurn=\{isMyTurn\} lastMove=\{lastMoveHighlight \|\| optimisticLastMove \|\| \(game\.move_history \|\| \[\]\)\[\(game\.move_history \|\| \[\]\)\?\.length - 1\] \|\| null\} arrivedSquare=\{arrivedSquare\} moveHistory=\{game\.move_history \|\| \[\]\} boardTheme=\{boardTheme\} pieceTheme=\{pieceTheme\} playerColor=\{game\?\.player_color \|\| 'w'\} onIllegalMove=\{handleIllegalMove\} onCapture=\{handleCapture\} \/>/,
  `$&
                  {!agentJoined && game?.status === 'waiting' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center pointer-events-none" style={{ borderRadius: '4px' }}>
                      <div className="font-sans text-xl font-bold text-white tracking-wide drop-shadow-md">Awaiting Agent...</div>
                    </div>
                  )}`
);

// Contrast text in alert
// "Improve the contract of text in alert which shows in agent section When agent isn't joined for first-time."
// Let's find that alert
// Search for "waiting" or "agent isn't joined" or something in Game.jsx

fs.writeFileSync('src/pages/Game.jsx', content);
