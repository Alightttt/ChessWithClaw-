import React, { useEffect, useRef } from 'react';

export default function MoveHistory({ moveHistory = [] }) {
  const scrollRef = useRef(null);

  // Group moves into pairs (white, black)
  const movePairs = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1] || null,
      whiteIndex: i,
      blackIndex: i + 1
    });
  }

  // Auto-scroll to bottom when moveHistory changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory]);

  const currentMoveIndex = moveHistory.length - 1;

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-lg overflow-hidden">
      <div className="hidden md:flex items-center justify-between px-4 py-2 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-subtle)] shrink-0">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Move History</h3>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-[var(--color-border-default)] scrollbar-track-transparent"
      >
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] text-xs uppercase z-10 shadow-sm hidden md:table-header-group">
            <tr>
              <th className="py-1 px-3 w-12 font-medium text-center border-b border-[var(--color-border-subtle)]">#</th>
              <th className="py-1 px-3 font-medium border-b border-[var(--color-border-subtle)]">White</th>
              <th className="py-1 px-3 font-medium border-b border-[var(--color-border-subtle)]">Black</th>
            </tr>
          </thead>
          <tbody className="font-mono text-sm">
            {movePairs.map((pair, idx) => (
              <tr 
                key={pair.moveNumber} 
                className={`${idx % 2 === 0 ? 'bg-[var(--color-bg-base)]' : 'bg-[var(--color-bg-surface)]'} hover:bg-[var(--color-bg-hover)] transition-colors`}
              >
                <td className="py-1.5 px-3 text-[var(--color-text-muted)] text-center border-r border-[var(--color-border-subtle)]">
                  {pair.moveNumber}
                </td>
                <td 
                  className={`py-1.5 px-3 ${currentMoveIndex === pair.whiteIndex ? 'bg-[var(--color-red-primary)]/20 text-white font-bold' : 'text-[var(--color-text-secondary)]'}`}
                >
                  {pair.white?.san || ''}
                </td>
                <td 
                  className={`py-1.5 px-3 ${pair.black ? (currentMoveIndex === pair.blackIndex ? 'bg-[var(--color-red-primary)]/20 text-white font-bold' : 'text-[var(--color-text-secondary)]') : ''}`}
                >
                  {pair.black?.san || ''}
                </td>
              </tr>
            ))}
            {movePairs.length === 0 && (
              <tr>
                <td colSpan="3" className="py-6 text-center text-[var(--color-text-muted)] text-sm italic">
                  No moves yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
