import React from 'react';

const pieceSymbols = {
  P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', // White pieces
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛'  // Black pieces
};

export default function CapturedPieces({ pieces, isWhitePieces }) {
  if (!pieces) return null;
  
  const captured = [];
  // Order of value: Queen, Rook, Bishop, Knight, Pawn
  const keys = isWhitePieces ? ['Q', 'R', 'B', 'N', 'P'] : ['q', 'r', 'b', 'n', 'p'];
  
  keys.forEach(key => {
    const count = pieces[key] || 0;
    for (let i = 0; i < count; i++) {
      captured.push(pieceSymbols[key]);
    }
  });

  if (captured.length === 0) return null;

  return (
    <div className="flex gap-0.5 items-center text-lg sm:text-xl text-[var(--color-text-muted)]">
      {captured.map((symbol, idx) => (
        <span key={idx} className="leading-none drop-shadow-sm">{symbol}</span>
      ))}
    </div>
  );
}
