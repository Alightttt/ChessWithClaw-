'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Chess } from 'chess.js';
import { toast } from 'sonner';
import ChessBoard from '../components/chess/ChessBoard';
import { supabase } from '../lib/supabase';

export default function Agent() {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('id');
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reasoning, setReasoning] = useState('');
  const [moveInput, setMoveInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const moveInputRef = useRef(null);

  useEffect(() => {
    if (!gameId) {
      toast.error('No game ID provided');
      return;
    }

    const loadGame = async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error || !data) {
        toast.error('Game not found');
      } else {
        setGame(data);
        await supabase.from('games').update({ agent_connected: true }).eq('id', gameId);
      }
      setLoading(false);
    };

    loadGame();

    const channel = supabase
      .channel(`agent-${gameId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, (payload) => {
        setGame(payload.new);
        if (!payload.new.agent_connected) {
          supabase.from('games').update({ agent_connected: true }).eq('id', gameId);
        }
        if (payload.new.turn === 'b' && payload.new.status === 'active') {
          setTimeout(() => moveInputRef.current?.focus(), 100);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const handleReasoningChange = async (e) => {
    const text = e.target.value;
    setReasoning(text);
    if (game && game.turn === 'b') {
      await supabase.from('games').update({ current_thinking: text }).eq('id', gameId);
    }
  };

  const submitMove = async () => {
    if (!moveInput.trim() || !game) return;
    setSubmitting(true);
    setError('');

    const chess = new Chess(game.fen);
    let move = null;

    try {
      move = chess.move(moveInput.trim());
    } catch (e) {
      try {
        const from = moveInput.trim().substring(0, 2);
        const to = moveInput.trim().substring(2, 4);
        const promotion = moveInput.trim().length > 4 ? moveInput.trim().substring(4, 5) : 'q';
        move = chess.move({ from, to, promotion });
      } catch (err) {
        move = null;
      }
    }

    if (!move) {
      setError(`Invalid move: '${moveInput}'. Not in your legal moves list.`);
      setSubmitting(false);
      return;
    }

    const newThinkingLog = [...(game.thinking_log || []), {
      moveNumber: Math.floor((game.move_history || []).length / 2) + 1,
      text: reasoning || '(no reasoning provided)',
      finalMove: move.san,
      timestamp: Date.now()
    }];

    const newMoveHistory = [...(game.move_history || []), {
      number: Math.floor((game.move_history || []).length / 2) + 1,
      color: 'b',
      from: move.from,
      to: move.to,
      san: move.san,
      uci: move.from + move.to,
      timestamp: Date.now()
    }];

    const updates = {
      fen: chess.fen(),
      turn: 'w',
      move_history: newMoveHistory,
      thinking_log: newThinkingLog,
      current_thinking: ''
    };

    if (chess.isCheckmate()) {
      updates.status = 'finished';
      updates.result = 'black';
      updates.result_reason = 'checkmate';
    } else if (chess.isStalemate()) {
      updates.status = 'finished';
      updates.result = 'draw';
      updates.result_reason = 'stalemate';
    } else if (chess.isDraw()) {
      updates.status = 'finished';
      updates.result = 'draw';
      updates.result_reason = 'draw';
    }

    await supabase.from('games').update(updates).eq('id', gameId);
    setReasoning('');
    setMoveInput('');
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white font-mono">
        LOADING GAME...
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white font-mono">
        GAME NOT FOUND
      </div>
    );
  }

  const chess = new Chess(game.fen);
  const isMyTurn = game.turn === 'b' && game.status === 'active';
  const legalMoves = chess.moves({ verbose: true }).map(m => m.from + m.to + (m.promotion || ''));
  const lastMove = (game.move_history || [])[(game.move_history || []).length - 1] || null;
  const moveNumber = Math.floor((game.move_history || []).length / 2) + 1;

  let bannerBg = 'bg-[#1a1a2e]';
  let bannerBorder = 'border-[#666]';
  let bannerTitle = '⏳ WAITING FOR YOUR TURN...';
  let bannerSubtitle = 'Waiting for the game to start...';

  if (isMyTurn) {
    bannerBg = 'bg-[#1a2e1a]';
    bannerBorder = 'border-[#2dc653]';
    bannerTitle = '⚡ YOUR TURN — YOU ARE BLACK';
    bannerSubtitle = 'Read the game state below. Type your reasoning. Submit your move.';
  } else if (game.turn === 'w') {
    bannerBg = 'bg-[#1a1a2e]';
    bannerBorder = 'border-[#c9973a]';
    bannerTitle = '⏳ WHITE IS MOVING...';
    bannerSubtitle = 'White (human player) is making their move...';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] font-mono text-[#f0f0f0]">
      {/* HEADER */}
      <div className="bg-[#1c1c1c] border-b border-[#c9973a] px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699888c91e97454c7b995e2f/5384ee56f_gpt-image-15-high-fidelity_a_Make_a_logo_for_my_a.png" 
            alt="Logo" 
            className="w-10 h-10 rounded-full border border-[#c9973a]"
          />
          <h1 className="text-xl sm:text-2xl text-[#c9973a] font-bold">Claw Agent</h1>
        </div>
        <div className="text-[#666] text-sm hidden sm:block">Black</div>
      </div>

      {/* TURN BANNER */}
      <div className={`${bannerBg} border-b-4 ${bannerBorder} px-4 py-6 text-center transition-colors duration-300`}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{bannerTitle}</h2>
        <p className="text-[#a0a0a0]">{bannerSubtitle}</p>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* 1. Connection Status Card */}
        <div className="bg-[#1a2e1a] border-2 border-[#2dc653] rounded p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#2dc653] animate-pulse" />
            <span className="text-[#2dc653] font-bold">CONNECTED TO GAME</span>
          </div>
          <div className="text-[#a0a0a0] text-sm">
            Room: {gameId.substring(0, 8)}
          </div>
        </div>

        {/* 2. Game State Block */}
        <div className="bg-[#141414] border-2 border-[#333] rounded overflow-hidden">
          <div className="bg-[#1c1c1c] border-b border-[#333] p-3 flex justify-between items-center">
            <h3 className="font-bold text-[#c9973a]">GAME STATE</h3>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-2">
                Human: <div className={`w-2 h-2 rounded-full ${game.human_connected ? 'bg-[#2dc653]' : 'bg-red-500'}`} />
              </span>
              <span className="flex items-center gap-2">
                Agent: <div className={`w-2 h-2 rounded-full ${game.agent_connected ? 'bg-[#2dc653]' : 'bg-red-500'}`} />
              </span>
            </div>
          </div>
          
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#a0a0a0] mb-1">YOU ARE: <span className="text-white font-bold">BLACK</span></p>
              <p className="text-[#a0a0a0] mb-1">CURRENT TURN: <span className="text-white font-bold">{game.turn === 'w' ? 'WHITE' : 'BLACK'}</span></p>
              <p className="text-[#a0a0a0] mb-1">MOVE NUMBER: <span className="text-white font-bold">{moveNumber}</span></p>
              <p className="text-[#a0a0a0] mb-1">GAME STATUS: <span className="text-white font-bold">{game.status.toUpperCase()}</span></p>
              {lastMove && (
                <p className="text-[#a0a0a0] mt-2">
                  LAST MOVE: <span className="text-[#c9973a] font-bold">{lastMove.uci}</span> (played by {lastMove.color === 'w' ? 'WHITE' : 'BLACK'})
                </p>
              )}
            </div>
            
            <div className="space-y-4">
              {isMyTurn && (
                <div>
                  <p className="text-[#a0a0a0] mb-1 font-bold">YOUR LEGAL MOVES:</p>
                  <div className="bg-[#0d0d0d] border border-[#333] rounded p-2 max-h-24 overflow-y-auto text-[#2dc653] break-words">
                    {legalMoves.join(', ')}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-[#a0a0a0] mb-1 font-bold">FEN POSITION:</p>
                <div className="bg-[#0d0d0d] border border-[#333] rounded p-2 text-[10px] sm:text-xs text-[#a0a0a0] break-all">
                  {game.fen}
                </div>
              </div>

              <div>
                <p className="text-[#a0a0a0] mb-1 font-bold">FULL MOVE HISTORY:</p>
                <div className="bg-[#0d0d0d] border border-[#333] rounded p-2 text-xs text-[#a0a0a0] max-h-24 overflow-y-auto">
                  {(game.move_history || []).map((m, i) => (
                    <span key={i}>
                      {i % 2 === 0 ? `${m.number}. ` : ''}{m.san} 
                    </span>
                  ))}
                  {(!game.move_history || game.move_history.length === 0) && 'No moves yet'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Action Area */}
        {isMyTurn && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Step 1 */}
            <div className="bg-[#141414] border-2 border-[#333] rounded overflow-hidden">
              <div className="bg-[#1c1c1c] border-b border-[#333] p-3">
                <h3 className="font-bold text-[#c9973a]">STEP 1: TYPE YOUR REASONING (optional but encouraged)</h3>
              </div>
              <div className="p-4">
                <textarea
                  value={reasoning}
                  onChange={handleReasoningChange}
                  rows={8}
                  className="w-full bg-[#0d0d0d] border border-[#333] focus:border-[#2dc653] rounded p-3 text-[#f0f0f0] font-mono outline-none resize-y transition-colors"
                  placeholder="I see that White just played... My evaluation is... I should respond with..."
                />
                <p className="text-[#666] text-xs mt-2 italic">
                  (Your reasoning will be shown live to your opponent as you type)
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#141414] border-2 border-[#333] rounded overflow-hidden">
              <div className="bg-[#1c1c1c] border-b border-[#333] p-3">
                <h3 className="font-bold text-[#c9973a]">STEP 2: ENTER YOUR MOVE AND SUBMIT</h3>
              </div>
              <div className="p-4 space-y-4">
                {error && (
                  <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded p-3 text-red-500 text-sm">
                    {error}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    ref={moveInputRef}
                    type="text"
                    value={moveInput}
                    onChange={(e) => setMoveInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitMove()}
                    placeholder="e.g. e7e5 or Nf6"
                    className="flex-1 bg-[#0d0d0d] border border-[#333] focus:border-[#2dc653] rounded px-4 py-3 text-xl text-[#f0f0f0] font-mono outline-none transition-colors"
                  />
                  <button
                    onClick={submitMove}
                    disabled={submitting || !moveInput.trim()}
                    className="bg-[#2dc653] hover:bg-[#1a8a36] disabled:opacity-50 disabled:hover:bg-[#2dc653] text-black font-bold py-3 px-8 rounded transition-colors text-lg"
                  >
                    {submitting ? 'SUBMITTING...' : 'SUBMIT MOVE'}
                  </button>
                </div>
                <p className="text-[#c9973a] text-xs font-bold">
                  ⚠️ Only moves from YOUR LEGAL MOVES list above will be accepted.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Move Format Guide */}
        <div className="bg-[#141414] border-2 border-[#444] rounded p-4">
          <h3 className="font-bold text-center text-[#a0a0a0] mb-4">MOVE FORMAT GUIDE</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#a0a0a0]">
            <ul className="space-y-2">
              <li><span className="text-white">Pawn move:</span> e7e5 (UCI) or e5 (SAN)</li>
              <li><span className="text-white">Piece move:</span> g8f6 (UCI) or Nf6 (SAN)</li>
              <li><span className="text-white">Piece symbols:</span> N=Knight B=Bishop R=Rook Q=Queen K=King</li>
            </ul>
            <ul className="space-y-2">
              <li><span className="text-white">Kingside castle:</span> O-O</li>
              <li><span className="text-white">Queenside castle:</span> O-O-O</li>
              <li><span className="text-white">Promotion:</span> e7e8q, e7e8r, e7e8b, e7e8n</li>
            </ul>
          </div>
          <p className="text-center text-[#e63946] text-xs mt-4 font-bold">
            IMPORTANT: Only moves in YOUR LEGAL MOVES list are valid.
          </p>
        </div>

        {/* 5. Reference Board */}
        <div className="bg-[#141414] border-2 border-[#333] rounded overflow-hidden">
          <div className="bg-[#1c1c1c] border-b border-[#333] p-3">
            <h3 className="font-bold text-[#a0a0a0]">BOARD POSITION (REFERENCE ONLY — submit your move above)</h3>
          </div>
          <div className="p-4 flex justify-center">
            <div className="scale-75 sm:scale-100 origin-top">
              <ChessBoard 
                fen={game.fen} 
                onMove={() => {}} 
                isMyTurn={false} 
                lastMove={lastMove} 
                showCoordinates={false} 
                interactive={false} 
              />
            </div>
          </div>
        </div>

        {/* 6. Game Over Block */}
        {game.status === 'finished' && (
          <div className="bg-[#1a1a2e] border-4 border-[#c9973a] rounded-xl p-8 text-center animate-in fade-in zoom-in duration-500">
            <h2 className="text-3xl font-bold text-[#c9973a] mb-2">
              GAME OVER — {game.result === 'white' ? 'WHITE WINS' : game.result === 'black' ? 'BLACK WINS' : 'DRAW'}
            </h2>
            <p className="text-[#f0f0f0] text-lg">
              Reason: {game.result_reason === 'checkmate' ? 'Checkmate' : 
                       game.result_reason === 'stalemate' ? 'Stalemate' : 'Draw'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
