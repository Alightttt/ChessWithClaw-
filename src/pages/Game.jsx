'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Chess } from 'chess.js';
import { useToast } from '../contexts/ToastContext';
import { Settings, X, Pause, Play, Flag, Share2, Volume2, VolumeX, Download, ChevronDown, Copy, Check, Send, Twitter } from 'lucide-react';
import html2canvas from 'html2canvas';
import ChessBoard from '../components/chess/ChessBoard';
import ThinkingPanel from '../components/chess/ThinkingPanel';
import ChatBox from '../components/chess/ChatBox';
import CapturedPieces from '../components/chess/CapturedPieces';
import MoveHistory from '../components/MoveHistory';
import { supabase, getSupabaseWithToken } from '../lib/supabase';
import { Button, Card, Modal, StatusDot, Divider, Badge } from '../components/ui';

function GameTimer({ startTime, status }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime || status === 'finished') return;
    const start = new Date(startTime).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, status]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return <span>{mins}:{secs.toString().padStart(2, '0')}</span>;
}

export default function Game() {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('id');
  const { toast } = useToast();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThinkingMobile, setShowThinkingMobile] = useState(false);
  const [showMoveHistoryMobile, setShowMoveHistoryMobile] = useState(false);
  const [boardTheme, setBoardTheme] = useState('green');
  const [pieceTheme, setPieceTheme] = useState('merida');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [agentConnectedTime, setAgentConnectedTime] = useState(null);
  const [showFallbackName, setShowFallbackName] = useState(false);
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [confirmResign, setConfirmResign] = useState(false);
  const [confirmDraw, setConfirmDraw] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const audioCtxRef = useRef(null);
  const prevMoveCountRef = useRef(0);
  const prevStatusRef = useRef('waiting');
  const boardRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatScrollRef = useRef(null);

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;
    
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([{ message: feedbackText.trim() }]);

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      setShowFeedback(false);
      setFeedbackText('');
    } catch (error) {
      console.error('Feedback error:', error);
      toast.error('Failed to submit feedback: ' + (error.message || 'Unknown error'));
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport && chatContainerRef.current) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        chatContainerRef.current.style.paddingBottom = `${keyboardHeight}px`;
      }
    };
    
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (game?.agent_connected) {
      if (!agentConnectedTime) {
        setAgentConnectedTime(Date.now());
      }
    } else {
      setAgentConnectedTime(null);
      setShowFallbackName(false);
    }
  }, [game?.agent_connected, agentConnectedTime]);

  useEffect(() => {
    if (agentConnectedTime && game?.agent_name === 'Your Agent') {
      const interval = setInterval(() => {
        if (Date.now() - agentConnectedTime >= 30000) {
          setShowFallbackName(true);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setShowFallbackName(false);
    }
  }, [agentConnectedTime, game?.agent_name]);

  const playSound = (type) => {
    if (!soundEnabled) return;
    
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      
      if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'capture') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'check') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  useEffect(() => {
    if (!game) return;
    
    const currentMoveCount = (game.move_history || []).length;
    const currentStatus = game.status;
    
    if (currentMoveCount > prevMoveCountRef.current) {
      const chess = new Chess(game.fen);
      const lastMove = game.move_history[currentMoveCount - 1];
      
      if (chess.inCheck()) {
        playSound('check');
      } else if (lastMove && lastMove.san.includes('x')) {
        playSound('capture');
      } else {
        playSound('move');
      }
    }
    
    if (currentStatus === 'finished' && prevStatusRef.current !== 'finished') {
      playSound('gameover');
    }
    
    prevMoveCountRef.current = currentMoveCount;
    prevStatusRef.current = currentStatus;
  }, [game?.move_history, game?.status, game?.fen]);

  const channelRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectDelayRef = useRef(1000);

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
        if (data.status === 'finished') setGameOver(true);
        await getSupabaseWithToken(localStorage.getItem(`game_owner_${gameId}`)).from('games').update({ human_connected: true }).eq('id', gameId);
        if (data.webhook_url) {
          fetch('/api/trigger-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: gameId, event: 'human_connected' })
          }).catch(() => {});
        }
      }
      setLoading(false);
    };

    loadGame();

    const connectChannel = () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase.channel(`game-${gameId}`);
      channelRef.current = channel;

      channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, (payload) => {
        setGame(payload.new);
        if (!payload.new.human_connected) {
          getSupabaseWithToken(localStorage.getItem(`game_owner_${gameId}`)).from('games').update({ human_connected: true }).eq('id', gameId);
          if (payload.new.webhook_url) {
            fetch('/api/trigger-webhook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: gameId, event: 'human_connected' })
            }).catch(() => {});
          }
        }
        if (payload.new.status === 'finished') {
          setGameOver(true);
        }
      }).subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          reconnectDelayRef.current = 1000;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000);
            connectChannel();
          }, reconnectDelayRef.current);
        }
      });
    };

    connectChannel();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        connectChannel();
      } else {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleBeforeUnload = () => {
      getSupabaseWithToken(localStorage.getItem(`game_owner_${gameId}`)).from('games').update({ human_connected: false }).eq('id', gameId);
      fetch('/api/trigger-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: gameId, event: 'human_disconnected' })
      }).catch(() => {});
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const heartbeatInterval = setInterval(() => {
      fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: gameId, role: 'human' })
      }).catch(() => {});
    }, 15000);

    return () => {
      clearInterval(heartbeatInterval);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      getSupabaseWithToken(localStorage.getItem(`game_owner_${gameId}`)).from('games').update({ human_connected: false }).eq('id', gameId);
      fetch('/api/trigger-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: gameId, event: 'human_disconnected' })
      }).catch(() => {});
    };
  }, [gameId]);

  const makeMove = async (from, to, promotion) => {
    if (!game || game.turn !== 'w' || !isMyTurn) return;
    
    if (!localStorage.getItem(`game_owner_${gameId}`)) {
      toast.error('You are not the creator of this game.');
      return;
    }

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
        uci: from + to + (promotion || ''),
        timestamp: Date.now()
      }];

      const updates = {
        fen: chess.fen(),
        turn: 'b',
        move_history: newMoveHistory,
        status: 'active',
        human_last_moved_at: new Date().toISOString()
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

      const previousGameState = { ...game };
      setGame(prev => ({ ...prev, ...updates }));

      if (move.captured && ['q', 'r', 'b', 'n'].includes(move.captured)) {
        const payload = {
          event: "eval_drastic_change",
          game_id: gameId,
          instruction: `The human just captured your ${move.captured}. React to this drastic change in the chat!`,
          fen: chess.fen(),
          move: move.san
        };
        updates.pending_events = [...(game.pending_events || []), payload];
      }

      const { error: updateError } = await getSupabaseWithToken(localStorage.getItem(`game_owner_${gameId}`)).from('games').update(updates).eq('id', gameId);

      if (updateError) {
        toast.error('Failed to sync move with server');
        setGame(previousGameState);
        return;
      }

      if (game.webhook_url) {
        try {
          fetch('/api/trigger-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: gameId,
              event: updates.status === 'finished' ? 'game_over' : 'your_turn',
              extraData: {
                last_move: {
                  from,
                  to,
                  san: move.san
                }
              }
            })
          }).catch(err => console.error('Webhook trigger failed:', err));
        } catch (e) {
          console.error('Webhook error:', e);
        }
      }

    } catch (e) {
      toast.error('Illegal move');
    }
  };

  const triggerWebhook = (event, extraData = {}) => {
    if (game && game.webhook_url) {
      try {
        fetch('/api/trigger-webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: gameId,
            event,
            extraData
          })
        }).catch(err => console.error('Webhook trigger failed:', err));
      } catch (e) {
        console.error('Webhook error:', e);
      }
    }
  };

  const playAgain = async () => {
    await getSupabaseWithToken(localStorage.getItem(`game_owner_${gameId}`)).from('games').update({
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
    triggerWebhook('game_restarted');
  };

  const handleResign = async () => {
    if (!confirmResign) {
      setConfirmResign(true);
      setTimeout(() => setConfirmResign(false), 3000);
      return;
    }
    await getSupabaseWithToken(localStorage.getItem(`game_owner_${gameId}`)).from('games').update({
      status: 'finished',
      result: 'black',
      result_reason: 'resignation'
    }).eq('id', gameId);
    triggerWebhook('game_over', { status: 'finished', result: 'black', result_reason: 'resignation' });
    setShowSettings(false);
    setConfirmResign(false);
  };

  const handleDraw = async () => {
    if (!confirmDraw) {
      setConfirmDraw(true);
      setTimeout(() => setConfirmDraw(false), 3000);
      return;
    }
    await getSupabaseWithToken(localStorage.getItem(`game_owner_${gameId}`)).from('games').update({
      status: 'finished',
      result: 'draw',
      result_reason: 'agreement'
    }).eq('id', gameId);
    triggerWebhook('game_over', { status: 'finished', result: 'draw', result_reason: 'agreement' });
    setShowSettings(false);
    setConfirmDraw(false);
  };

  const acceptAgentResignation = async () => {
    await getSupabaseWithToken(localStorage.getItem(`game_owner_${gameId}`)).from('games').update({
      status: 'finished',
      result: 'white',
      result_reason: 'resignation'
    }).eq('id', gameId);
    triggerWebhook('game_over', { status: 'finished', result: 'white', result_reason: 'resignation' });
  };

  const acceptDraw = async () => {
    await getSupabaseWithToken(localStorage.getItem(`game_owner_${gameId}`)).from('games').update({
      status: 'finished',
      result: 'draw',
      result_reason: 'agreement'
    }).eq('id', gameId);
    triggerWebhook('game_over', { status: 'finished', result: 'draw', result_reason: 'agreement' });
  };

  const pauseGame = async () => {
    await getSupabaseWithToken(localStorage.getItem(`game_owner_${gameId}`)).from('games').update({ status: 'paused' }).eq('id', gameId);
    toast.success('Game paused');
    triggerWebhook('game_paused');
  };

  const resumeGame = async () => {
    await getSupabaseWithToken(localStorage.getItem(`game_owner_${gameId}`)).from('games').update({ status: 'active' }).eq('id', gameId);
    toast.success('Game resumed');
    triggerWebhook('game_resumed');
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    
    const text = chatInput;
    setChatInput('');
    
    const sanitizeText = (str) => {
      return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };
    const sanitizedText = sanitizeText(text);
    const newMessage = { sender: 'human', text: sanitizedText, timestamp: Date.now() };
    
    setGame(prev => ({ ...prev, chat_history: [...(prev.chat_history || []), newMessage] }));
    
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: gameId, text: sanitizedText, sender: 'human' })
      });
    } catch (e) {
      console.error('Failed to send message:', e);
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

  const shareGame = async (action) => {
    try {
      const agentName = showFallbackName ? 'Connected Agent' : (game.agent_name || 'my OpenClaw agent');
      const resultText = game.result === 'white' ? `I beat ${agentName}` : game.result === 'black' ? `${agentName} beat me` : `I drew against ${agentName}`;
      const shareText = `${resultText} in ${currentMoveNumber} moves! 🦞♟️\n\nPlay against it here: ${window.location.origin}`;
      
      if (action === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank');
        return;
      }

      toast.info('Generating screenshot...');
      const boardElement = boardRef.current;
      if (!boardElement) throw new Error('Board not found');
      
      const canvas = await html2canvas(boardElement, {
        backgroundColor: 'var(--color-bg-base)',
        scale: 2,
        useCORS: true
      });
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chesswithclaw-${gameId.substring(0, 6)}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Screenshot downloaded!');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share game');
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(gameId);
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2000);
  };

  const captured = useMemo(() => {
    if (!game?.fen) return { white_lost: {}, black_lost: {} };
    const fenBoard = game.fen.split(' ')[0];
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
  }, [game?.fen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex flex-col font-sans pb-[72px] md:pb-0">
        <header className="h-14 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--color-bg-elevated)] animate-[shimmer_1.5s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)', backgroundSize: '200% 100%' }}></div>
            <div className="w-32 h-4 bg-[var(--color-bg-elevated)] rounded animate-[shimmer_1.5s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)', backgroundSize: '200% 100%' }}></div>
          </div>
        </header>
        <main className="flex-1 flex flex-col md:flex-row max-w-[1400px] mx-auto w-full p-0 md:p-6 gap-0 md:gap-6 overflow-hidden">
          <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col gap-2 md:gap-4 shrink-0">
            <div className="px-4 md:px-0 flex justify-start h-6 items-center"></div>
            <div className="relative w-full aspect-square md:rounded-lg overflow-hidden border-y md:border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] animate-[shimmer_1.5s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)', backgroundSize: '200% 100%' }}></div>
            <div className="px-4 md:px-0 flex justify-start h-6 items-center"></div>
          </div>
          <div className="flex-1 flex flex-col gap-4 min-w-0 px-4 md:px-0 pb-4 md:pb-0 h-full overflow-hidden mt-4 md:mt-0">
            <div className="hidden md:flex items-center gap-4 p-4 shrink-0 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-lg">
              <div className="w-12 h-12 rounded-full bg-[var(--color-bg-elevated)] animate-[shimmer_1.5s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)', backgroundSize: '200% 100%' }}></div>
              <div className="flex flex-col gap-2 w-full">
                <div className="w-1/2 h-5 bg-[var(--color-bg-elevated)] rounded animate-[shimmer_1.5s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)', backgroundSize: '200% 100%' }}></div>
                <div className="w-1/3 h-3 bg-[var(--color-bg-elevated)] rounded animate-[shimmer_1.5s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)', backgroundSize: '200% 100%' }}></div>
              </div>
            </div>
            <div className="flex-1 min-h-[250px] flex flex-col bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shrink-0">
                <div className="w-20 h-4 bg-[var(--color-bg-base)] rounded animate-[shimmer_1.5s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)', backgroundSize: '200% 100%' }}></div>
              </div>
              <div className="flex-1 p-4 flex flex-col gap-4">
                <div className="w-2/3 h-10 bg-[var(--color-bg-elevated)] rounded-2xl rounded-tl-none animate-[shimmer_1.5s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)', backgroundSize: '200% 100%' }}></div>
                <div className="w-1/2 h-10 bg-[var(--color-bg-elevated)] rounded-2xl rounded-tr-none self-end animate-[shimmer_1.5s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)', backgroundSize: '200% 100%' }}></div>
                <div className="w-3/4 h-16 bg-[var(--color-bg-elevated)] rounded-2xl rounded-tl-none animate-[shimmer_1.5s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)', backgroundSize: '200% 100%' }}></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center text-[var(--color-text-primary)] font-sans">
        Game not found
      </div>
    );
  }

  if (game.status === 'abandoned') {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex flex-col items-center justify-center text-[var(--color-text-primary)] font-sans p-4">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-lg p-8 max-w-md w-full text-center shadow-2xl">
          <h2 className="text-2xl font-bold text-[var(--color-red-primary)] mb-4">Game Expired</h2>
          <p className="text-[var(--color-text-secondary)] mb-8">This game was abandoned and has expired.</p>
          <Button onClick={() => window.location.href = '/'} className="w-full" size="lg">
            Start New Game
          </Button>
        </div>
      </div>
    );
  }

  const isMyTurn = game.turn === 'w' && (game.status === 'active' || game.status === 'waiting');
  const isAgentTurn = game.turn === 'b' && (game.status === 'active' || game.status === 'waiting');
  const lastMove = (game.move_history || [])[(game.move_history || []).length - 1] || null;
  const lastThinking = (game.thinking_log || [])[(game.thinking_log || []).length - 1] || null;
  const currentMoveNumber = Math.floor((game.move_history || []).length / 2) + 1;
  const agentUrl = `${window.location.origin}/Agent?id=${gameId}`;

  const displayAvatar = showFallbackName ? '🤖' : (game.agent_avatar || '🤖');
  const displayName = showFallbackName ? 'CONNECTED AGENT' : (game.agent_name ? game.agent_name.toUpperCase() : 'YOUR AGENT');

  let agentStatusColor = 'offline';
  let agentStatusText = 'Waiting for agent to join...';
  
  if (game.agent_connected) {
    if (game.turn === 'w') {
      agentStatusColor = 'online';
      agentStatusText = 'Watching your move...';
    } else {
      if (game.current_thinking) {
        agentStatusColor = 'warning';
        agentStatusText = 'Agent is thinking...';
      } else {
        agentStatusColor = 'online';
        agentStatusText = 'Agent is deciding...';
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex flex-col font-sans pb-[72px] md:pb-0">
      {/* ERROR STATES / BANNERS */}
      {/* Removed connection banner logic as per instructions not to add new state, but we can add static ones if needed. We'll skip complex banners to avoid breaking logic. */}

      {/* HEADER */}
      <header className="h-14 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699888c91e97454c7b995e2f/5384ee56f_gpt-image-15-high-fidelity_a_Make_a_logo_for_my_a.png" 
            alt="Logo" 
            className="w-6 h-6 rounded-full border border-[var(--color-border-subtle)] object-cover"
          />
          <span className="font-bold text-[var(--color-text-primary)] hidden sm:block">ChessWithClaw</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={copyRoomCode} 
            className="flex items-center gap-2 px-3 py-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-md font-mono text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors relative"
            title="Copy Game ID"
          >
            Room #{gameId.substring(0, 6).toUpperCase()}
            {copiedRoom ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
          <button 
            onClick={() => setShowSettings(true)} 
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors rounded-md hover:bg-[var(--color-bg-elevated)]"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 flex flex-col md:flex-row max-w-[1400px] mx-auto w-full p-0 md:p-6 gap-0 md:gap-6 overflow-hidden">
        
        {/* MOBILE AGENT STATUS BAR */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{displayAvatar}</div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[var(--color-text-primary)]">{displayName}</span>
              <div className="flex items-center gap-1.5">
                <StatusDot status={agentStatusColor} />
                <span className={`text-xs ${!game.agent_connected ? 'animate-pulse text-[var(--color-text-muted)]' : 'text-[var(--color-text-secondary)]'}`}>
                  {agentStatusText}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN (Chess Board + Move History) */}
        <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col gap-2 md:gap-4 shrink-0">
          {/* Captured pieces top */}
          <div className="px-4 md:px-0 flex justify-start h-6 items-center">
            <CapturedPieces pieces={captured.white_lost} isWhitePieces={true} />
          </div>

          {/* Board */}
          <div className="relative w-full aspect-square md:rounded-lg overflow-hidden border-y md:border border-[var(--color-red-primary)]/20 bg-[var(--color-bg-surface)]" ref={boardRef}>
            <ChessBoard 
              fen={game.fen} 
              onMove={makeMove} 
              isMyTurn={isMyTurn} 
              lastMove={lastMove} 
              boardTheme={boardTheme}
              pieceTheme={pieceTheme}
            />
            {game.status === 'finished' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center p-6 bg-[var(--color-bg-surface)]/90 border border-[var(--color-border-subtle)] rounded-xl shadow-2xl transform scale-110">
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg">
                    {game.result_reason === 'checkmate' ? (game.result === 'white' ? 'Checkmate! You Won!' : 'Checkmate! Agent Won!') : 
                     game.result_reason === 'stalemate' ? 'Draw — Stalemate' : 
                     game.result_reason === 'resignation' ? (game.result === 'white' ? 'Agent Resigned! You Won!' : 'You Resigned! Agent Won!') :
                     'Draw'}
                  </h2>
                </div>
              </div>
            )}
          </div>

          {/* Captured pieces bottom */}
          <div className="px-4 md:px-0 flex justify-start h-6 items-center">
            <CapturedPieces pieces={captured.black_lost} isWhitePieces={false} />
          </div>

          {/* DESKTOP MOVE HISTORY OR GAME OVER PANEL */}
          {game.status === 'finished' ? (
            <div className="hidden md:block mt-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-lg p-6 shadow-lg">
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Final Moves</h4>
                  <div className="font-mono text-sm text-[var(--color-text-secondary)]">
                    {(game.move_history || []).slice(-5).map((m, i) => (
                      <span key={i} className="mr-2">{m.san}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Duration</h4>
                  <div className="font-mono text-sm text-[var(--color-text-secondary)]">
                    <GameTimer startTime={game.created_at} status={game.status} />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Material Captured</h4>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    <div className="flex gap-2 items-center">
                      <span className="w-12">You:</span> <CapturedPieces pieces={captured.white_lost} isWhitePieces={true} />
                    </div>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="w-12">Agent:</span> <CapturedPieces pieces={captured.black_lost} isWhitePieces={false} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={playAgain} variant="primary" className="flex-1">Rematch</Button>
                <Button onClick={() => shareGame('twitter')} variant="secondary" className="flex-1" leftIcon={<Share2 size={16} />}>Share Result</Button>
                <Button onClick={() => setShowFeedback(true)} variant="ghost" className="flex-1">Give Feedback</Button>
              </div>
            </div>
          ) : (
            <div className="hidden md:block h-[200px] shrink-0">
              <MoveHistory moveHistory={game.move_history || []} />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 px-4 md:px-0 pb-4 md:pb-0 h-full overflow-hidden mt-4 md:mt-0">
          
          {/* DESKTOP AGENT STATUS CARD */}
          <Card className="hidden md:flex items-center gap-4 p-4 shrink-0 bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)]">
            <div className="w-12 h-12 bg-[var(--color-bg-elevated)] rounded-full flex items-center justify-center text-2xl border border-[var(--color-border-subtle)]">
              {displayAvatar}
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[var(--color-text-primary)]">{displayName}</span>
              <div className="flex items-center gap-2 mt-1">
                <StatusDot status={agentStatusColor} />
                <span className={`text-sm ${!game.agent_connected ? 'animate-pulse text-[var(--color-text-muted)]' : 'text-[var(--color-text-secondary)]'}`}>
                  {agentStatusText}
                </span>
              </div>
            </div>
          </Card>

          {/* THINKING PANEL */}
          <div className="shrink-0">
            <button 
              className="md:hidden w-full py-3 flex items-center justify-between text-sm font-bold text-[var(--color-text-secondary)] border-b border-[var(--color-border-subtle)]" 
              onClick={() => setShowThinkingMobile(!showThinkingMobile)}
            >
              <div className="flex items-center gap-2">
                {game.current_thinking && <StatusDot status="warning" />}
                <span>{game.current_thinking ? 'Agent is thinking...' : 'Agent Thinking'}</span>
              </div>
              <ChevronDown className={`transform transition-transform ${showThinkingMobile ? 'rotate-180' : ''}`} />
            </button>
            <div className={`${showThinkingMobile ? 'block' : 'hidden'} md:block mt-2 md:mt-0`}>
              <ThinkingPanel 
                agentConnected={game.agent_connected}
                agentUrl={agentUrl}
                currentThinking={game.current_thinking}
                lastThinking={lastThinking}
                isAgentTurn={isAgentTurn}
                isHumanTurn={isMyTurn}
                agentName={displayName}
                agentAvatar={displayAvatar}
                agentTagline={game.agent_tagline || 'OpenClaw Agent'}
              />
            </div>
          </div>

          {/* LIVE CHAT */}
          <div className="flex-1 min-h-[250px] flex flex-col bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-lg overflow-hidden" ref={chatContainerRef}>
            <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shrink-0 flex justify-between items-center">
              <span className="text-sm font-bold text-[var(--color-text-primary)]">Live Chat</span>
              {game.current_thinking && (
                <span className="text-xs text-[var(--color-text-muted)] italic animate-pulse">Agent is typing...</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-0" ref={chatScrollRef}>
              <ChatBox 
                chatHistory={game.chat_history || []} 
                onSendMessage={sendMessage} 
                onAcceptResignation={acceptAgentResignation}
                onAcceptDraw={acceptDraw}
                agentName={displayName}
                agentAvatar={displayAvatar}
                hideInput={true}
              />
            </div>
            {/* Chat Input */}
            <form onSubmit={sendMessage} className="p-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shrink-0 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message your agent..."
                maxLength={500}
                className="flex-1 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-red-primary)] focus:ring-1 focus:ring-[var(--color-red-primary)] transition-all"
              />
              <Button type="submit" disabled={!chatInput.trim()} className="px-3" title="Send">
                <Send size={16} />
              </Button>
            </form>
          </div>

          {/* MOBILE MOVE HISTORY */}
          <div className="md:hidden shrink-0 mb-4">
            <button 
              className="w-full py-3 flex items-center justify-between text-sm font-bold text-[var(--color-text-secondary)] border-b border-[var(--color-border-subtle)]" 
              onClick={() => setShowMoveHistoryMobile(!showMoveHistoryMobile)}
            >
              <span>Move History</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{(game.move_history || []).length}</Badge>
                <ChevronDown className={`transform transition-transform ${showMoveHistoryMobile ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <div className={`${showMoveHistoryMobile ? 'block' : 'hidden'} h-[200px] mt-2`}>
              <MoveHistory moveHistory={game.move_history || []} />
            </div>
          </div>

        </div>
      </main>

      {/* MOBILE STATUS BAR (Fixed Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-subtle)] flex items-center px-4 z-20">
        <div className="flex-1 flex justify-start">
          {isMyTurn ? (
            <Badge className="bg-[var(--color-red-primary)] text-white border-none">YOUR TURN</Badge>
          ) : (
            <Badge variant="secondary">AGENT'S TURN</Badge>
          )}
        </div>
        <div className="flex-1 flex justify-center text-sm font-bold text-[var(--color-text-secondary)]">
          Move {currentMoveNumber}
        </div>
        <div className="flex-1 flex justify-end text-sm font-mono text-[var(--color-text-muted)]">
          <GameTimer startTime={game.created_at} status={game.status} />
        </div>
      </div>

      {/* SETTINGS MODAL */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Settings" size="md">
        <div className="space-y-8">
          {/* Board Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[var(--color-text-muted)] tracking-wider uppercase">Board Settings</h3>
            
            <div className="space-y-2">
              <label className="text-sm text-[var(--color-text-secondary)]">Theme</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'green', colors: ['#eeeed2', '#769656'] },
                  { id: 'classic', colors: ['#f0d9b5', '#b58863'] },
                  { id: 'blue', colors: ['#dee3e6', '#8ca2ad'] },
                  { id: 'purple', colors: ['#e1d5e6', '#8a789a'] },
                  { id: 'monochrome', colors: ['#e0e0e0', '#888888'] }
                ].map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setBoardTheme(theme.id)}
                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${boardTheme === theme.id ? 'border-[var(--color-red-primary)]' : 'border-transparent hover:border-[var(--color-border-default)]'}`}
                    title={theme.id}
                  >
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                      <div style={{ backgroundColor: theme.colors[0] }}></div>
                      <div style={{ backgroundColor: theme.colors[1] }}></div>
                      <div style={{ backgroundColor: theme.colors[1] }}></div>
                      <div style={{ backgroundColor: theme.colors[0] }}></div>
                    </div>
                    {boardTheme === theme.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check size={16} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[var(--color-text-secondary)]">Pieces</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'merida', label: 'Merida', icon: '♘' },
                  { id: 'cburnett', label: 'Standard', icon: '♞' },
                  { id: 'alpha', label: 'Alpha', icon: '♙' },
                  { id: 'unicode', label: 'Classic', icon: '♚' }
                ].map(piece => (
                  <button
                    key={piece.id}
                    onClick={() => setPieceTheme(piece.id)}
                    className={`flex items-center gap-3 p-3 rounded-md border transition-all ${pieceTheme === piece.id ? 'bg-[var(--color-red-primary)]/10 border-[var(--color-red-primary)] text-white' : 'bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)] hover:text-white'}`}
                  >
                    <span className="text-2xl leading-none">{piece.icon}</span>
                    <span className="text-sm font-medium">{piece.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Divider />

          {/* Game Controls */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[var(--color-text-muted)] tracking-wider uppercase">Game Controls</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleDraw}
                disabled={game.status === 'finished'}
                variant="secondary"
                className={confirmDraw ? 'bg-yellow-600/20 text-yellow-500 border-yellow-600/50 hover:bg-yellow-600/30' : ''}
              >
                {confirmDraw ? 'Confirm Draw?' : 'Offer Draw'}
              </Button>
              
              <Button 
                onClick={handleResign}
                disabled={game.status === 'finished'}
                variant="danger"
                className={confirmResign ? 'animate-pulse' : ''}
                leftIcon={!confirmResign && <Flag size={16} />}
              >
                {confirmResign ? 'Confirm Resign?' : 'Resign'}
              </Button>
            </div>
          </div>

          <Divider />

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Sound Effects</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Play sounds for moves and captures</p>
            </div>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-md transition-colors ${soundEnabled ? 'bg-[var(--color-red-primary)] text-white' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]'}`}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>
      </Modal>

      {/* GAME OVER MODAL */}
      <Modal
        open={gameOver}
        onClose={() => {}}
        title={game.result === 'white' ? '🏆 You Win!' : game.result === 'black' ? '💀 You Lose' : '🤝 Draw'}
        size="sm"
      >
        <div className="text-center">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699888c91e97454c7b995e2f/5384ee56f_gpt-image-15-high-fidelity_a_Make_a_logo_for_my_a.png" 
            alt="Logo" 
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="w-20 h-20 mx-auto mb-6 rounded-full border border-[var(--color-border-subtle)] object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=400&q=80";
            }}
          />
          <p className="text-[var(--color-text-secondary)] mb-6">
            {game.result_reason === 'checkmate' ? `Checkmate on move ${currentMoveNumber}` : 
             game.result_reason === 'stalemate' ? 'Stalemate' : 
             game.result_reason === 'resignation' ? 'Resignation' :
             'Draw by agreement or insufficient material'}
          </p>
          
          <Divider className="mb-6" />
          
          <div className="text-[var(--color-text-secondary)] mb-8">
            Total Moves: {(game.move_history || []).length}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button onClick={() => shareGame('download')} variant="secondary" className="flex-1" leftIcon={<Download size={18} />}>
                Save Image
              </Button>
              <Button onClick={() => shareGame('twitter')} variant="secondary" className="flex-1 bg-black hover:bg-zinc-900 border-zinc-800 text-white" leftIcon={<Twitter size={16} />}>
                Share
              </Button>
            </div>
            <Button onClick={playAgain} variant="primary" size="lg" className="w-full">
              PLAY AGAIN
            </Button>
            <Button onClick={copyPgn} variant="ghost" size="lg" className="w-full border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]">
              COPY PGN
            </Button>
          </div>
        </div>
      </Modal>
      {/* FEEDBACK MODAL */}
      <Modal open={showFeedback} onClose={() => setShowFeedback(false)} title="Send Feedback">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Have a suggestion or found a bug? Let us know!
          </p>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Your feedback..."
            className="w-full h-32 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-md p-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-red-primary)] resize-none"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowFeedback(false)}>Cancel</Button>
            <Button onClick={submitFeedback} disabled={!feedbackText.trim()}>Submit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
