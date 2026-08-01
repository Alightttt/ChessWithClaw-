const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

const oldSkeleton = `            <div className="h-[60px] border-b border-[#1a1a1a] flex items-center px-4 gap-3">
              <div style={{ ...skeletonStyle, width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }} />
              <div className="flex-1 flex gap-2 flex-col"> 
                 <div style={{ ...skeletonStyle, width: '96px', height: '16px', borderRadius: '4px' }} />
                 <div style={{ ...skeletonStyle, width: '128px', height: '12px', borderRadius: '4px' }} />
              </div>
            </div>`;

const newSkeleton = `            <div className="h-[60px] border-b border-[#1a1a1a] flex items-center px-4 gap-3">
              <div style={{ ...skeletonStyle, width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }} />
              <div className="flex-1 flex gap-2 flex-col"> 
                 <div style={{ ...skeletonStyle, width: '96px', height: '16px', borderRadius: '4px' }} />
                 <div style={{ ...skeletonStyle, width: '128px', height: '12px', borderRadius: '4px' }} />
              </div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50">
              <div className="glass px-6 py-4 rounded-2xl flex flex-col items-center gap-3 animate-pulse">
                <span className="text-4xl drop-shadow-lg"><LobsterEmoji /></span>
                <span className="text-white/80 font-bold tracking-widest text-sm uppercase">Entering Match...</span>
              </div>
            </div>`;

code = code.replace(oldSkeleton, newSkeleton);
fs.writeFileSync('src/pages/Game.jsx', code);
