'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Chess } from 'chess.js';
import { toast } from 'sonner';
import ChessBoard from '../components/chess/ChessBoard';
import ThinkingPanel from '../components/chess/ThinkingPanel';
import MoveHistory from '../components/chess/MoveHistory';
import { supabase } from '../lib/supabase';

export default function Game() {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('id');
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);

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
        await supabase.from('games').update({ human_connected: true }).eq('id', gameId);
      }
      setLoading(false);
    };

    loadGame();

    const channel = supabase
      .channel(`game-${gameId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, (payload) => {
        setGame(payload.new);
        if (!payload.new.human_connected) {
          supabase.from('games').update({ human_connected: true }).eq('id', gameId);
        }
        if (payload.new.status === 'finished' && !gameOver) {
          setGameOver(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]); // Removed gameOver from deps to avoid re-subscribing

  const makeMove = async (from, to, promotion) => {
    if (!game || game.turn !== 'w' || !isMyTurn) return;

    const chess = new Chess(game.fen);
    try {
      const move = chess.move({ from, to, promotion });
      if (!move) {
        toast.error('Illegal move');
        return;
      }

      const newMoveHistory = [...(game.move_history || []), {
        number: Math.floor((game.move_history || []).length / 2) + 1,
        color: 'w',
        from,
        to,
        san: move.san,
        uci: from + to,
        timestamp: Date.now()
      }];

      const updates = {
        fen: chess.fen(),
        turn: 'b',
        move_history: newMoveHistory
      };

      if (chess.isCheckmate()) {
        updates.status = 'finished';
        updates.result = 'white';
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

      if (game.status !== 'active' && updates.status !== 'finished') {
        updates.status = 'active';
      }

      await supabase.from('games').update(updates).eq('id', gameId);

      // Trigger webhook if the agent has registered one
      if (game.webhook_url && updates.status !== 'finished') {
        try {
          fetch(game.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'your_turn',
              game_id: gameId,
              fen: updates.fen,
              last_move: {
                from,
                to,
                san: move.san
              }
            })
          }).catch(err => console.error('Webhook failed to send:', err));
        } catch (e) {
          console.error('Webhook error:', e);
        }
      }

    } catch (e) {
      toast.error('Illegal move');
    }
  };

  const playAgain = async () => {
    await supabase.from('games').update({
      status: 'active',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      turn: 'w',
      move_history: [],
      thinking_log: [],
      current_thinking: '',
      result: null,
      result_reason: null
    }).eq('id', gameId);
    setGameOver(false);
  };

  const resign = async () => {
    if (confirm('Are you sure you want to resign?')) {
      await supabase.from('games').update({
        status: 'finished',
        result: 'black',
        result_reason: 'resignation'
      }).eq('id', gameId);
    }
  };

  const copyPgn = () => {
    const chess = new Chess();
    if (game.move_history && game.move_history.length > 0) {
      game.move_history.forEach(m => {
        try { chess.move(m.san); } catch (e) {}
      });
    }
    navigator.clipboard.writeText(chess.pgn());
    toast.success('PGN copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white font-mono">
        Loading game...
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white font-mono">
        Game not found
      </div>
    );
  }

  const chess = new Chess(game.fen);
  const isMyTurn = game.turn === 'w' && game.agent_connected && game.status !== 'finished';
  const isAgentTurn = game.turn === 'b' && game.agent_connected && game.status !== 'finished';
  const lastMove = (game.move_history || [])[(game.move_history || []).length - 1] || null;
  const lastThinking = (game.thinking_log || [])[(game.thinking_log || []).length - 1] || null;
  const currentMoveNumber = Math.floor((game.move_history || []).length / 2) + 1;
  const agentUrl = `${window.location.origin}/Agent?id=${gameId}`;

  let statusMessage = '';
  let statusColor = '';
  let statusBg = '';
  let statusBorder = '';

  if (game.status === 'finished') {
    if (game.result === 'white') {
      statusMessage = '🏆 CHECKMATE! YOU WIN!';
      statusColor = '#2dc653';
    } else if (game.result === 'black') {
      statusMessage = '💀 CHECKMATE. OPENCLAW WINS.';
      statusColor = '#e63946';
    } else {
      statusMessage = '🤝 DRAW';
      statusColor = '#c9973a';
    }
    statusBg = '#1c1c1c';
    statusBorder = '#333';
  } else if (!game.agent_connected) {
    statusMessage = '⏳ WAITING FOR OPENCLAW TO JOIN...';
    statusColor = '#c9973a';
    statusBg = '#1c1c1c';
    statusBorder = '#333';
  } else if (isMyTurn) {
    if (chess.inCheck()) {
      statusMessage = '⚠️ YOU ARE IN CHECK! YOUR MOVE (WHITE)';
      statusColor = '#e63946';
    } else {
      statusMessage = '♟ YOUR TURN — MAKE YOUR MOVE (WHITE)';
      statusColor = '#2dc653';
    }
    statusBg = '#1a2e1a';
    statusBorder = '#2dc653';
  } else if (isAgentTurn) {
    if (chess.inCheck()) {
      statusMessage = '⚠️ OPENCLAW IS IN CHECK — THINKING...';
      statusColor = '#c9973a';
    } else {
      statusMessage = '🤖 OPENCLAW IS THINKING...';
      statusColor = '#a0a0a0';
    }
    statusBg = '#1a1a2e';
    statusBorder = '#a0a0a0';
  } else {
    statusMessage = 'WAITING...';
    statusColor = '#666';
    statusBg = '#1c1c1c';
    statusBorder = '#333';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] flex flex-col font-mono pb-20">
      {/* HEADER */}
      <div className="bg-[#1c1c1c] border-b border-[#c9973a] px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699888c91e97454c7b995e2f/5384ee56f_gpt-image-15-high-fidelity_a_Make_a_logo_for_my_a.png" 
            alt="Logo" 
            className="w-10 h-10 rounded-full border border-[#c9973a]"
          />
          <h1 className="text-xl sm:text-2xl text-[#c9973a] font-serif" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Chess vs OpenClaw
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {game.status === 'active' && (
            <button 
              onClick={resign}
              className="text-xs sm:text-sm text-red-400 hover:text-red-300 border border-red-900 hover:border-red-500 px-3 py-1 rounded transition-colors"
            >
              Resign
            </button>
          )}
          <button 
            onClick={copyPgn}
            className="text-xs sm:text-sm text-[#a0a0a0] hover:text-[#f0f0f0] border border-[#333] hover:border-[#666] px-3 py-1 rounded transition-colors"
          >
            Copy PGN
          </button>
          <div className="text-[#666] text-xs sm:text-sm hidden sm:block">
            Room: {gameId.substring(0, 6)}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 gap-6 max-w-[1400px] mx-auto w-full">
        {/* LEFT: Chess Board */}
        <div className="flex-shrink-0 w-full lg:w-auto flex justify-center overflow-hidden">
          <div className="scale-[0.58] sm:scale-75 md:scale-90 lg:scale-100 origin-top">
            <ChessBoard 
              fen={game.fen} 
              onMove={makeMove} 
              isMyTurn={isMyTurn} 
              lastMove={lastMove} 
            />
          </div>
        </div>

        {/* RIGHT: Panels */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-6 min-w-0">
          <ThinkingPanel 
            agentConnected={game.agent_connected}
            agentUrl={agentUrl}
            currentThinking={game.current_thinking}
            lastThinking={lastThinking}
            isAgentTurn={isAgentTurn}
            isHumanTurn={isMyTurn}
          />
          <div className="flex-1 min-h-[250px]">
            <MoveHistory 
              moveHistory={game.move_history || []} 
              currentMoveNumber={currentMoveNumber} 
            />
          </div>
        </div>
      </div>

      {/* FIXED BOTTOM STATUS BAR */}
      <div 
        className="fixed bottom-0 left-0 right-0 border-t-4 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-20 transition-colors duration-300"
        style={{ backgroundColor: statusBg, borderColor: statusBorder }}
      >
        <div className="flex items-center gap-3">
          <div 
            className={`w-3 h-3 rounded-full ${isMyTurn ? 'animate-pulse' : ''}`} 
            style={{ backgroundColor: statusColor }}
          />
          <span className="font-bold text-sm sm:text-base" style={{ color: statusColor }}>
            {statusMessage}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#a0a0a0] text-xs sm:text-sm">
          <span className="hidden sm:inline">Move: {currentMoveNumber}</span>
          <div className="flex items-center gap-2" title={game.agent_connected ? "Agent Online" : "Agent Offline"}>
            <div className={`w-2 h-2 rounded-full ${game.agent_connected ? 'bg-[#2dc653]' : 'bg-red-500'}`} />
            <span className="hidden sm:inline">Agent</span>
          </div>
        </div>
      </div>

      {/* GAME OVER MODAL */}
      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border-4 border-[#c9973a] rounded-xl p-8 max-w-md w-full text-center shadow-2xl transform animate-in fade-in zoom-in duration-300">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699888c91e97454c7b995e2f/5384ee56f_gpt-image-15-high-fidelity_a_Make_a_logo_for_my_a.png" 
              alt="Logo" 
              className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-[#c9973a]"
            />
            <h2 className="text-3xl font-bold text-[#c9973a] mb-2 font-serif">
              {game.result === 'white' ? '🏆 You Win!' : game.result === 'black' ? '💀 You Lose' : '🤝 Draw'}
            </h2>
            <p className="text-[#f0f0f0] mb-6">
              {game.result_reason === 'checkmate' ? `Checkmate on move ${currentMoveNumber}` : 
               game.result_reason === 'stalemate' ? 'Stalemate' : 
               'Draw by repetition or insufficient material'}
            </p>
            
            <hr className="border-[#333] mb-6" />
            
            <div className="text-[#a0a0a0] mb-8">
              Total Moves: {(game.move_history || []).length}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={playAgain}
                className="w-full bg-[#c9973a] hover:bg-[#e8b84b] text-black font-bold py-3 px-4 rounded transition-transform hover:scale-105"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={copyPgn}
                className="w-full bg-transparent border border-[#333] hover:border-[#666] text-[#a0a0a0] hover:text-[#f0f0f0] font-bold py-3 px-4 rounded transition-colors"
              >
                COPY PGN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
