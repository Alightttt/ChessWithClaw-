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
      <div className="bg-[#1c1c1c] border-2 border-[#c9973a] rounded-lg p-4 flex-1 flex flex-col min-h-[250px]">
        <h2 className="text-[#f0f0f0] font-bold text-lg mb-4 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          🤖 OpenClaw - Offline
        </h2>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-[#a0a0a0] mb-4">Waiting for agent to join the game...</p>
          <div className="flex gap-2 mb-6">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <div className="w-full max-w-sm text-left">
            <label className="block text-[#666] text-sm mb-1">Share this link:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={agentUrl} 
                className="flex-1 bg-[#141414] border border-[#333] rounded px-2 py-1 text-[#f0f0f0] font-mono text-sm outline-none"
              />
              <button 
                onClick={() => copyToClipboard(agentUrl)}
                className="bg-[#333] hover:bg-[#444] p-1.5 rounded transition-colors"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAgentTurn) {
    return (
      <div className="bg-[#1c1c1c] border-2 border-[#2dc653] rounded-lg p-4 flex-1 flex flex-col min-h-[250px]">
        <h2 className="text-[#f0f0f0] font-bold text-lg mb-4 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          🤖 OpenClaw - Thinking...
        </h2>
        <div className="flex-1 bg-[#141414] border border-[#333] rounded p-3 overflow-y-auto max-h-48 sm:max-h-64">
          {currentThinking ? (
            <pre className="font-mono text-sm text-[#a0a0a0] whitespace-pre-wrap break-words">
              {currentThinking}
              <span className="inline-block w-2 h-4 bg-[#c9973a] ml-1 align-middle animate-pulse" />
            </pre>
          ) : (
            <p className="text-[#666] italic">Agent is analyzing the position...</p>
          )}
        </div>
      </div>
    );
  }

  if (isHumanTurn) {
    return (
      <div className="bg-[#1c1c1c] border-2 border-[#c9973a] rounded-lg p-4 flex-1 flex flex-col min-h-[250px]">
        <h2 className="text-[#f0f0f0] font-bold text-lg mb-4 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          🤖 OpenClaw - Online
        </h2>
        <p className="text-[#a0a0a0] mb-4">Waiting for your move...</p>
        
        {lastThinking && (
          <div className="flex-1 flex flex-col">
            <label className="text-[#666] text-sm mb-2">
              Last thought (Move {lastThinking.moveNumber}):
            </label>
            <div className="flex-1 bg-[#141414] border border-[#333] rounded p-3 overflow-y-auto max-h-32 sm:max-h-48 mb-3">
              <pre className="font-mono text-sm text-[#a0a0a0] whitespace-pre-wrap break-words">
                {lastThinking.text || '(no reasoning provided)'}
              </pre>
            </div>
            <p className="text-[#2dc653] font-bold text-sm">
              Played: {lastThinking.finalMove}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#1c1c1c] border-2 border-[#333] rounded-lg p-4 flex-1 flex flex-col min-h-[250px]">
      <h2 className="text-[#f0f0f0] font-bold text-lg mb-4 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        🤖 OpenClaw - Online
      </h2>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#a0a0a0]">Ready to play!</p>
      </div>
    </div>
  );
}
