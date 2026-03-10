'use client';

import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

export default function ChessBoard({ fen, onMove, isMyTurn, lastMove, showCoordinates = true, interactive = true, boardTheme = 'green', pieceTheme = 'merida' }) {
  const [chess, setChess] = useState(new Chess(fen));
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [promotionMove, setPromotionMove] = useState(null);

  useEffect(() => {
    setChess(new Chess(fen));
    setSelectedSquare(null);
    setLegalMoves([]);
    setPromotionMove(null);
  }, [fen]);

  const pieceMap = {
    wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
  };

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const handleSquareClick = (row, col) => {
    if (!interactive || !isMyTurn) return;

    const square = files[col] + ranks[row];
    const piece = chess.get(square);

    if (!selectedSquare) {
      if (piece && piece.color === 'w') {
        setSelectedSquare(square);
        setLegalMoves(chess.moves({ square, verbose: true }));
      }
    } else {
      const movesToSquare = legalMoves.filter(m => m.to === square);
      if (movesToSquare.length > 0) {
        if (movesToSquare[0].promotion) {
          setPromotionMove({ from: selectedSquare, to: square });
        } else {
          onMove(selectedSquare, square);
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      } else if (piece && piece.color === 'w') {
        setSelectedSquare(square);
        setLegalMoves(chess.moves({ square, verbose: true }));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  const isLight = (row, col) => (row + col) % 2 === 0;
  
  const isLastMoveSquare = (sq) => {
    if (!lastMove) return false;
    if (typeof lastMove === 'string') {
        return sq === lastMove.substring(0, 2) || sq === lastMove.substring(2, 4);
    }
    return lastMove.from === sq || lastMove.to === sq || lastMove.uci?.includes(sq);
  };
  
  const isLegalDestination = (sq) => legalMoves.some(m => m.to === sq);
  const isCapture = (sq) => legalMoves.some(m => m.to === sq && m.captured);
  const isKingInCheck = (sq, piece) => piece && piece.type === 'k' && piece.color === chess.turn() && chess.inCheck();

  const themes = {
    green: { light: '#eeeed2', dark: '#769656' },
    classic: { light: '#f0d9b5', dark: '#b58863' },
    blue: { light: '#dee3e6', dark: '#8ca2ad' },
    purple: { light: '#e1d5e6', dark: '#8a789a' },
    monochrome: { light: '#e0e0e0', dark: '#888888' },
  };

  const currentTheme = themes[boardTheme] || themes.green;

  const renderPiece = (piece) => {
    if (!piece) return null;
    if (pieceTheme === 'unicode') {
      return (
        <span
          className="relative z-10 drop-shadow-md text-[9vw] sm:text-5xl leading-none"
          style={{
            color: piece.color === 'w' ? '#ffffff' : '#000000',
            textShadow: piece.color === 'w' ? '0 0 2px #000' : '0 0 2px #fff'
          }}
        >
          {pieceMap[piece.color + piece.type.toUpperCase()]}
        </span>
      );
    } else {
      const pieceName = `${piece.color}${piece.type.toUpperCase()}`;
      let url = '';
      if (pieceTheme === 'merida' || pieceTheme === 'cburnett' || pieceTheme === 'alpha') {
        url = `https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/${pieceTheme}/${pieceName}.svg`;
      } else {
        url = `https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/${pieceName}.svg`;
      }
      return <img src={url} alt={pieceName} className="relative z-10 w-[85%] h-[85%] drop-shadow-md pointer-events-none" />;
    }
  };

  return (
    <div className={`flex flex-col select-none w-full h-full ${!interactive || !isMyTurn ? 'opacity-90' : 'opacity-100'}`}>
      <div className="relative w-full h-full aspect-square">
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
          {ranks.map((rank, row) =>
          files.map((file, col) => {
            const sq = file + rank;
            const piece = chess.get(sq);
            const isSelected = selectedSquare === sq;
            const isLast = isLastMoveSquare(sq);
            const isLegal = isLegalDestination(sq);
            const isCap = isCapture(sq);
            const isCheck = isKingInCheck(sq, piece);

            return (
              <div
                key={sq}
                onClick={() => handleSquareClick(row, col)}
                className="relative w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/50 transition-colors"
                style={{ backgroundColor: isLight(row, col) ? currentTheme.light : currentTheme.dark }}
                aria-label={`${sq}, ${piece ? (piece.color === 'w' ? 'white ' : 'black ') + piece.type : 'empty'}`}
              >
                {/* Overlays */}
                {isSelected && <div className="absolute inset-0 bg-[var(--color-red-primary)]/40 z-0" />}
                {!isSelected && isLast && <div className="absolute inset-0 bg-[var(--color-red-primary)]/25 z-0" />}
                {isCheck && <div className="absolute inset-0 bg-[var(--color-red-primary)] opacity-60 animate-pulse z-0" />}
                
                {/* Legal move indicators */}
                {isLegal && !isCap && <div className="absolute w-[25%] h-[25%] rounded-full bg-[var(--color-red-primary)]/60 z-0" />}
                {isLegal && isCap && <div className="absolute inset-0 border-[6px] border-[var(--color-red-primary)]/60 opacity-80 z-0" />}

                {/* Piece */}
                {renderPiece(piece)}

                {/* Coordinates */}
                {showCoordinates && col === 0 && (
                  <span className={`absolute top-0.5 left-1 text-[10px] sm:text-xs font-bold z-0 ${isLight(row, col) ? 'text-black/50' : 'text-white/60'}`}>
                    {rank}
                  </span>
                )}
                {showCoordinates && row === 7 && (
                  <span className={`absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-bold z-0 ${isLight(row, col) ? 'text-black/50' : 'text-white/60'}`}>
                    {file}
                  </span>
                )}
              </div>
            );
          })
        )}
        </div>
        {promotionMove && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-[var(--color-bg-surface)] p-4 rounded-xl flex gap-4 border border-[var(--color-border-subtle)] shadow-2xl">
              {['q', 'r', 'b', 'n'].map(p => (
                <button 
                  key={p} 
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(promotionMove.from, promotionMove.to, p);
                    setPromotionMove(null);
                    setSelectedSquare(null);
                    setLegalMoves([]);
                  }}
                  className="w-14 h-14 sm:w-20 sm:h-20 bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-hover)] rounded-lg flex items-center justify-center border border-[var(--color-border-subtle)] hover:border-[var(--color-red-primary)] transition-all transform hover:scale-105"
                >
                  {renderPiece({ type: p, color: chess.turn() })}
                </button>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPromotionMove(null);
                }}
                className="w-14 h-14 sm:w-20 sm:h-20 bg-[var(--color-red-primary)]/10 hover:bg-[var(--color-red-primary)]/20 text-[var(--color-red-primary)] rounded-lg flex items-center justify-center text-xl font-bold border border-[var(--color-red-primary)]/30 transition-all"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
