'use client';

import React from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function ThinkingPanel({ agentConnected, agentUrl, currentThinking, lastThinking, isAgentTurn, isHumanTurn }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!agentConnected) {
    return (
      <div className="bg-[#1c1c1c] border-2 border-[#c9973a] rounded-lg p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">🤖 OpenClaw - Offline</h2>
        </div>
        <p className="text-[#a0a0a0] mb-4 text-sm sm:text-base">Waiting for agent to join the game...</p>
        
        <div className="flex gap-2 mb-6">
          <div className="w-2 h-2 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        <div>
          <label className="block text-[#a0a0a0] mb-2 text-xs sm:text-sm font-bold">Share this link:</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value={agentUrl} 
              className="flex-1 bg-[#141414] border border-[#333] rounded px-3 py-2 text-[#f0f0f0] font-mono text-xs sm:text-sm outline-none"
            />
            <button 
              onClick={() => copyToClipboard(agentUrl)}
              className="bg-[#333] hover:bg-[#444] p-2 rounded flex items-center justify-center transition-colors"
              title="Copy link"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isAgentTurn) {
    return (
      <div className="bg-[#1c1c1c] border-2 border-[#2dc653] rounded-lg p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-[#2dc653] animate-pulse" />
          <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">🤖 OpenClaw - Thinking...</h2>
        </div>
        
        {currentThinking ? (
          <div className="bg-[#141414] border border-[#333] rounded p-3 sm:p-4 max-h-48 sm:max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-[#2dc653]">
              {currentThinking}
              <span className="animate-pulse">▌</span>
            </pre>
          </div>
        ) : (
          <p className="text-[#a0a0a0] italic text-sm sm:text-base">Agent is analyzing the position...</p>
        )}
      </div>
    );
  }

  if (isHumanTurn) {
    return (
      <div className="bg-[#1c1c1c] border-2 border-[#c9973a] rounded-lg p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-[#2dc653]" />
          <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">🤖 OpenClaw - Online</h2>
        </div>
        
        <p className="text-[#a0a0a0] mb-4 text-sm sm:text-base">Waiting for your move...</p>
        
        {lastThinking && (
          <div>
            <label className="block text-[#a0a0a0] mb-2 text-xs sm:text-sm font-bold">
              Last thought (Move {lastThinking.moveNumber}):
            </label>
            <div className="bg-[#141414] border border-[#333] rounded p-3 sm:p-4 max-h-32 sm:max-h-48 overflow-y-auto mb-3">
              <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-[#a0a0a0]">
                {lastThinking.text || '(no reasoning provided)'}
              </pre>
            </div>
            <p className="text-[#2dc653] font-mono text-sm font-bold">
              Played: {lastThinking.finalMove}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#1c1c1c] border border-[#333] rounded-lg p-4 sm:p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-full bg-[#2dc653]" />
        <h2 className="text-lg sm:text-xl font-bold text-[#f0f0f0]">🤖 OpenClaw - Online</h2>
      </div>
      <p className="text-[#a0a0a0] text-sm sm:text-base">Ready to play!</p>
    </div>
  );
}
