'use client';

import React from 'react';
import { Copy, Activity, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ThinkingPanel({ agentConnected, agentUrl, currentThinking, lastThinking, isAgentTurn, isHumanTurn }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusConfig = () => {
    if (!agentConnected) return { text: 'OFFLINE', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500', icon: <AlertCircle size={16} className="text-red-500" /> };
    if (isAgentTurn) return { text: 'ANALYZING', color: 'text-[#2dc653]', bg: 'bg-[#2dc653]/10', border: 'border-[#2dc653]', icon: <Cpu size={16} className="text-[#2dc653] animate-pulse" /> };
    return { text: 'WAITING', color: 'text-[#c9973a]', bg: 'bg-[#c9973a]/10', border: 'border-[#c9973a]', icon: <CheckCircle2 size={16} className="text-[#c9973a]" /> };
  };

  const status = getStatusConfig();

  return (
    <div className={`bg-[#1c1c1c] border-2 ${status.border} rounded-xl p-1.5 sm:p-5 shadow-2xl flex flex-col gap-1 sm:gap-3 transition-all duration-300 h-[85px] sm:h-auto sm:min-h-[160px]`}>
      {/* Header / Status Bar */}
      <div className="flex items-center justify-between border-b border-[#333] pb-1 sm:pb-3 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#141414] border border-[#333] flex items-center justify-center text-[10px] sm:text-sm">
            🤖
          </div>
          <div>
            <h2 className="text-[11px] sm:text-base font-bold text-[#f0f0f0] leading-none">Claw</h2>
            <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
              {status.icon}
              <span className={`text-[8px] sm:text-xs font-bold tracking-wider ${status.color}`}>
                {status.text}
              </span>
            </div>
          </div>
        </div>
        <div className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[8px] sm:text-[10px] font-mono tracking-widest ${status.bg} ${status.color} hidden sm:block`}>
          AGENT
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        {!agentConnected ? (
          <div className="space-y-1 sm:space-y-4">
            <p className="text-[#a0a0a0] text-[9px] sm:text-sm leading-tight">Agent disconnected. Share link to connect.</p>
            <div className="flex gap-1.5 sm:gap-2">
              <input 
                type="text" 
                readOnly 
                value={agentUrl} 
                className="flex-1 bg-[#141414]/80 border border-[#333] rounded px-1.5 py-0.5 sm:px-3 sm:py-2 text-[#f0f0f0] font-mono text-[8px] sm:text-xs outline-none"
              />
              <button 
                onClick={() => copyToClipboard(agentUrl)}
                className="bg-[#333] hover:bg-[#444] px-1.5 py-0.5 sm:p-2 rounded flex items-center justify-center transition-colors"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        ) : isAgentTurn ? (
          <div className="space-y-0.5 sm:space-y-2">
            <label className="flex items-center gap-1 sm:gap-1.5 text-[#666] text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
              <Activity size={8} className="animate-pulse text-[#2dc653]" />
              Live Thought Process
            </label>
            {currentThinking ? (
              <div className="bg-[#141414]/80 border border-[#2dc653]/20 rounded p-1 sm:p-3">
                <pre className="whitespace-pre-wrap font-mono text-[8px] sm:text-xs text-[#2dc653] leading-tight">
                  {currentThinking}
                  <span className="animate-pulse">▌</span>
                </pre>
              </div>
            ) : (
              <p className="text-[#a0a0a0] italic text-[9px] sm:text-sm py-0.5">Evaluating positions...</p>
            )}
          </div>
        ) : (
          <div className="space-y-1 sm:space-y-3">
            <p className="text-[#a0a0a0] text-[9px] sm:text-sm">Agent is waiting for your move.</p>
            {lastThinking && (
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[8px] sm:text-[10px] text-[#666] uppercase tracking-wider font-bold">Played:</span>
                  <span className="text-[#c9973a] font-mono text-[9px] sm:text-xs font-bold bg-[#c9973a]/10 px-1 py-0.5 rounded">
                    {lastThinking.finalMove}
                  </span>
                </div>
                <div className="bg-[#141414]/80 border border-[#333] rounded p-1 sm:p-3">
                  <pre className="whitespace-pre-wrap font-mono text-[8px] sm:text-xs text-[#a0a0a0] leading-tight">
                    {lastThinking.text || '(No reasoning provided)'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
