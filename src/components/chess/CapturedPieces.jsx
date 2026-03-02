import React from 'react';

const pieceSymbols = {
  P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', // White pieces
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛'  // Black pieces
};

export default function CapturedPieces({ pieces, isWhitePieces }) {
  if (!pieces) return <div className="h-5 sm:h-8"></div>;
  
  const captured = [];
  // Order of value: Queen, Rook, Bishop, Knight, Pawn
  const keys = isWhitePieces ? ['Q', 'R', 'B', 'N', 'P'] : ['q', 'r', 'b', 'n', 'p'];
  
  keys.forEach(key => {
    const count = pieces[key] || 0;
    for (let i = 0; i < count; i++) {
      captured.push(pieceSymbols[key]);
    }
  });

  if (captured.length === 0) return <div className="h-5 sm:h-8"></div>;

  return (
    <div className="flex gap-0.5 sm:gap-1 h-5 sm:h-8 items-center text-base sm:text-2xl text-[#a0a0a0]">
      {captured.map((symbol, idx) => (
        <span key={idx}>{symbol}</span>
      ))}
    </div>
  );
}
