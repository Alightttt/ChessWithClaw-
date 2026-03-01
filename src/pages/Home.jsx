'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Copy } from 'lucide-react';
import { supabase, hasSupabase } from '../lib/supabase';

export default function Home() {
  const [gameId, setGameId] = useState(null);
  const [creating, setCreating] = useState(false);

  const humanUrl = `${window.location.origin}/Game?id=${gameId}`;
  const agentUrl = `${window.location.origin}/Agent?id=${gameId}`;

  const createGame = async () => {
    if (!hasSupabase) {
      toast.error('Supabase credentials missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
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
          result_reason: null
        }])
        .select()
        .single();

      if (error) {
        if (error.message.includes('Could not find the table') || error.message.includes('relation "games" does not exist')) {
          throw new Error('Database table "games" is missing. Please create it in your Supabase SQL Editor.');
        }
        throw error;
      }
      setGameId(data.id);
    } catch (error) {
      console.error('Create game error:', error);
      toast.error('Failed to create game: ' + (error.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const telegramMessage = `Visit this URL: ${agentUrl}

You are playing chess as Black against a human opponent (White).

Instructions:
1. The page shows your current game state including whose turn it is
2. When the banner says "YOUR TURN", it is time for you to move
3. Read the GAME STATE block to understand the position
4. Type your reasoning in the "STEP 1" text area (this shows to your opponent live)
5. Pick a move from the YOUR LEGAL MOVES list
6. Type it in the "STEP 2" move input field and click SUBMIT MOVE
7. Use format like: e7e5, Nf6, O-O
8. After submitting, wait for the page to update when White moves
9. Repeat from step 2 each time it becomes your turn

You are BLACK. White moves first.`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center p-4">
      {gameId === null ? (
        <div className="bg-[#1c1c1c] border border-[#c9973a] rounded-lg p-8 max-w-md w-full text-center shadow-2xl">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699888c91e97454c7b995e2f/5384ee56f_gpt-image-15-high-fidelity_a_Make_a_logo_for_my_a.png" 
            alt="Logo" 
            className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 rounded-full border-2 border-[#c9973a]"
          />
          <h1 className="text-3xl md:text-4xl text-[#c9973a] font-serif mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Chess vs OpenClaw
          </h1>
          <p className="text-[#a0a0a0] mb-8">
            Play chess against your AI agent. You are White. Your agent plays Black.
          </p>
          
          {!hasSupabase && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-sm text-left">
              <strong>Configuration Missing:</strong> Supabase environment variables are not set. This app requires a Supabase backend to sync real-time game state between the human and the agent.
            </div>
          )}

          <button
            onClick={createGame}
            disabled={creating || !hasSupabase}
            className="w-full bg-[#c9973a] hover:bg-[#e8b84b] text-black font-bold py-3 px-4 rounded transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {creating ? 'CREATING...' : 'CREATE GAME'}
          </button>
        </div>
      ) : (
        <div className="bg-[#1c1c1c] border border-[#2dc653] rounded-lg p-6 md:p-8 max-w-2xl w-full shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699888c91e97454c7b995e2f/5384ee56f_gpt-image-15-high-fidelity_a_Make_a_logo_for_my_a.png" 
              alt="Logo" 
              className="w-16 h-16 rounded-full border border-[#2dc653]"
            />
            <h2 className="text-2xl md:text-3xl text-[#2dc653] font-bold">✅ Game Created!</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[#a0a0a0] mb-2 font-bold">YOUR LINK (open this):</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={humanUrl} 
                  className="flex-1 bg-[#141414] border border-[#333] rounded px-3 py-2 text-[#f0f0f0] font-mono outline-none"
                />
                <button 
                  onClick={() => window.open(humanUrl, '_blank')}
                  className="bg-[#333] hover:bg-[#444] p-2 rounded flex items-center justify-center transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={20} />
                </button>
                <button 
                  onClick={() => copyToClipboard(humanUrl)}
                  className="bg-[#333] hover:bg-[#444] p-2 rounded flex items-center justify-center transition-colors"
                  title="Copy link"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#a0a0a0] mb-2 font-bold">AGENT LINK (send to OpenClaw):</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={agentUrl} 
                  className="flex-1 bg-[#141414] border border-[#333] rounded px-3 py-2 text-[#f0f0f0] font-mono outline-none"
                />
                <button 
                  onClick={() => copyToClipboard(agentUrl)}
                  className="bg-[#333] hover:bg-[#444] p-2 rounded flex items-center justify-center transition-colors"
                  title="Copy link"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>

            <hr className="border-[#333] my-6" />

            <div>
              <h3 className="text-xl text-[#f0f0f0] mb-4 font-bold">How to start:</h3>
              <ol className="list-decimal list-inside text-[#a0a0a0] space-y-2 mb-6">
                <li>Click the external link icon next to YOUR LINK to open your game board</li>
                <li>Copy the AGENT LINK</li>
                <li>Send it to OpenClaw on Telegram with this message:</li>
              </ol>

              <div className="bg-[#141414] border border-[#333] rounded p-4 mb-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-[#a0a0a0] max-h-48 overflow-y-auto">
                  {telegramMessage}
                </pre>
              </div>

              <button
                onClick={() => copyToClipboard(telegramMessage)}
                className="bg-[#333] hover:bg-[#444] text-[#f0f0f0] font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
              >
                <Copy size={18} />
                Copy This Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
