import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { Button, Card, StatusDot } from './ui';
import { supabase } from '../lib/supabase';

export default function GameCreated({ gameId, agentUrl }) {
  const [boardOpened, setBoardOpened] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  const shortId = gameId.substring(0, 6).toUpperCase();

  useEffect(() => {
    if (!gameId) return;

    // Listen for agent connection
    const channel = supabase.channel(`game_${gameId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`
      }, (payload) => {
        if (payload.new.agent_connected) {
          setAgentConnected(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const handleOpenBoard = () => {
    window.open(`${window.location.origin}/#/Game?id=${gameId}`, '_blank');
    setBoardOpened(true);
  };

  const inviteMessage = `Play chess with me!
I'm White, you're Black.
Join my game room: ${agentUrl}

Please connect via the link above and make your moves when it's your turn.`;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] font-sans flex flex-col items-center justify-center p-3 sm:p-4">
      <Card className="max-w-2xl w-full shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] p-4 sm:p-8">
        
        {/* Header */}
        <div className="text-center mb-5 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-1 sm:mb-2">Game Ready! 🎉</h2>
          <div className="inline-block bg-[var(--color-bg-hover)] border border-[var(--color-border-subtle)] rounded-md px-3 py-1 sm:px-4 sm:py-2 mt-1 sm:mt-2">
            <span className="font-mono text-xl sm:text-2xl text-[#2B45C6] font-bold tracking-widest">#{shortId}</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center gap-2 sm:gap-4 mb-6 sm:mb-10">
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-green-500">Created</span>
          </div>
          <div className="w-8 sm:w-12 h-1 bg-[var(--color-border-subtle)] relative">
            <div className={`absolute top-0 left-0 h-full bg-green-500 transition-all duration-500 ${boardOpened ? 'w-full' : 'w-0'}`} />
          </div>
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${boardOpened ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-[var(--color-bg-hover)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]'}`}>
              {boardOpened ? <Check size={14} strokeWidth={3} /> : <span className="text-xs sm:text-sm font-bold">2</span>}
            </div>
            <span className={`text-[10px] sm:text-xs font-bold transition-colors duration-500 ${boardOpened ? 'text-green-500' : 'text-[var(--color-text-muted)]'}`}>Board</span>
          </div>
          <div className="w-8 sm:w-12 h-1 bg-[var(--color-border-subtle)] relative">
            <div className={`absolute top-0 left-0 h-full bg-green-500 transition-all duration-500 ${agentConnected ? 'w-full' : 'w-0'}`} />
          </div>
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${agentConnected ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-[var(--color-bg-hover)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]'}`}>
              {agentConnected ? <Check size={14} strokeWidth={3} /> : <span className="text-xs sm:text-sm font-bold">3</span>}
            </div>
            <span className={`text-[10px] sm:text-xs font-bold transition-colors duration-500 ${agentConnected ? 'text-green-500' : 'text-[var(--color-text-muted)]'}`}>Agent</span>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* STEP 1 */}
          <div className={`border rounded-lg p-3 sm:p-5 transition-all duration-300 ${boardOpened ? 'bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] opacity-70' : 'bg-[var(--color-bg-hover)] border-[var(--color-red-primary)]/50 shadow-[0_0_15px_rgba(229,62,62,0.1)]'}`}>
            <div className="flex justify-between items-start mb-1 sm:mb-2">
              <h3 className="font-bold text-base sm:text-lg text-[var(--color-text-primary)]">1. Open the Board</h3>
              {boardOpened && <span className="text-green-500 text-xs sm:text-sm font-bold flex items-center gap-1"><Check size={14} /> Board Open</span>}
            </div>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mb-3 sm:mb-4">Your game board is ready in a new tab.</p>
            <Button 
              onClick={handleOpenBoard}
              variant={boardOpened ? 'secondary' : 'primary'}
              className="w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3"
              leftIcon={<ExternalLink size={16} />}
            >
              Open Board →
            </Button>
          </div>

          {/* STEP 2 */}
          <div className={`border rounded-lg p-3 sm:p-5 transition-all duration-300 ${agentConnected ? 'bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] opacity-70' : boardOpened ? 'bg-[var(--color-bg-hover)] border-[var(--color-red-primary)]/50 shadow-[0_0_15px_rgba(229,62,62,0.1)]' : 'bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)]'}`}>
            <h3 className="font-bold text-base sm:text-lg text-[var(--color-text-primary)] mb-1 sm:mb-2">2. Invite Your Agent</h3>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mb-3 sm:mb-4">
              Send this message to your OpenClaw agent on Telegram or wherever you chat with it:
            </p>
            
            <div className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-md p-3 sm:p-4 mb-3 sm:mb-4 font-mono text-xs sm:text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">
              {inviteMessage}
            </div>
            
            <Button
              onClick={copyInvite}
              variant="secondary"
              className="w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3"
              leftIcon={copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            >
              {copied ? 'Copied! ✓' : 'Copy Invite Message'}
            </Button>
          </div>

          {/* STEP 3 */}
          <div className={`border rounded-lg p-3 sm:p-5 transition-all duration-300 ${agentConnected ? 'bg-[var(--color-bg-hover)] border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)] relative overflow-hidden' : 'bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)]'}`}>
            
            {agentConnected && (
              <div className="absolute inset-0 pointer-events-none flex justify-center items-center opacity-50">
                <div className="absolute animate-bounce text-xl sm:text-2xl" style={{ left: '10%', animationDelay: '0.1s' }}>🎉</div>
                <div className="absolute animate-bounce text-xl sm:text-2xl" style={{ left: '30%', animationDelay: '0.3s' }}>✨</div>
                <div className="absolute animate-bounce text-xl sm:text-2xl" style={{ left: '50%', animationDelay: '0.2s' }}>🎊</div>
                <div className="absolute animate-bounce text-xl sm:text-2xl" style={{ left: '70%', animationDelay: '0.4s' }}>🌟</div>
                <div className="absolute animate-bounce text-xl sm:text-2xl" style={{ left: '90%', animationDelay: '0.1s' }}>🎈</div>
              </div>
            )}

            <h3 className="font-bold text-base sm:text-lg text-[var(--color-text-primary)] mb-3 sm:mb-4">3. Wait for Connection</h3>
            
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <StatusDot status={agentConnected ? 'success' : 'warning'} />
              <span className={`text-sm sm:text-base font-medium ${agentConnected ? 'text-green-500' : 'text-yellow-500 animate-pulse'}`}>
                {agentConnected ? 'Agent Connected! ✓' : 'Waiting for agent to join...'}
              </span>
            </div>

            {agentConnected && (
              <Button 
                onClick={() => window.location.href = `/#/Game?id=${gameId}`}
                className="w-full sm:w-auto mt-2 relative z-10 text-sm sm:text-base py-2 sm:py-3"
              >
                Go to Game →
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

