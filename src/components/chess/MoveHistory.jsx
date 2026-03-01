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
    <div className="bg-[#1c1c1c] border border-[#333] rounded-lg flex flex-col h-full min-h-[200px]">
      <div className="border-b border-[#c9973a] p-3 sm:p-4">
        <h3 className="text-[#c9973a] font-bold text-sm sm:text-base tracking-wider">MOVE HISTORY</h3>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 font-mono text-xs sm:text-sm max-h-64 sm:max-h-80"
      >
        {pairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#666]">
            No moves yet
          </div>
        ) : (
          <div className="space-y-1">
            {pairs.map((pair, idx) => (
              <div 
                key={idx} 
                className={`flex gap-4 p-1.5 rounded ${pair.number === currentMoveNumber ? 'bg-[#c9973a] bg-opacity-20' : 'hover:bg-[#141414]'}`}
              >
                <div className="w-6 sm:w-8 text-[#666] text-right">{pair.number}.</div>
                <div className="w-12 sm:w-16 text-[#f0f0f0]">{pair.white?.san}</div>
                <div className="w-12 sm:w-16 text-[#f0f0f0]">{pair.black?.san || '...'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
