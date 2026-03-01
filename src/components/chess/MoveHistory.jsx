'use client';

import React, { useEffect, useRef } from 'react';

export default function MoveHistory({ moveHistory, currentMoveNumber }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory]);

  const pairs = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1]
    });
  }

  return (
    <div className="bg-[#1c1c1c] border border-[#333] rounded-lg flex flex-col h-full shadow-lg">
      <div className="p-3 sm:p-4 border-b border-[#333]">
        <h2 className="text-[#c9973a] font-bold text-sm sm:text-base tracking-wider">MOVE HISTORY</h2>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 font-mono text-xs sm:text-sm max-h-64 sm:max-h-80"
      >
        {pairs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#666] italic">
            No moves yet
          </div>
        ) : (
          <div className="space-y-1">
            {pairs.map((pair, idx) => (
              <div 
                key={idx} 
                className={`flex gap-4 p-1 sm:p-2 rounded ${
                  pair.number === currentMoveNumber ? 'bg-[#c9973a] bg-opacity-20' : 'hover:bg-[#141414]'
                }`}
              >
                <div className="text-[#666] w-6 sm:w-8 text-right select-none">{pair.number}.</div>
                <div className="text-[#f0f0f0] w-12 sm:w-16 font-bold">{pair.white?.san}</div>
                <div className="text-[#f0f0f0] w-12 sm:w-16 font-bold">{pair.black?.san || '...'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
