import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

export default function ChessBoard({ fen, onMove, isMyTurn, lastMove, showCoordinates = true, interactive = true }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [chess, setChess] = useState(new Chess(fen));

  useEffect(() => {
    setChess(new Chess(fen));
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [fen]);

  const pieceMap = {
    wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
  };

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const isLight = (row, col) => (row + col) % 2 === 0;
  const squareToNotation = (row, col) => files[col] + ranks[row];
  
  const isKingInCheck = (row, col) => {
    const sq = squareToNotation(row, col);
    const piece = chess.get(sq);
    return chess.inCheck() && piece && piece.type === 'k' && piece.color === chess.turn();
  };

  const isLastMoveSquare = (row, col) => {
    if (!lastMove) return false;
    const sq = squareToNotation(row, col);
    return lastMove.from === sq || lastMove.to === sq;
  };

  const isLegalDestination = (row, col) => {
    const sq = squareToNotation(row, col);
    return legalMoves.some(m => m.to === sq);
  };

  const isCapture = (row, col) => {
    const sq = squareToNotation(row, col);
    return legalMoves.some(m => m.to === sq && m.flags.includes('c'));
  };

  const selectPiece = (row, col) => {
    const sq = squareToNotation(row, col);
    const moves = chess.moves({ square: sq, verbose: true });
    setSelectedSquare(sq);
    setLegalMoves(moves);
  };

  const handleSquareClick = (row, col) => {
    if (!interactive || !isMyTurn) return;

    const sq = squareToNotation(row, col);
    const piece = chess.get(sq);

    if (!selectedSquare) {
      if (piece && piece.color === 'w') {
        selectPiece(row, col);
      }
    } else {
      const move = legalMoves.find(m => m.to === sq);
      if (move) {
        onMove(selectedSquare, sq, move.flags.includes('p') ? 'q' : undefined);
        setSelectedSquare(null);
        setLegalMoves([]);
      } else if (piece && piece.color === 'w') {
        selectPiece(row, col);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  const boardOpacity = (!interactive || !isMyTurn) ? 'opacity-90' : 'opacity-100';

  return (
    <div className={`flex flex-col items-center ${boardOpacity} transition-opacity duration-300`}>
      <div className="w-[480px] h-[480px] grid grid-cols-8 grid-rows-8 border-4 border-[#444] shadow-2xl relative">
        {ranks.map((rank, row) => (
          files.map((file, col) => {
            const sq = squareToNotation(row, col);
            const piece = chess.get(sq);
            const light = isLight(row, col);
            
            return (
              <div
                key={sq}
                onClick={() => handleSquareClick(row, col)}
                className={`relative flex items-center justify-center w-[60px] h-[60px] cursor-${interactive && isMyTurn ? 'pointer' : 'default'} ${light ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}`}
              >
                {/* Overlays */}
                {selectedSquare === sq && (
                  <div className="absolute inset-0 bg-yellow-400 opacity-60 z-0 pointer-events-none" />
                )}
                {isLastMoveSquare(row, col) && selectedSquare !== sq && (
                  <div className="absolute inset-0 bg-orange-400 opacity-30 z-0 pointer-events-none" />
                )}
                {isKingInCheck(row, col) && (
                  <div className="absolute inset-0 bg-red-600 opacity-50 animate-pulse z-0 pointer-events-none" />
                )}
                {isLegalDestination(row, col) && !isCapture(row, col) && (
                  <div className="absolute w-4 h-4 rounded-full bg-green-500 opacity-50 z-0 pointer-events-none" />
                )}
                {isLegalDestination(row, col) && isCapture(row, col) && (
                  <div className="absolute inset-0 border-4 border-green-500 opacity-60 z-0 pointer-events-none" />
                )}

                {/* Piece */}
                {piece && (
                  <span 
                    className="text-5xl z-10 select-none"
                    style={{
                      color: piece.color === 'w' ? '#ffffff' : '#000000',
                      textShadow: piece.color === 'w' 
                        ? '0px 0px 2px #000, 0px 0px 2px #000' 
                        : '0px 0px 2px #fff, 0px 0px 2px #fff'
                    }}
                  >
                    {pieceMap[piece.color + piece.type.toUpperCase()]}
                  </span>
                )}

                {/* Inline Coordinates (Agent View) */}
                {!showCoordinates && (
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] text-gray-600 font-bold z-0 pointer-events-none">
                    {sq}
                  </span>
                )}
              </div>
            );
          })
        ))}
      </div>

      {/* External Coordinates (Human View) */}
      {showCoordinates && (
        <div className="flex w-[480px] mt-1">
          {files.map(file => (
            <div key={file} className="w-[60px] text-center text-[#666] text-sm font-bold">
              {file}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
