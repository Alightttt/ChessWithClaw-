'use client';

import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { Copy } from 'lucide-react';
import { supabase, hasSupabase } from '../lib/supabase';
import GameCreated from '../components/GameCreated';

export default function Home() {
  const [gameId, setGameId] = useState(null);
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const agentUrl = `${window.location.origin}/#/Agent?id=${gameId}`;

  const createGame = async () => {
    if (!hasSupabase) {
      toast.error('Supabase credentials missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    setCreating(true);
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out. Your Supabase project might be paused.')), 10000)
      );

      const secretToken = crypto.randomUUID();

      const insertPromise = supabase
        .from('games')
        .insert([{
          status: 'waiting',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          turn: 'w',
          move_history: [],
          thinking_log: [],
          current_thinking: '',
          human_connected: false,
          agent_connected: false,
          result: null,
          result_reason: null,
          webhook_url: null,
          chat_history: [],
          secret_token: secretToken
        }])
        .select()
        .single();

      const { data, error } = await Promise.race([insertPromise, timeoutPromise]);

      if (error) {
        if (error.message && (error.message.includes('Could not find the table') || error.message.includes('relation "games" does not exist'))) {
          throw new Error('Database table "games" is missing. Please create it in your Supabase SQL Editor.');
        }
        throw error;
      }
      
      localStorage.setItem(`game_owner_${data.id}`, secretToken);
      setGameId(data.id);
    } catch (error) {
      console.error('Create game error:', error);
      if (error.message === 'Failed to fetch') {
        toast.error('Network error: Failed to reach the database. Please check if your Supabase project is paused, or if CORS settings are blocking this domain.');
      } else {
        toast.error('Failed to create game: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setCreating(false);
    }
  };

  const copyInstallCommand = () => {
    navigator.clipboard.writeText('claw install play-chess');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (gameId) {
    return <GameCreated gameId={gameId} agentUrl={agentUrl} />;
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans selection:bg-[#e53e3e] selection:text-white overflow-x-hidden scroll-smooth">
      
      {/* SECTION 1 — HEADER */}
      <header className="fixed top-0 left-0 right-0 h-[52px] z-50 bg-[rgba(0,0,0,0.85)] backdrop-blur-[12px] border-b border-[#1a1a1a] px-[20px] md:px-[40px] flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699888c91e97454c7b995e2f/5384ee56f_gpt-image-15-high-fidelity_a_Make_a_logo_for_my_a.png" 
            alt="Logo" 
            className="w-[20px] h-[20px] rounded-full object-cover"
          />
          <span className="font-semibold text-[15px] text-white tracking-tight">ChessWithClaw</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/openclaw" target="_blank" rel="noopener noreferrer" className="text-[14px] text-gray-400 hover:text-white transition-colors hidden sm:block">
            GitHub
          </a>
          <button 
            onClick={createGame}
            disabled={creating}
            className="bg-[#e53e3e] hover:bg-[#cc3333] text-white text-[13px] font-semibold h-[32px] px-[16px] rounded-[6px] transition-all active:scale-[0.97] duration-150 cursor-pointer border-none"
          >
            {creating ? 'Creating...' : 'Play Now'}
          </button>
        </div>
      </header>

      {/* SECTION 2 — HERO */}
      <section className="relative min-h-[100vh] pt-[52px] flex flex-col justify-center px-[24px] md:px-[60px] py-[48px] md:py-[80px] w-full bg-[#080808]">
        <div className="relative z-10 w-full max-w-2xl text-left">
          <h1 className="font-[900] leading-[1.05] tracking-[-2px] mb-0" style={{ fontSize: 'clamp(36px, 9vw, 80px)' }}>
            <div className="text-white">Beat your own</div>
            <div className="text-[#e53e3e]">OpenClaw at chess.</div>
          </h1>
          
          <p className="text-[#6b6b6b] text-[16px] max-w-[400px] mt-[20px] leading-[1.6]">
            Challenge your personal OpenClaw agent to a real chess match.
          </p>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-[12px] mt-[32px]">
            <button
              onClick={createGame}
              disabled={creating}
              className="h-[48px] px-6 bg-[#e53e3e] hover:bg-[#cc3333] text-white text-[15px] font-[700] tracking-[0.3px] rounded-[8px] transition-all duration-150 hover:shadow-[0_0_20px_rgba(229,62,62,0.3)] active:scale-[0.97] cursor-pointer w-full md:w-auto min-w-[180px] border-none"
            >
              {creating ? 'Creating...' : 'Start a Game →'}
            </button>
            <button
              onClick={scrollToHowItWorks}
              className="h-[48px] px-6 bg-transparent border border-[#2a2a2a] hover:border-[#444] text-[#888] hover:text-[#aaa] text-[15px] rounded-[8px] transition-all duration-150 active:scale-[0.97] cursor-pointer w-full md:w-auto"
            >
              See how it works
            </button>
          </div>

          <div className="h-[2px] w-[60px] bg-[#e53e3e] mt-[48px] opacity-60"></div>
        </div>

        {/* Decorative Knight (Desktop Only) */}
        <div className="hidden lg:block absolute right-[-60px] top-[50%] -translate-y-[50%] text-[500px] leading-none text-[rgba(229,62,62,0.06)] select-none pointer-events-none z-0">
          ♞
        </div>
      </section>

      {/* SECTION 3 — PROOF BAR */}
      <section className="w-full bg-[#0f0f0f] border-y border-[#1a1a1a] py-[16px] px-[24px]">
        <div className="max-w-7xl mx-auto flex flex-row justify-around items-center">
          <div className="flex flex-col items-center text-center">
            <span className="text-[13px] font-[700] text-white uppercase tracking-[0.5px]">Real-time</span>
            <span className="text-[11px] text-[#555]">Move by Move</span>
          </div>
          <div className="w-[1px] h-[24px] bg-[#222]"></div>
          <div className="flex flex-col items-center text-center">
            <span className="text-[13px] font-[700] text-white uppercase tracking-[0.5px]">Every Agent</span>
            <span className="text-[11px] text-[#555]">Every Style</span>
          </div>
          <div className="w-[1px] h-[24px] bg-[#222]"></div>
          <div className="flex flex-col items-center text-center">
            <span className="text-[13px] font-[700] text-white uppercase tracking-[0.5px]">Any Device</span>
            <span className="text-[11px] text-[#555]">Desktop & Mobile</span>
          </div>
        </div>
      </section>

      {/* SECTION 4 — HOW IT WORKS */}
      <section id="how-it-works" className="py-[64px] px-[24px] w-full bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <div className="text-[11px] font-[700] text-[#e53e3e] tracking-[2px] uppercase mb-[12px]">
            HOW IT WORKS
          </div>
          <h2 className="text-[28px] font-[800] text-white mb-[32px]">
            Three steps to rivalry
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
            <div className="bg-[#111111] border border-[#1e1e1e] rounded-[12px] p-[20px]">
              <div className="text-[11px] font-[700] text-[#e53e3e] tracking-[1px] mb-[10px]">01</div>
              <h3 className="text-[16px] font-[700] text-white mb-[6px]">Create Your Board</h3>
              <p className="text-[#666] text-[14px] leading-[1.5]">
                Start a game instantly and get your unique room link. No sign-up required.
              </p>
            </div>

            <div className="bg-[#111111] border border-[#1e1e1e] rounded-[12px] p-[20px]">
              <div className="text-[11px] font-[700] text-[#e53e3e] tracking-[1px] mb-[10px]">02</div>
              <h3 className="text-[16px] font-[700] text-white mb-[6px]">Invite Your Agent</h3>
              <p className="text-[#666] text-[14px] leading-[1.5]">
                Send the link to your OpenClaw agent. It joins the room and connects to the game state.
              </p>
            </div>

            <div className="bg-[#111111] border border-[#1e1e1e] rounded-[12px] p-[20px]">
              <div className="text-[11px] font-[700] text-[#e53e3e] tracking-[1px] mb-[10px]">03</div>
              <h3 className="text-[16px] font-[700] text-white mb-[6px]">Play and Compete</h3>
              <p className="text-[#666] text-[14px] leading-[1.5]">
                Make your move. Your agent evaluates the board, thinks, and strikes back in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — INSTALL SKILL SECTION */}
      <section className="bg-[#0a0a0a] py-[64px] px-[24px] w-full border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-[32px] items-center">
          <div className="text-left">
            <div className="text-[11px] font-[700] text-[#e53e3e] tracking-[2px] uppercase mb-[12px]">
              INSTALL
            </div>
            <h2 className="text-[22px] font-[800] mb-[8px] text-white">Give your OpenClaw chess powers</h2>
            <p className="text-[#666] text-[14px] leading-[1.5]">
              Install the play-chess skill to let your agent join and compete.
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end w-full">
            <div className="w-full bg-[#0d0d0d] border border-[#222] rounded-[10px] p-[16px] px-[20px] relative">
              <div className="flex items-center gap-[6px] mb-[14px]">
                <div className="w-[10px] h-[10px] rounded-full bg-red-500/80"></div>
                <div className="w-[10px] h-[10px] rounded-full bg-yellow-500/80"></div>
                <div className="w-[10px] h-[10px] rounded-full bg-green-500/80"></div>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="font-mono text-[14px]">
                  <span className="text-gray-500">$ </span>
                  <span className="text-white">claw install </span>
                  <span className="text-[#e53e3e]">play-chess</span>
                </div>
                <button 
                  onClick={copyInstallCommand}
                  className="text-[#444] hover:text-[#888] transition-colors cursor-pointer active:scale-[0.97] duration-150 bg-transparent border-none"
                  title="Copy command"
                >
                  {copied ? <span className="text-[12px] text-green-400 font-sans">Copied!</span> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <a href="https://github.com/openclaw" target="_blank" rel="noopener noreferrer" className="text-[#e53e3e] text-[14px] mt-[12px] hover:underline">
              View on ClawHub →
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 6 — FINAL CTA */}
      <section 
        className="relative py-[80px] px-[24px] w-full flex flex-col items-center text-center border-t border-[#1a1a1a] bg-[#0a0a0a]"
        style={{
          background: 'radial-gradient(ellipse 600px 300px at 50% 50%, rgba(229,62,62,0.06) 0%, transparent 70%), #0a0a0a'
        }}
      >
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-[36px] font-[900] mb-[8px] text-white">Ready to play?</h2>
          <p className="text-[16px] text-[#555] mb-[32px]">Challenge your agent. See who wins.</p>
          <button
            onClick={createGame}
            disabled={creating}
            className="h-[52px] min-w-[200px] px-8 text-[16px] font-[700] bg-[#e53e3e] hover:bg-[#cc3333] text-white rounded-[8px] transition-all duration-150 hover:shadow-[0_0_20px_rgba(229,62,62,0.3)] active:scale-[0.97] cursor-pointer border-none"
          >
            {creating ? 'Creating...' : 'Create Game →'}
          </button>
        </div>
      </section>

      {/* SECTION 7 — FOOTER */}
      <footer className="w-full bg-[#080808] border-t border-[#1a1a1a] p-[24px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-[16px]">
          <div className="flex items-center gap-[8px]">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699888c91e97454c7b995e2f/5384ee56f_gpt-image-15-high-fidelity_a_Make_a_logo_for_my_a.png" 
              alt="Logo" 
              className="w-[16px] h-[16px] rounded-full object-cover"
            />
            <span className="text-[14px] text-white">ChessWithClaw</span>
          </div>
          
          <div className="flex items-center text-[13px] text-[#555]">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#888] transition-colors">
              Twitter
            </a>
            <span className="mx-[8px]">·</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#888] transition-colors">
              GitHub
            </a>
          </div>

          <div className="text-[12px] text-[#333]">
            Built for OpenClaw community
          </div>
        </div>
      </footer>
    </div>
  );
}
