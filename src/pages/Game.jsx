'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Chess } from 'chess.js';
import { toast } from 'sonner';
import ChessBoard from '../components/chess/ChessBoard';
import ThinkingPanel from '../components/chess/ThinkingPanel';
import ChatBox from '../components/chess/ChatBox';
import CapturedPieces from '../components/chess/CapturedPieces';
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
              },
              chat_history: game.chat_history || []
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
      result_reason: null,
      chat_history: []
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

  const sendMessage = async (text) => {
    const newMessage = { sender: 'human', text, timestamp: Date.now() };
    const newHistory = [...(game.chat_history || []), newMessage];
    
    // Optimistic update
    setGame(prev => ({ ...prev, chat_history: newHistory }));
    
    await supabase.from('games').update({ chat_history: newHistory }).eq('id', gameId);

    // Trigger webhook if the agent has registered one
    if (game.webhook_url) {
      try {
        fetch(game.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'chat_message',
            game_id: gameId,
            message: newMessage,
            chat_history: newHistory
          })
        }).catch(err => console.error('Webhook failed to send chat:', err));
      } catch (e) {
        console.error('Webhook error:', e);
      }
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
      statusMessage = '💀 CHECKMATE. CLAW WINS.';
      statusColor = '#e63946';
    } else {
      statusMessage = '🤝 DRAW';
      statusColor = '#c9973a';
    }
    statusBg = '#1c1c1c';
    statusBorder = '#333';
  } else if (!game.agent_connected) {
    statusMessage = '⏳ WAITING FOR CLAW TO JOIN...';
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
      statusMessage = '⚠️ CLAW IS IN CHECK — THINKING...';
      statusColor = '#c9973a';
    } else {
      statusMessage = '🤖 CLAW IS THINKING...';
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

  const getCapturedPieces = (fen) => {
    if (!fen) return { white_lost: {}, black_lost: {} };
    const fenBoard = fen.split(' ')[0];
    const counts = { p:0, n:0, b:0, r:0, q:0, P:0, N:0, B:0, R:0, Q:0 };
    for (let char of fenBoard) {
      if (counts[char] !== undefined) counts[char]++;
    }
    return {
      white_lost: { 
        P: Math.max(0, 8 - counts.P), N: Math.max(0, 2 - counts.N), 
        B: Math.max(0, 2 - counts.B), R: Math.max(0, 2 - counts.R), Q: Math.max(0, 1 - counts.Q) 
      },
      black_lost: { 
        p: Math.max(0, 8 - counts.p), n: Math.max(0, 2 - counts.n), 
        b: Math.max(0, 2 - counts.b), r: Math.max(0, 2 - counts.r), q: Math.max(0, 1 - counts.q) 
      }
    };
  };

  const captured = getCapturedPieces(game?.fen);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] flex flex-col font-mono pb-20">
      {/* HEADER */}
      <div className="bg-[#1c1c1c] border-b border-[#c9973a] px-3 sm:px-6 h-14 sm:h-16 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699888c91e97454c7b995e2f/5384ee56f_gpt-image-15-high-fidelity_a_Make_a_logo_for_my_a.png" 
            alt="Logo" 
            className="w-10 h-10 rounded-full border border-[#c9973a]"
          />
          <h1 className="text-xl sm:text-2xl text-[#c9973a] font-serif" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            ChessWithClaw
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
      <div className="flex-1 flex flex-col lg:flex-row p-1.5 sm:p-6 gap-1.5 sm:gap-6 max-w-[1400px] mx-auto w-full pb-16 sm:pb-28">
        
        {/* MOBILE: Thinking Panel on top */}
        <div className="block lg:hidden w-full shrink-0">
          <ThinkingPanel 
            agentConnected={game.agent_connected}
            agentUrl={agentUrl}
            currentThinking={game.current_thinking}
            lastThinking={lastThinking}
            isAgentTurn={isAgentTurn}
            isHumanTurn={isMyTurn}
          />
        </div>

        {/* LEFT: Chess Board */}
        <div className="flex-shrink-0 w-full lg:w-auto flex flex-col items-center justify-center overflow-hidden gap-0.5 sm:gap-2">
          {/* Top: Agent (Black) captured pieces -> White pieces lost */}
          <div className="w-full flex justify-start px-1" style={{ maxWidth: 'min(100vw - 0.75rem, 100vh - 310px, 480px)' }}>
             <CapturedPieces pieces={captured.white_lost} isWhitePieces={true} />
          </div>
          
          <div className="w-full" style={{ maxWidth: 'min(100vw - 0.75rem, 100vh - 310px, 480px)' }}>
            <ChessBoard 
              fen={game.fen} 
              onMove={makeMove} 
              isMyTurn={isMyTurn} 
              lastMove={lastMove} 
            />
          </div>

          {/* Bottom: Human (White) captured pieces -> Black pieces lost */}
          <div className="w-full flex justify-start px-1" style={{ maxWidth: 'min(100vw - 0.75rem, 100vh - 310px, 480px)' }}>
             <CapturedPieces pieces={captured.black_lost} isWhitePieces={false} />
          </div>
        </div>

        {/* RIGHT: Panels */}
        <div className="flex-1 flex flex-col gap-1.5 sm:gap-6 min-w-0">
          <div className="hidden lg:block">
            <ThinkingPanel 
              agentConnected={game.agent_connected}
              agentUrl={agentUrl}
              currentThinking={game.current_thinking}
              lastThinking={lastThinking}
              isAgentTurn={isAgentTurn}
              isHumanTurn={isMyTurn}
            />
          </div>
          <div className="flex-1 flex flex-col min-h-[250px] sm:min-h-[300px]">
            <ChatBox 
              chatHistory={game.chat_history || []} 
              onSendMessage={sendMessage} 
            />
          </div>
        </div>
      </div>

      {/* FIXED BOTTOM STATUS BAR (Universal Information Tab) */}
      <div 
        className="fixed bottom-0 left-0 right-0 border-t-2 px-3 sm:px-6 h-14 sm:h-16 flex justify-between items-center z-20 transition-colors duration-300 backdrop-blur-md shrink-0"
        style={{ backgroundColor: `${statusBg}F2`, borderTopColor: statusBorder }}
      >
        <div className="flex flex-col justify-center h-full">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div 
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isMyTurn ? 'animate-pulse' : ''}`} 
              style={{ backgroundColor: statusColor }}
            />
            <span className="font-bold text-[10px] sm:text-base truncate max-w-[160px] sm:max-w-none" style={{ color: statusColor }}>
              {statusMessage}
            </span>
          </div>
          <span className="text-[9px] sm:text-xs text-[#a0a0a0] mt-0.5">
            {game.status === 'active' ? 'Match in progress' : 'Match concluded'}
          </span>
        </div>
        
        <div className="flex flex-col items-end justify-center h-full gap-0.5 text-[#a0a0a0]">
          <div className="flex items-center gap-1.5 sm:gap-3 text-[9px] sm:text-sm">
            <span className="font-mono">Move: {currentMoveNumber}</span>
            <span className="text-[#333] hidden sm:inline">|</span>
            <div className="flex items-center gap-1" title={game.agent_connected ? "Agent Online" : "Agent Offline"}>
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${game.agent_connected ? 'bg-[#2dc653]' : 'bg-red-500'}`} />
              <span className="font-bold">{game.agent_connected ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <span className="text-[8px] sm:text-[10px] text-[#666] font-mono tracking-widest uppercase">Room: {gameId.substring(0, 6)}</span>
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
