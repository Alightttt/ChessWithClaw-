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
    loadGame();
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`game_${gameId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`
      }, (payload) => {
        const updatedGame = payload.new;
        setGame(updatedGame);
        if (!updatedGame.agent_connected) {
          supabase.from('games').update({ agent_connected: true }).eq('id', gameId).then();
        }
        if (updatedGame.turn === 'b' && updatedGame.status === 'active') {
          setTimeout(() => {
            if (moveInputRef.current) moveInputRef.current.focus();
          }, 100);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const loadGame = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) {
        if (error.message.includes('Could not find the table')) {
          throw new Error('Database table "games" is missing. Please run the SQL script in your Supabase SQL Editor.');
        }
        throw error;
      }
      setGame(data);
      await supabase.from('games').update({ agent_connected: true }).eq('id', gameId);
    } catch (error) {
      toast.error('Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const handleReasoningChange = (e) => {
    const text = e.target.value;
    setReasoning(text);
    if (game && game.turn === 'b') {
      supabase.from('games').update({ current_thinking: text }).eq('id', gameId).then();
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
        const promotion = moveInput.trim().substring(4) || 'q';
        move = chess.move({ from, to, promotion });
      } catch (e2) {
        move = null;
      }
    }

    if (!move) {
      setError(`Invalid move: '${moveInput}'. Not in your legal moves list.`);
      setSubmitting(false);
      return;
    }

    const newThinkingLog = [
      ...(game.thinking_log || []),
      {
        moveNumber: Math.floor((game.move_history || []).length / 2) + 1,
        text: reasoning || '(no reasoning provided)',
        finalMove: move.san,
        timestamp: Date.now()
      }
    ];

    const newMoveHistory = [
      ...(game.move_history || []),
      {
        number: Math.floor((game.move_history || []).length / 2) + 1,
        color: 'b',
        from: move.from,
        to: move.to,
        san: move.san,
        uci: move.from + move.to,
        timestamp: Date.now()
      }
    ];

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
      {/* Header */}
      <header className="bg-[#1c1c1c] border-b-2 border-[#c9973a] px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699888c91e97454c7b995e2f/5384ee56f_gpt-image-15-high-fidelity_a_Make_a_logo_for_my_a.png" 
            alt="Logo" 
            className="w-10 h-10 rounded-full border border-[#c9973a]"
          />
          <h1 className="text-[#c9973a] text-xl sm:text-2xl font-serif" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            OpenClaw Agent
          </h1>
        </div>
        <div className="text-[#666] text-sm sm:text-base">
          Black
        </div>
      </header>

      {/* Turn Banner */}
      <div className={`w-full py-6 px-4 text-center border-b-4 transition-colors duration-300 ${bannerBg} ${bannerBorder}`}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 uppercase">{bannerTitle}</h2>
        <p className="text-sm sm:text-base">{bannerSubtitle}</p>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Connection Status Card */}
        <div className="bg-[#1a2e1a] border-2 border-[#2dc653] rounded p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#2dc653] animate-pulse" />
            <span className="text-[#2dc653] font-bold">CONNECTED TO GAME</span>
          </div>
          <div className="text-[#a0a0a0]">
            Room: {gameId.substring(0, 8)}
          </div>
        </div>

        {/* Game State Block */}
        <div className="bg-[#141414] border-2 border-[#333] p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-4">
            <h2 className="text-xl font-bold text-[#f0f0f0]">GAME STATE</h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${game.human_connected ? 'bg-[#2dc653]' : 'bg-[#e63946]'}`} />
                <span className="text-[#a0a0a0]">Human</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${game.agent_connected ? 'bg-[#2dc653]' : 'bg-[#e63946]'}`} />
                <span className="text-[#a0a0a0]">Agent</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-[#666]">YOU ARE:</span> <span className="font-bold text-[#f0f0f0]">BLACK</span>
            </div>
            <div>
              <span className="text-[#666]">CURRENT TURN:</span> <span className="font-bold text-[#c9973a]">{game.turn === 'w' ? 'WHITE' : 'BLACK'}</span>
            </div>
            <div>
              <span className="text-[#666]">MOVE NUMBER:</span> <span className="font-bold text-[#f0f0f0]">{moveNumber}</span>
            </div>
            <div>
              <span className="text-[#666]">GAME STATUS:</span> <span className="font-bold text-[#f0f0f0]">{game.status.toUpperCase()}</span>
            </div>
          </div>

          {lastMove && (
            <div className="mb-6">
              <span className="text-[#666]">LAST MOVE:</span> <span className="font-bold text-[#f0f0f0]">{lastMove.uci} (played by {lastMove.color === 'w' ? 'WHITE' : 'BLACK'})</span>
            </div>
          )}

          {isMyTurn && (
            <div className="mb-6">
              <h3 className="text-[#666] mb-2">YOUR LEGAL MOVES:</h3>
              <div className="bg-[#0d0d0d] p-4 rounded border border-[#333] max-h-40 overflow-y-auto">
                <p className="text-[#2dc653] font-bold leading-relaxed tracking-wider break-words">
                  {legalMoves.join('  ')}
                </p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-[#666] mb-2">FEN POSITION:</h3>
            <div className="bg-[#0d0d0d] p-4 rounded border border-[#333] overflow-x-auto">
              <p className="text-[10px] sm:text-xs text-[#a0a0a0] break-all">
                {game.fen}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-[#666] mb-2">FULL MOVE HISTORY:</h3>
            <div className="bg-[#0d0d0d] p-4 rounded border border-[#333] max-h-40 overflow-y-auto">
              <p className="text-sm text-[#a0a0a0] leading-relaxed">
                {(game.move_history || []).reduce((acc, move, idx) => {
                  if (idx % 2 === 0) {
                    acc.push(`${Math.floor(idx / 2) + 1}. ${move.san}`);
                  } else {
                    acc[acc.length - 1] += ` ${move.san}`;
                  }
                  return acc;
                }, []).join('  ')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Area */}
        {isMyTurn && (
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="bg-[#141414] border-2 border-[#333] p-4 sm:p-6">
              <h2 className="text-[#2dc653] font-bold mb-4">STEP 1: TYPE YOUR REASONING (optional but encouraged)</h2>
              <textarea
                value={reasoning}
                onChange={handleReasoningChange}
                placeholder="Analyze the position and explain your chosen move..."
                className="w-full h-32 bg-[#0d0d0d] border border-[#444] rounded p-3 text-[#f0f0f0] font-mono focus:border-[#2dc653] focus:outline-none resize-y"
              />
              <p className="text-[#666] text-sm mt-2 italic">
                (Your reasoning will be shown live to your opponent as you type)
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#141414] border-2 border-[#333] p-4 sm:p-6">
              <h2 className="text-[#2dc653] font-bold mb-4">STEP 2: ENTER YOUR MOVE AND SUBMIT</h2>
              
              {error && (
                <div className="bg-[#e63946] bg-opacity-10 border-2 border-[#e63946] rounded p-4 mb-6">
                  <h3 className="text-[#e63946] font-bold mb-2">❌ {error}</h3>
                  <p className="text-[#a0a0a0] mb-2">YOUR LEGAL MOVES:</p>
                  <p className="text-[#2dc653] font-bold leading-relaxed break-words">
                    {legalMoves.join('  ')}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
                <input
                  ref={moveInputRef}
                  type="text"
                  value={moveInput}
                  onChange={(e) => setMoveInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitMove()}
                  placeholder="e.g. e7e5"
                  className="w-full sm:w-48 bg-[#0d0d0d] border-2 border-[#444] rounded p-3 text-xl text-[#f0f0f0] font-mono focus:border-[#2dc653] focus:outline-none uppercase"
                />
                <button
                  onClick={submitMove}
                  disabled={submitting || !moveInput.trim()}
                  className="w-full sm:w-auto bg-[#2dc653] hover:bg-[#1a8a36] disabled:bg-[#333] disabled:text-[#666] text-white font-bold py-4 px-8 rounded transition-colors"
                >
                  {submitting ? 'SUBMITTING...' : 'SUBMIT MOVE'}
                </button>
              </div>
              <p className="text-[#c9973a] text-sm">
                ⚠️ Only moves from YOUR LEGAL MOVES list above will be accepted.
              </p>
            </div>
          </div>
        )}

        {/* Move Format Guide */}
        <div className="bg-[#141414] border-2 border-[#444] p-4 sm:p-6">
          <h2 className="text-center text-[#a0a0a0] font-bold mb-6 tracking-widest">MOVE FORMAT GUIDE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-[#a0a0a0]">
            <div>
              <p className="mb-2"><span className="text-[#f0f0f0] w-32 inline-block">Pawn move:</span> e7e5 (UCI) or e5 (SAN)</p>
              <p className="mb-2"><span className="text-[#f0f0f0] w-32 inline-block">Piece move:</span> g8f6 (UCI) or Nf6 (SAN)</p>
              <p className="mb-2"><span className="text-[#f0f0f0] w-32 inline-block">Piece symbols:</span> N=Knight B=Bishop R=Rook Q=Queen K=King</p>
            </div>
            <div>
              <p className="mb-2"><span className="text-[#f0f0f0] w-32 inline-block">Kingside castle:</span> O-O</p>
              <p className="mb-2"><span className="text-[#f0f0f0] w-32 inline-block">Queenside castle:</span> O-O-O</p>
              <p className="mb-2"><span className="text-[#f0f0f0] w-32 inline-block">Promotion:</span> e7e8q, e7e8r, e7e8b, e7e8n</p>
            </div>
          </div>
          <div className="mt-6 text-center text-[#c9973a] text-sm">
            IMPORTANT: Only moves in YOUR LEGAL MOVES list are valid.
          </div>
        </div>

        {/* Reference Board */}
        <div className="bg-[#141414] border-2 border-[#333] p-4 sm:p-6 flex flex-col items-center">
          <h2 className="text-[#a0a0a0] font-bold mb-6 text-center">BOARD POSITION (REFERENCE ONLY — submit your move above)</h2>
          <div className="scale-75 sm:scale-90 md:scale-100 origin-top">
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

        {/* Game Over Block */}
        {game.status === 'finished' && (
          <div className="bg-[#1a1a2e] border-4 border-[#c9973a] p-6 sm:p-8 text-center rounded">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#c9973a] mb-4">
              GAME OVER — {game.result === 'white' ? 'WHITE WINS' : game.result === 'black' ? 'BLACK WINS' : 'DRAW'}
            </h2>
            <p className="text-lg text-[#f0f0f0]">
              Reason: {game.result_reason === 'checkmate' ? 'Checkmate' : 
                       game.result_reason === 'stalemate' ? 'Stalemate' : 'Draw'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
