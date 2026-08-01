'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { Settings, X as XIcon, X, MessageCircle, Pause, Play, Flag, Share2, Volume2, VolumeX, Download, ChevronDown, Copy, Check, Send, Twitter, Clock, AlertTriangle, RotateCcw, History, MessageSquare } from 'lucide-react';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'motion/react';
import ChessBoard from '../components/chess/ChessBoard';
import { wN as WN } from '../components/chess/ChessPieces';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import StatusDot from '../components/ui/StatusDot';
import Divider from '../components/ui/Divider';
import Badge from '../components/ui/Badge';
import { useRipple } from '../hooks/useRipple';

const LobsterEmoji = () => <span style={{fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif', fontStyle:'normal'}}>🦞</span>;


const PIECE_LETTER_MAP = { K:'K', Q:'Q', R:'R', B:'B', N:'N' };
function sanToPieceImg(san, isWhiteMove, style) {
  if (!san) return { letter: null, rest: '' };
  const firstChar = san[0];
  if (PIECE_LETTER_MAP[firstChar]) return { letter: firstChar, rest: san.slice(1) };
  if (san.startsWith('O-O')) return { letter: 'K', rest: san };
  return { letter: 'P', rest: san };
}
function pieceImgUrl(letter, isWhite, style) {
  const s = style || 'neo';
  const code = (isWhite ? 'w' : 'b') + letter;
  return `https://images.chesscomfiles.com/chess-themes/pieces/${s}/150/${code}.png`;
}

const CloudBubble = ({ children, isPrevious, isHuman }) => {
  const bg = isHuman ? '#e63946' : '#f2f2f2';
  return (
  <div style={{
    position: 'relative',
    background: bg,
    color: isHuman ? 'white' : '#1a1a1a',
    borderRadius: '24px',
    padding: '14px 20px',
    fontSize: '15px',
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
    alignSelf: isHuman ? 'flex-end' : 'flex-start',
    wordBreak: 'break-word',
    marginTop: isPrevious ? '0' : '8px',
    zIndex: 0,
    opacity: isPrevious ? 0.7 : 1,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }}>
    {/* Cloud bumps */}
    <div style={{ position: 'absolute', top: '-10px', left: '15%', width: '30%', height: '30px', background: bg, borderRadius: '50%', zIndex: -1 }} />
    <div style={{ position: 'absolute', top: '-16px', left: '40%', width: '40%', height: '40px', background: bg, borderRadius: '50%', zIndex: -1 }} />
    <div style={{ position: 'absolute', top: '-8px', right: '10%', width: '25%', height: '25px', background: bg, borderRadius: '50%', zIndex: -1 }} />
    <div style={{ position: 'absolute', bottom: '-10px', left: '20%', width: '35%', height: '35px', background: bg, borderRadius: '50%', zIndex: -1 }} />
    <div style={{ position: 'absolute', bottom: '-8px', right: '15%', width: '30%', height: '30px', background: bg, borderRadius: '50%', zIndex: -1 }} />
    
    {!isPrevious && (
      <>
        {isHuman ? (
          <>
            <div style={{ position: 'absolute', right: '-12px', bottom: '10px', width: '12px', height: '12px', background: bg, borderRadius: '50%', zIndex: 1 }} />
            <div style={{ position: 'absolute', right: '-24px', bottom: '0px', width: '8px', height: '8px', background: bg, borderRadius: '50%', zIndex: 1 }} />
          </>
        ) : (
          <>
            <div style={{ position: 'absolute', left: '-12px', bottom: '10px', width: '12px', height: '12px', background: bg, borderRadius: '50%', zIndex: 1 }} />
            <div style={{ position: 'absolute', left: '-24px', bottom: '0px', width: '8px', height: '8px', background: bg, borderRadius: '50%', zIndex: 1 }} />
          </>
        )}
      </>
    )}
    <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
  </div>
  );
};

const CapturedPiecesRow = ({ byWhite, byBlack, pieceTheme, humanColor }) => {
  const getMaterialAdvantage = (w, b) => {
    const vals = {p:1, n:3, b:3, r:5, q:9};
    let wScore = 0; let bScore = 0;
    for(const t in w) wScore += (w[t]||0) * vals[t];
    for(const t in b) bScore += (b[t]||0) * vals[t];
    return { w: wScore - bScore, b: bScore - wScore };
  };
  const adv = getMaterialAdvantage(byWhite, byBlack);
  
  const humanCaptures = humanColor === 'w' ? byWhite : byBlack;
  const agentCaptures = humanColor === 'w' ? byBlack : byWhite;
  const humanAdv = humanColor === 'w' ? adv.w : adv.b;
  const agentAdv = humanColor === 'w' ? adv.b : adv.w;
  const humanIsWhite = humanColor === 'w';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', width: '100%', alignItems: 'center', background: 'transparent' }}>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
        {Object.entries(humanCaptures).flatMap(([t, n]) =>
          Array.from({ length: n }).map((_, i) => (
            <div key={t+i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 -2px' }}>
              <img src={pieceImgUrl(t.toUpperCase(), !humanIsWhite, pieceTheme)} alt={t} style={{ width: 16, height: 16, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }} />
            </div>
          ))
        )}
        {humanAdv > 0 && <span style={{ color: '#e63946', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>+{humanAdv}</span>}
      </div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {agentAdv > 0 && <span style={{ color: '#e63946', fontSize: 12, fontWeight: 'bold', marginRight: 4 }}>+{agentAdv}</span>}
        {Object.entries(agentCaptures).flatMap(([t, n]) =>
          Array.from({ length: n }).map((_, i) => (
            <div key={t+i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 -2px' }}>
              <img src={pieceImgUrl(t.toUpperCase(), humanIsWhite, pieceTheme)} alt={t} style={{ width: 16, height: 16, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const BottomStatusBar = ({ agentConnected, game, agentName, isMobile }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval;
    if (game?.status === 'active' && agentConnected) {
      const lastActionTime = game.updated_at ? new Date(game.updated_at).getTime() : Date.now();
      // immediately set to avoid 1s delay
      setElapsedTime(Math.floor((Date.now() - lastActionTime) / 1000));
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - lastActionTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [game?.status, agentConnected, game?.updated_at, game?.turn]);

  const formatTime = (seconds) => {
    const m = Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, '0');
    const s = (Math.max(0, seconds) % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const humanColor = game?.player_color || 'w';
  const isHumanTurn = game?.turn === humanColor && game?.status === 'active';
  
  if (!agentConnected) {
    return (
      <div style={{ flexShrink: 0, width: '100%', background: 'rgba(230,57,70,0.15)', borderTop: '1px solid rgba(230,57,70,0.3)', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 40, boxSizing: 'border-box', ...(isMobile ? {} : { borderRadius: '8px', border: '1px solid rgba(230,57,70,0.3)' }) }}>
        <AlertTriangle size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: '#fbbf24' }}>
          Your Agent is not here yet
        </span>
      </div>
    );
  }

  const pillBg = isHumanTurn ? '#22c55e' : '#e63946';
  const pillText = isHumanTurn ? 'Your turn' : `${agentName}'s turn`;

  return (
    <div style={{ flexShrink: 0, height: isMobile ? '56px' : '48px', background: isMobile ? '#1e1c1b' : '#111111', borderTopLeftRadius: isMobile ? '20px' : '8px', borderTopRightRadius: isMobile ? '20px' : '8px', borderBottomLeftRadius: isMobile ? '0' : '8px', borderBottomRightRadius: isMobile ? '0' : '8px', border: isMobile ? 'none' : '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 40, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'space-between' }}>
        <div style={{ background: pillBg, color: 'white', borderRadius: '8px', padding: '6px 16px', fontSize: '15px', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
          {pillText}
        </div>
        
        {game?.status === 'active' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(242,242,242,0.7)', fontFamily: 'monospace', fontSize: '15px' }}>
            <Clock size={16} />
            <span>{formatTime(elapsedTime)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Game() {
  const { id: gameId } = useParams();
  const agentToken = null;
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  
  const [game, setGame] = useState(null);

  useEffect(() => {
    if (document.getElementById('cwc-styles-v2')) return;
    const style = document.createElement('style');
    style.id = 'cwc-styles-v2';
    style.textContent = `
      @keyframes msgIn {
        from { opacity:0; transform:translateY(8px) scale(0.96); }
        to { opacity:1; transform:translateY(0) scale(1); }
      }
      @keyframes typingBounce {
        0%,60%,100% { transform:translateY(0); opacity:0.3; }
        30% { transform:translateY(-4px); opacity:1; }
      }
      @keyframes pickerIn {
        from { opacity:0; transform:scale(0.8) translateY(4px); }
        to { opacity:1; transform:scale(1) translateY(0); }
      }
      @keyframes reactionPop {
        0% { transform:scale(0); }
        60% { transform:scale(1.3); }
        100% { transform:scale(1); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const agentName = game?.agent_name || 'Your Agent';
  const [loading, setLoading] = useState(true);

  const getCapturedPieces = (fenString) => {
    const start = { w:{p:8,r:2,n:2,b:2,q:1}, b:{p:8,r:2,n:2,b:2,q:1} };
    const fen = fenString || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    const pos = fen.split(' ')[0];
    const cur = { w:{p:0,r:0,n:0,b:0,q:0}, b:{p:0,r:0,n:0,b:0,q:0} };
    for (const c of pos) {
      if(c==='P')cur.w.p++;else if(c==='R')cur.w.r++;else if(c==='N')cur.w.n++;
      else if(c==='B')cur.w.b++;else if(c==='Q')cur.w.q++;
      else if(c==='p')cur.b.p++;else if(c==='r')cur.b.r++;else if(c==='n')cur.b.n++;
      else if(c==='b')cur.b.b++;else if(c==='q')cur.b.q++;
    }
    const byWhite={},byBlack={};
    for(const t of['p','r','n','b','q']){
      const w=start.b[t]-cur.b[t];if(w>0)byWhite[t]=w;
      const b=start.w[t]-cur.w[t];if(b>0)byBlack[t]=b;
    }
    return{byWhite,byBlack};
  };
  const PIECE_SYMBOLS={p:'♟',r:'♜',n:'♞',b:'♝',q:'♛'};
  const [notFound, setNotFound] = useState(false);

  const getFenAtMove = (index) => {
    try {
      const chess = new Chess();
      const moves = (game?.move_history || []).slice(0, index + 1);
      moves.forEach(m => chess.move(m));
      return chess.fen();
    } catch (e) {
      return game?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
  };

  
  const [showSettings, setShowSettings] = useState(false);
  const [chatMobileOpen, setChatMobileOpen] = useState(false);
  const [agentSectionOpen, setAgentSectionOpen] = useState(false);
  const [moveHistoryOpen, setMoveHistoryOpen] = useState(false);
  const [showStatusPopover, setShowStatusPopover] = useState(false);
  const [currentThought, setCurrentThought] = useState(null);
  const [previousThought, setPreviousThought] = useState(null);

  useEffect(() => {
    if (game?.companion_thought && game.companion_thought !== currentThought) {
      setPreviousThought(currentThought);
      setCurrentThought(game.companion_thought);
      
      const t1 = setTimeout(() => {
        setCurrentThought(null);
        setPreviousThought(game.companion_thought);
        setTimeout(() => {
          setPreviousThought(prev => prev === game.companion_thought ? null : prev);
        }, 3500);
      }, 3500);
      
      return () => {
        clearTimeout(t1);
      };
    }
  }, [game?.companion_thought, currentThought]);

  
  const [boardSize, setBoardSize] = useState(320);
  const [boardTheme, setBoardTheme] = useState(() => {
    try {
      const cached = localStorage.getItem('cwc_active_game');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.gameId === gameId && parsed.board_theme) {
          return parsed.board_theme;
        }
      }
    } catch (e) {}
    return localStorage.getItem('cwc_theme') || 'green';
  });
  const [pieceTheme, setPieceTheme] = useState(() => {
    try {
      const cached = localStorage.getItem('cwc_active_game');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.gameId === gameId && parsed.piece_style) {
          return parsed.piece_style;
        }
      }
    } catch (e) {}
    return localStorage.getItem('cwc_pieces') || 'neo';
  });
  const [thoughtLanguage, setThoughtLanguage] = useState('english');

  const prevDbBoardThemeRef = useRef(game?.board_theme || null);
  const prevDbPieceStyleRef = useRef(game?.piece_style || null);

  const [agentTyping, setAgentTyping] = useState(false);
  const [isCheckState, setIsCheckState] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(() => localStorage.getItem('cwc_bgm') === 'true');
  useEffect(() => { localStorage.setItem('cwc_bgm', bgmEnabled); }, [bgmEnabled]);
  const [agentDisconnected, setAgentDisconnected] = useState(false);

  const formatMoveTime = (time, gameStartTime) => {
    if (!time || !gameStartTime) return '';
    const elapsed = Math.max(0, new Date(time).getTime() - new Date(gameStartTime).getTime());
    const s = Math.floor(elapsed / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };



  useEffect(() => {
    const checkCheck = () => {
      try {
        const chess = new Chess(game?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        setIsCheckState(chess.in_check ? chess.in_check() : chess.isCheck ? chess.isCheck() : false);
      } catch (e) {
        setIsCheckState(false);
      }
    };
    if (game?.fen) {
      checkCheck();
    }
  }, [game?.fen]);
  
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [confirmResign, setConfirmResign] = useState(false);
  const [confirmDraw, setConfirmDraw] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [localMessages, setLocalMessages] = useState([]);
  const [boardLocked, setBoardLocked] = useState(false);
  const [justConnected, setJustConnected] = useState(false);
  const [agentJustConnected, setAgentJustConnected] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [closingGameOver, setClosingGameOver] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [commentary, setCommentary] = useState('');
  const [showCommentary, setShowCommentary] = useState(false);
  const [lastMoveHighlight, setLastMoveHighlight] = useState(null);
  const [reviewMoveIndex, setReviewMoveIndex] = useState(null);
  const [arrivedSquare, setArrivedSquare] = useState(null);

  const [optimisticLastMove, setOptimisticLastMove] = useState(null);
  const optimisticFenRef = useRef(null);
  const connectedToastShown = useRef(false);

  const currentLastMove = lastMoveHighlight || optimisticLastMove || (game?.move_history || [])[(game?.move_history || [])?.length - 1] || null;

  useEffect(() => {
    if (currentLastMove) {
      const dest = typeof currentLastMove === 'string' ? currentLastMove.substring(2, 4) : (currentLastMove.to || currentLastMove.to_square);
      if (dest) {
        setArrivedSquare(dest);
        const timer = setTimeout(() => setArrivedSquare(null), 600);
        return () => clearTimeout(timer);
      }
    }
  }, [currentLastMove]);
  
  const [optimisticFenState, setOptimisticFenState] = useState(null);
  const setOptimisticFen = (val) => {
    optimisticFenRef.current = val;
    setOptimisticFenState(val);
  };
  const optimisticFen = optimisticFenState;

  const currentDisplayFen = optimisticFen || game?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const trueTurn = (typeof currentDisplayFen === 'string' && currentDisplayFen.includes(' '))
    ? (currentDisplayFen.split(' ')[1] === 'w' ? 'white' : 'black')
    : 'white';



  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [lastMoveTo, setLastMoveTo] = useState(null);
  const [agentConnected, setAgentConnected] = useState(false);

  const [chatPaddingBottom, setChatPaddingBottom] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const createRipple = useRipple();

  const prevChatCountRef = useRef(0);
  const mountedMsgCount = useRef(0);
  const countSetRef = useRef(false);
  const prevAgentTypingRef = useRef(false);
  const [activePickerMsgId, setActivePickerMsgId] = useState(null);
  const longPressTimer = useRef(null);
  const seenMsgCountRef = useRef(0);

  useEffect(() => {
    const close = () => setActivePickerMsgId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const normalizedMessages = useMemo(() => {
    const serverTexts = new Set((game?.chat_history || []).map(m => m.text || m.message || m.content));
    const combined = [
      ...(game?.chat_history || []),
      ...localMessages.filter(m => !serverTexts.has(m.text || m.message || m.content))
    ].sort((a, b) => {
      const timeA = new Date(a.timestamp || a.ts || 0).getTime();
      const timeB = new Date(b.timestamp || b.ts || 0).getTime();
      return timeA - timeB;
    });
    return combined.map((msg, idx) => ({
      ...msg,
      id: msg.id || `cwc-msg-${idx}`
    }));
  }, [game?.chat_history, localMessages]);

  useEffect(() => {
    seenMsgCountRef.current = normalizedMessages.length;
    
  }, []); // only on mount - captures initial count

  const sendReaction = async (msgId, emoji) => {
    setActivePickerMsgId(null);
  
    // Optimistic update immediately — no delay
    setGame(prev => {
      const updated = (prev?.chat_history || []).map((msg, idx) => {
        const id = msg.id || `cwc-msg-${idx}`;
        if (id !== msgId) return msg;
        const reactions = { ...(msg.reactions || {}) };
        const current = reactions[emoji] || [];
        const hasIt = current.includes('human');
        if (hasIt) {
          // Remove reaction
          const newArr = current.filter(r => r !== 'agent');
          if (newArr.length === 0) delete reactions[emoji];
          else reactions[emoji] = newArr;
        } else {
          // Add reaction (remove other human reactions first — one at a time)
          Object.keys(reactions).forEach(e => {
            reactions[e] = (reactions[e] || []).filter(r => r !== 'agent');
            if (reactions[e].length === 0) delete reactions[e];
          });
          reactions[emoji] = [...current.filter(r => r !== 'agent'), 'agent'];
        }
        return { ...msg, reactions };
      });
      return { ...prev, chat_history: updated };
    });
  
    // Send to backend silently
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId,
        action: 'react',
        messageId: msgId,
        emoji,
        reactor: 'agent'
      })
    }).catch(() => {});
  };

  const handleMsgTouchStart = (msgId) => {
    longPressTimer.current = setTimeout(() => {
      setActivePickerMsgId(msgId);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 500); 
  };

  const handleMsgTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleMsgTouchMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  async function handleRematch() {
    // Step 1: Clear all old game state from localStorage
    localStorage.removeItem('chesswithclaw_active_game')
    
    // Step 2: Clear all local component state
    setGame(null)
    setAgentConnected(false)
    
    setLastMoveHighlight(null)
    setArrivedSquare(null)
    setLastMoveTo(null)
    setShowGameOverModal(false)
    connectedToastShown.current = false
    
    // Step 3: Navigate to home to create fresh game
    // Do NOT try to navigate to /created/:id from here
    // Let user click "Challenge Your Agent" fresh
    navigate('/')
  }

  const computeMaterial = useCallback((fen) => {
    if (!fen) return null;
    try {
      let chess;
      try {
        chess = new Chess(fen);
      } catch(e) {
        console.error('Invalid FEN:', fen);
        chess = new Chess();
      }
      const vals = { p: 1, n: 3, b: 3, r: 5, q: 9 };
      let w = 0, b = 0;
      chess.board().forEach(row => row && row.forEach(sq => {
        if (!sq) return;
        const v = vals[sq.type] || 0;
        if (sq.color === 'w') w += v; else b += v;
      }));
      const diff = w - b;
      return { white: w, black: b, advantage: diff > 0 ? 'white' : diff < 0 ? 'black' : 'equal', difference: Math.abs(diff) };
    } catch (e) {
      return null;
    }
  }, []);
  
  const submittingRef = useRef(false);
  const audioCtxRef = useRef(null);
  const prevMoveCountRef = useRef(0);
  const prevStatusRef = useRef('waiting');
  const prevAgentConnected = useRef(false);

  const boardRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const moveHistoryScrollRef = useRef(null);

  const channelRef = useRef(null);
  const containerRef = useRef(null);
  const prevFenRef = useRef(null);




  // Calculate Board Size and Viewport Height
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      
      let maxH, maxW;
      
      if (vw >= 1024) {
        // Desktop: Board is in a flex container next to a 360px sidebar
        const usedHeight = 52 + 64 + 100; // header + padding + top/bottom info
        maxH = vh - usedHeight;
        maxW = vw - 360 - 64; // sidebar width + padding
      } else {
        // Mobile
        const usedHeight =
          52 +   // header
          100 +  // agent section (merged, collapsed)
          48 +   // status bar
          44 +   // chat header
          44 +   // move history header
          24;    // padding
        maxH = vh - usedHeight;
        maxW = vw - 24;
      }
      
      const availableWidth = maxW - 24;
      setBoardSize(Math.max(280, Math.min(availableWidth, maxH, 800)));
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    calc();

    const observer = new ResizeObserver(() => {
      calc();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', calc);
    }
    return () => {
      observer.disconnect();
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', calc);
      }
    };
  }, []);



  // Auto-scroll chat
  
  // Auto-scroll Move History
  useEffect(() => {
    const el = moveHistoryScrollRef.current;
    if (el) {
      const isScrolledUp = el.scrollHeight - el.clientHeight - el.scrollTop > 50;
      if (!isScrolledUp) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [game?.move_history, moveHistoryOpen]);
  useEffect(() => {
    const el = chatMessagesRef.current;
    if (el) {
      const isScrolledUp = el.scrollHeight - el.clientHeight - el.scrollTop > 50;
      if (!isScrolledUp) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [normalizedMessages]);





  useEffect(() => {
    if (!window.visualViewport) return
    
    const handleViewport = () => {
      const keyboardHeight = window.innerHeight - window.visualViewport.height
      if (keyboardHeight > 100) {
        // Keyboard is open
        setChatPaddingBottom(keyboardHeight)
      } else {
        setChatPaddingBottom(0)
      }
    }
    
    window.visualViewport.addEventListener('resize', handleViewport)
    return () => window.visualViewport.removeEventListener('resize', handleViewport)
  }, [])

  useEffect(() => {
    if (game?.last_commentary) {
      setCommentary(game.last_commentary);
      setShowCommentary(true);
      const timer = setTimeout(() => {
        setShowCommentary(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [game?.last_commentary, game?.move_history?.length]);

  // Sound Effects
  const playSound = useMemo(() => (type) => {
    if (!soundEnabled) return;
    const urls = {
      move: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3',
      capture: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3',
      check: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3',
      checkmate: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3',
      start: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-start.mp3',
      end: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3',
      illegal: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/illegal.mp3',
      agentThinking: '',
      agentMove: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-opponent.mp3',
      agentCapture: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3',
      agentCheck: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3',
      agentCheckmate: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3',
      agentEnd: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3',
      agentIllegal: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/illegal.mp3'
    };
    if (urls[type]) {
      const audio = new Audio(urls[type]);
      audio.play().catch(e => console.error("Error playing sound", e));
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (!game) return;
    const currentMoveCount = (game.move_history || []).length;
    if (currentMoveCount > prevMoveCountRef.current) {
      const runSoundLogic = () => {
        let chess;
        try {
          chess = new Chess();
        } catch(e) {
          chess = null;
        }
        if (chess && game.move_history && game.move_history.length > 0) {
          game.move_history.forEach(m => {
            try { chess.move(m.san); } catch (e) {}
          });
        } else if (chess && game.fen && game.fen !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
          chess.load(game.fen);
        }
        if (chess) {
          const lastMove = game.move_history[currentMoveCount - 1];
          const isAgent = lastMove?.color === 'b';
          const isMate = chess.in_checkmate ? chess.in_checkmate() : chess.isCheckmate ? chess.isCheckmate() : false;
          const isCh = chess.in_check ? chess.in_check() : chess.isCheck ? chess.isCheck() : false;
          
          if (isMate) {
            playSound(isAgent ? 'agentCheckmate' : 'checkmate');
          } else if (isCh) {
            playSound(isAgent ? 'agentCheck' : 'check');
          } else if (lastMove && lastMove.san && lastMove.san.includes('x')) {
            playSound(isAgent ? 'agentCapture' : 'capture');
          } else {
            playSound(isAgent ? 'agentMove' : 'move');
          }
        }
      };
      runSoundLogic();
    }
    
    if (game.status === 'finished' && prevStatusRef.current !== 'finished') {
      const isAgentWinner = game.winner === (game?.player_color === 'b' ? 'black' : 'white');
      playSound(isAgentWinner ? 'agentEnd' : 'end');
    }
    
    if (game.status === 'active' && prevStatusRef.current === 'waiting') {
      playSound('start');
    }
    
    if (game.current_thinking && !prevStatusRef.current_thinking) {
      playSound('agentThinking');
    }
    
    prevMoveCountRef.current = currentMoveCount;
    prevStatusRef.current = game.status;
    prevStatusRef.current_thinking = game.current_thinking;
  }, [game, playSound]);

  const agentTimeoutRef = useRef(null);
  useEffect(() => {
    agentTimeoutRef.current = setInterval(() => {
      if (!game?.agent_last_seen) return;
      const lastSeen = new Date(game.agent_last_seen);
      const secondsAgo = (Date.now() - lastSeen) / 1000;
      setAgentDisconnected(secondsAgo > 90);
    }, 15000);
    return () => clearInterval(agentTimeoutRef.current);
  }, [game?.agent_last_seen]);

  // Heartbeat & Idle Chat
  useEffect(() => {
    if (!game || game.status === 'finished' || game.status === 'abandoned' || game.turn === (game?.player_color || 'w')) {
      return;
    }
    
    const heartbeatInterval = setInterval(() => {
      fetch('/api/actions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-agent-token': agentToken || ''
        },
        body: JSON.stringify({ gameId: gameId, action: 'heartbeat', role: 'agent' })
      }).catch(() => {});
      
      // Poll game state if it's the agent's turn to catch missed real-time events
      if (game?.turn !== (game?.player_color || 'w') && game?.status === 'active') {
        supabase.from('games').select('turn, move_history').eq('id', gameId).single().then(({ data }) => {
          if (data && data.turn === (game?.player_color || 'w')) {
            // Agent made a move but we missed the event, trigger a full reload
            document.dispatchEvent(new Event('visibilitychange'));
          }
        });
      }
    }, 15000);

    const idleChatInterval = setInterval(() => {
      if (game?.status !== 'active') return;
      
      const rand = Math.random();
      if (rand < 0.3) {
        fetch(`/api/thoughts?gameId=${gameId}&trigger=idle_chat`, {
           headers: { 'x-agent-token': agentToken || '' }
        }).catch(() => {});
      } else if (rand < 0.6) {
        fetch(`/api/thoughts?gameId=${gameId}&trigger=random_thought`, {
           headers: { 'x-agent-token': agentToken || '' }
        }).catch(() => {});
      }
    }, 45000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(idleChatInterval);
    };
  }, [game, game?.turn, game?.status, game?.agent_last_seen, game?.updated_at, game?.created_at, gameId]);

  useEffect(() => {
    if (game?.status === 'finished' || game?.status === 'abandoned') {
      localStorage.removeItem('chesswithclaw_active_game');
      setTimeout(() => setShowGameOverModal(true), 600);
      
      if (game?.winner === (game?.player_color === 'b' ? 'white' : 'black')) {
        setTimeout(() => {
          toast.success('Achievement Unlocked: Bot Slayer! 🏆');
        }, 1500);
      }
    }
  }, [game?.status, game?.result, game?.player_color, toast]);

  useEffect(() => {
    if (!game) return;
    const agentName = game?.agent_name || 'Your Agent';
    if (game.status === 'finished' || game.status === 'abandoned') {
      document.title = 'ChessWithClaw';
    } else if (game.turn === (game?.player_color || 'w')) {
      document.title = '♟ Your Turn — ChessWithClaw';
    } else {
      document.title = `⚡ ${agentName} Thinking...`;
    }
  }, [game]);

  // Auto-resignation timer
  useEffect(() => {
    if (!game || game.status !== 'active') return;
    const interval = setInterval(async () => {
      const isHumanTurn = game.turn === (game.player_color || 'w');
      const maxTimeMs = 15 * 60 * 1000; // 15 minutes
      const lastMoveTs = game.move_history?.length > 0 
        ? new Date(game.move_history[game.move_history.length - 1].created_at).getTime()
        : new Date(game.created_at).getTime();
        
      if (Date.now() - lastMoveTs > maxTimeMs) {
        // Current turn exceeded auto-resign timer
        if (!isHumanTurn) {
           await fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': agentToken }, body: JSON.stringify({action: 'update', data: {
              status: 'abandoned',
              result: game.player_color || 'w',
              result_reason: 'abandoned'
            }, gameId}) });
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [game, gameId, agentToken]);

  useEffect(() => {
    if (game?.agent_connected) {
      setAgentConnected(true);
      connectedToastShown.current = true;
    }
    
  }, [game?.id]);

  useEffect(() => {
    if (game && prevAgentConnected.current === false && game.agent_connected === true && connectedToastShown.current === false) {
      const toastKey = `cwc_connected_${gameId}`;
      if (!sessionStorage.getItem(toastKey)) {
        toast.success(`${agentName} has arrived!`);
        sessionStorage.setItem(toastKey, '1');
      }
      setJustConnected(true);
      setTimeout(() => setJustConnected(false), 1000);
      connectedToastShown.current = true;
    }
    if (game) {
      prevAgentConnected.current = game.agent_connected;
    }
  }, [game, toast, agentName, gameId]);
  
  useEffect(() => {
    if (!gameId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const setupGameSubscription = async () => {
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (!gameId) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const headers = {};
        if (agentToken) headers['x-agent-token'] = agentToken;

        const res = await fetch(`/api/state?id=${gameId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          prevFenRef.current = data.fen;
          setGame(data);
          setOptimisticFen(null);
            setReviewMoveIndex(null);
        } else if (res.status === 404 || res.status === 401 || res.status === 403) {
          setNotFound(true);
        }
      } catch (e) {}
      setLoading(false);

      const channel = supabase
        .channel(`cwc-game-${gameId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'games',
            filter: `id=eq.${gameId}`
          },
          (payload) => {
            const newData = payload.new;
            if (!newData) return;
            if (newData.fen) prevFenRef.current = newData.fen;
            setOptimisticFen(null);
            setReviewMoveIndex(null);

            // Fetch fresh state to get moves from separate table
            fetch(`/api/state?gameId=${gameId}`).then(res => res.json()).then(freshData => {
              setGame(prev => {
                const updated = { ...prev, ...newData };
                if (freshData.move_history) updated.move_history = freshData.move_history;
                if (freshData.chat_history) updated.chat_history = freshData.chat_history;
                return updated;
              });
            }).catch(() => {
              setGame(prev => ({
                ...prev,
                ...newData
              }));
            });
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setTimeout(() => setupGameSubscription(), 3000);
          }
        });
      channelRef.current = channel;
    };
    setupGameSubscription();
    
    const handleBeforeUnload = () => {
      fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': agentToken }, body: JSON.stringify({action: 'update', data: { agent_connected: false }, gameId}) })
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setupGameSubscription();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
      try { fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': agentToken }, body: JSON.stringify({action: 'update', data: { agent_connected: false }, gameId}) }) } catch(e) {}
    };
  }, [gameId, playSound, agentToken]);

  const handleResign = useCallback(async () => {
    if (!confirmResign) {
      setConfirmResign(true);
      setTimeout(() => setConfirmResign(false), 3000);
      return;
    }
    await fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': agentToken }, body: JSON.stringify({ action: 'end_game', result: 'white', reason: 'resignation', gameId }) });
    setShowSettings(false);
    setConfirmResign(false);
  }, [confirmResign, game?.player_color, gameId, agentToken]);

  const handleDraw = useCallback(async () => {
    if (!confirmDraw) {
      setConfirmDraw(true);
      setTimeout(() => setConfirmDraw(false), 3000);
      return;
    }
    await fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': agentToken }, body: JSON.stringify({ action: 'end_game', result: 'draw', reason: 'agreement', gameId }) });
    setShowSettings(false);
    setConfirmDraw(false);
  }, [confirmDraw, gameId, agentToken]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in chat
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      
      if (e.key === 'h' || e.key === 'H') {
        setMoveHistoryOpen(prev => !prev);
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        const chatInput = document.getElementById('chat-input');
        if (chatInput) chatInput.focus();
      } else if (e.key === 'R' && e.shiftKey) {
        handleResign();
      } else if (e.key === 'D' && e.shiftKey) {
        handleDraw();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmResign, confirmDraw, handleDraw, handleResign]);

  const makeMove = useCallback(async (from, to, promotion) => {
    if (!game || game.turn !== (game?.player_color || 'w') || (game.status !== 'active' && game.status !== 'waiting')) return;
    if (boardLocked || submittingRef.current) return;
    
    const agentName = game?.agent_name || 'Your Agent';

    submittingRef.current = true;
    setBoardLocked(true);
    let chess;
    try {
      chess = new Chess();
    } catch(e) {
      chess = null;
    }
    if (chess && game.move_history && game.move_history.length > 0) {
      game.move_history.forEach(m => {
        try { chess.move(typeof m === 'string' ? m : (m.san || m)); } catch (e) {}
      });
    } else if (chess && game.fen && game.fen !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
      chess.load(game.fen);
    }
    
    try {
      const moveObj = promotion ? { from, to, promotion } : { from, to };
      const move = chess ? chess.move(moveObj) : null;
      if (!move) {
        submittingRef.current = false;
        setBoardLocked(false);
        setOptimisticFen(null);
            setReviewMoveIndex(null);
        setOptimisticLastMove(null);
        return;
      }
      
      const newFen = chess.fen();
      setOptimisticFen(newFen);
      setOptimisticLastMove({ from, to });
      setLastMoveHighlight({ from, to });
      setReviewMoveIndex(null);
      
      if (soundEnabled) {
        const audio = new Audio(move.captured ? "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3" : "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3");
        audio.play().catch(() => {});
        if (chess.in_check && chess.in_check()) {
          setTimeout(() => {
            const checkAudio = new Audio("https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3");
            checkAudio.play().catch(() => {});
          }, 150);
        }
      }

      const prevFen = game.fen;
      const gameIdValue = gameId;

      fetch('/api/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-agent-token': agentToken || ''
        },
        body: JSON.stringify({
          id: gameIdValue,
          move: from + to + (promotion || ''),
          isHumanMove: true
        })
      })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setOptimisticFen(prevFen);
          setOptimisticLastMove(null);
          
          if (errData.code === 'WAITING_FOR_AGENT') {
            toast(`Waiting for ${agentName} to join...`, {
              icon: <LobsterEmoji />,
              style: { background: '#0e0e0e', border: '1px solid rgba(230,57,70,0.3)', color: '#f0f0f0' }
            });
          } else if (errData.code === 'TURN_CONFLICT') {
             toast.error('Move already processed');
          } else {
             toast.error(errData.error || 'Failed to submit move');
          }
        } 
        // Realtime will clear submittingRef and boardLocked when it receives the move
        // Setting it here to a timeout in case Realtime fails
        setTimeout(() => {
          if (submittingRef.current) {
            submittingRef.current = false;
            setBoardLocked(false);
          }
        }, 3000);
      })
      .catch((err) => {
        setOptimisticFen(prevFen);
        setOptimisticLastMove(null);
        toast.error('Network error or failed to submit');
        submittingRef.current = false;
        setBoardLocked(false);
      });
      
    } catch (e) {
      toast.error(e.message || 'Illegal move or failed to submit');
      submittingRef.current = false;
      setBoardLocked(false);
      setOptimisticFen(null);
            setReviewMoveIndex(null);
      setOptimisticLastMove(null);
    }
  }, [game, boardLocked, gameId, toast, soundEnabled, agentToken]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    
    const text = chatInput;
    setLocalMessages(prev => [...prev, { role: 'human', sender: 'human', text: text, timestamp: Date.now() }]);
    setChatInput('');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-agent-token': agentToken
        },
        body: JSON.stringify({ id: gameId, text, sender: 'human' })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        toast.error(errData.error || 'Failed to send message', {
          style: { background: '#0e0e0e', border: '1px solid rgba(230,57,70,0.3)', color: '#f0f0f0' }
        });
        throw new Error('Failed to send message');
      }
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };



  async function acceptAgentResignation() {
    await fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': agentToken }, body: JSON.stringify({action: 'update', data: {
      status: 'finished', result: game?.player_color === 'b' ? 'white' : 'black', result_reason: 'resignation'
    }, gameId}) });
  }

  function copyRoomCode() {
    navigator.clipboard.writeText(gameId);
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2000);
  }

  function copyInvite() {
    const url = `${window.location.origin}/Agent?id=${gameId}${agentToken ? `&token=${agentToken}` : ''}`;
    navigator.clipboard.writeText(url);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  }

  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  function handleGoHome(e) { 
    if (game?.status === 'finished' || game?.status === 'abandoned') {
      navigate('/');
      return;
    }

    if (game?.agent_connected || game?.status === 'active') {
      if (e && e.preventDefault) e.preventDefault();
      setShowLeaveWarning(true);
    } else {
      navigate(`/created/${gameId}`);
    }
  }
  function handleOpenSettings() { setShowSettings(true) }
  function handleToggleAgentSection() { setAgentSectionOpen(prev => !prev) }
  function handleToggleMoveHistory() { setMoveHistoryOpen(prev => !prev) }
  function handleCloseGameOverModal() { setShowGameOverModal(false) }
  async function handleShareResult(e) {
    const moves = Math.floor((game.move_history || []).length / 2) + ((game.move_history || []).length % 2);
    const result = game?.winner === (game?.player_color === 'b' ? 'white' : 'black') ? 'Won' : game?.result === 'draw' ? 'Draw' : 'Lost';
    const text = `I played chess vs ${agentName} on ChessWithClaw! ${result} in ${moves} moves. chesswithclaw.vercel.app 🦞`;
    if (navigator.share) {
      navigator.share({ text }).catch(()=>{});
    } else { 
      navigator.clipboard.writeText(text); 
      toast.success('Copied!'); 
    }
  }

  function handleLogoError(e) {
    e.target.style.display = 'none';
  }

  function handleGoHomeWithRipple(e) {
    createRipple(e);
    handleGoHome();
  }

  function handleCopyInviteWithRipple(e) {
    createRipple(e);
    copyInvite();
  }

  function handleChatInputChange(e) {
    setChatInput(e.target.value);
  }

  const getAgentMood = () => {
    if (!game || game.status === 'waiting') return 'idle'
    if (game.turn === 'b') return 'thinking'
    
    // Compare material balance
    const mat = game.material_balance || computeMaterial(game.fen)
    if (!mat) return 'neutral'
    if (mat.advantage === 'black') return 'winning'
    if (mat.advantage === 'white') return 'losing'
    return 'neutral'
  }

  const moodConfig = {
    idle:     { label: 'Waiting...', color: '#555555', bg: 'rgba(85,85,85,0.1)', border: 'rgba(85,85,85,0.25)' },
    thinking: { label: 'Thinking...', color: '#e63946', bg: 'rgba(230,57,70,0.1)', border: 'rgba(230,57,70,0.25)' },
    winning:  { label: 'Feeling good', color: '#739552', bg: 'rgba(115,149,82,0.1)', border: 'rgba(115,149,82,0.25)' },
    losing:   { label: 'Fighting back', color: '#c9b458', bg: 'rgba(201,180,88,0.1)', border: 'rgba(201,180,88,0.25)' },
    neutral:  { label: 'Equal game', color: '#888888', bg: 'rgba(136,136,136,0.1)', border: 'rgba(136,136,136,0.25)' }
  }

  const [capturedPieces, setCapturedPieces] = useState({ capturedByWhite: [], capturedByBlack: [] });

  useEffect(() => {
    let chess;
    try {
      chess = new Chess();
    } catch(e) {
      return;
    }
    
    const capturedW = [];
    const capturedB = [];
    
    for (const move of game?.move_history || []) {
      try {
        const result = chess.move(move);
        if (result?.captured) {
          if (result.color === 'w') {
            capturedW.push(result.captured);
          } else {
            capturedB.push(result.captured);
          }
        }
      } catch(e) {
        // ignore
      }
    }
    setCapturedPieces({ capturedByWhite: capturedW, capturedByBlack: capturedB });
  }, [game?.move_history]);

  const { capturedByWhite, capturedByBlack } = capturedPieces;

  const blackPieceMap = { p:'♟', n:'♞', b:'♝', r:'♜', q:'♛' } // black pieces (captured by white)
  const whitePieceMap = { p:'♙', n:'♘', b:'♗', r:'♖', q:'♕' } // white pieces (captured by black)

  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const getScore = (pieces) => pieces.reduce((sum, p) => sum + (pieceValues[p] || 0), 0);
  const whiteScore = getScore(capturedByWhite); // White captured black pieces
  const blackScore = getScore(capturedByBlack); // Black captured white pieces

  const youCaptured = game?.player_color === 'w' ? capturedByWhite : capturedByBlack;
  const agentCaptured = game?.player_color === 'w' ? capturedByBlack : capturedByWhite;
  
  const youAdvantage = game?.player_color === 'w' ? (whiteScore - blackScore) : (blackScore - whiteScore);
  const agentAdvantage = game?.player_color === 'w' ? (blackScore - whiteScore) : (whiteScore - blackScore);

  const mood = getAgentMood()
  const config = moodConfig[mood]

  const handleIllegalMove = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 300);
  }, []);

  const handleCapture = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 300);
  }, []);

  const legalMoves = useMemo(() => {
    try {
      const chess = new Chess(game?.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
      return chess.moves({ verbose: true });
    } catch { return []; }
  }, [game?.fen]);

  const moveHistoryItems = useMemo(() => {
    return (game?.move_history || []).map((move, i) => ({
      ...move, index: i
    }));
  }, [game?.move_history]);

  const isOpenClawTurn = game?.turn === 'b' && game?.status === 'active';

  useEffect(() => {
    if (game?.status === 'active') {
      localStorage.setItem('cwc_active_game', JSON.stringify({
        gameId: gameId,
        agentName: game.agent_name || 'Your Agent',
        savedAt: Date.now(),
        fen: game.fen
      }));
    } else if (game?.status === 'finished' || game?.status === 'abandoned') {
      localStorage.removeItem('cwc_active_game');
    }
  }, [game?.status, game?.fen, gameId, game?.agent_name]);

  if (loading) {
    const isDesktopLoading = typeof window !== 'undefined' && window.innerWidth >= 1024;
    const skeletonStyle = {
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite linear',
      borderRadius: '8px'
    };

    return (
      <div style={{ backgroundColor: '#1c1a19', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        
        {/* Header Skeleton */}
        <header style={{ height: '52px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#2c2826', zIndex: 50 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '4px', ...skeletonStyle }} />
          <div style={{ width: '120px', height: '28px', borderRadius: '4px', ...skeletonStyle }} />
          <div style={{ width: '28px', height: '28px', borderRadius: '4px', ...skeletonStyle }} />
        </header>

        {isDesktopLoading ? (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
              <div style={{ width: '100%', maxWidth: '600px', display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', ...skeletonStyle }} />
                <div style={{ flex: 1, height: '64px', borderRadius: '16px', ...skeletonStyle }} />
              </div>
              <div style={{ width: '100%', maxWidth: '600px', aspectRatio: '1', borderRadius: '4px', ...skeletonStyle }} />
              <div style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <div style={{ width: '30%', height: '24px', borderRadius: '4px', ...skeletonStyle }} />
                <div style={{ width: '30%', height: '24px', borderRadius: '4px', ...skeletonStyle }} />
              </div>
            </div>
            <div style={{ width: '360px', background: '#111', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '60px', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '50%', height: '24px', borderRadius: '4px', ...skeletonStyle }} />
              </div>
              <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'flex-end' }}>
                <div style={{ width: '70%', height: '48px', borderRadius: '16px 16px 16px 4px', ...skeletonStyle, alignSelf: 'flex-start' }} />
                <div style={{ width: '60%', height: '36px', borderRadius: '16px 16px 4px 16px', ...skeletonStyle, alignSelf: 'flex-end' }} />
                <div style={{ width: '80%', height: '48px', borderRadius: '16px 16px 16px 4px', ...skeletonStyle, alignSelf: 'flex-start' }} />
              </div>
              <div style={{ height: '72px', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, height: '40px', borderRadius: '20px', ...skeletonStyle }} />
                <div style={{ width: '40px', height: '40px', borderRadius: '20px', ...skeletonStyle }} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', padding: '16px', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', ...skeletonStyle }} />
              <div style={{ flex: 1, height: '48px', borderRadius: '24px', ...skeletonStyle }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}>
              <div style={{ width: '100%', maxWidth: '600px', aspectRatio: '1', borderRadius: '4px', ...skeletonStyle }} />
              <div style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <div style={{ width: '40%', height: '20px', borderRadius: '4px', ...skeletonStyle }} />
                <div style={{ width: '40%', height: '20px', borderRadius: '4px', ...skeletonStyle }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', padding: '12px 16px' }}>
              <div style={{ flex: 1, height: '60px', borderRadius: '16px', ...skeletonStyle }} />
              <div style={{ flex: 1, height: '60px', borderRadius: '16px', ...skeletonStyle }} />
            </div>
            <div style={{ height: '56px', background: '#1e1c1b', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: '100px', height: '32px', borderRadius: '8px', ...skeletonStyle }} />
              <div style={{ width: '60px', height: '20px', borderRadius: '4px', ...skeletonStyle }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white selection:bg-red-500/30 p-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] blur-[120px] rounded-full pointer-events-none bg-red-500/10 transition-colors duration-1000" />
        <div className="relative z-10 flex flex-col items-center gap-6 glass border-white/10 p-12 rounded-2xl max-w-md text-center glow-anim">
          <div className="text-5xl drop-shadow-md"><LobsterEmoji /></div>
          <div className="font-sans text-3xl font-bold tracking-wide">Invalid or expired token, or game not found</div>
          <div className="text-neutral-400 text-sm font-sans">
            It looks like this game doesn&apos;t exist anymore or you have the wrong link.
          </div>
          <button 
            data-testid="home-button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowLeaveWarning(true); }} 
            className="mt-2 text-white font-semibold flex items-center justify-center py-3 px-8 rounded-xl w-full transition-all active:translate-y-[1px] active:scale-[0.98] design-btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isSpectator = false;
  const isMyTurn = game?.turn === 'b' && (game?.status === 'active' || game?.status === 'waiting');
  

  const previousThoughtText = previousThought;
  const thoughtText = currentThought;
  const thoughtVisible = !!thoughtText;

  if (!game) return null;

    const renderChatMessages = () => {
    const msgs = normalizedMessages;
    
    const formatTime = (ts) => {
      if (!ts) return '';
      return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return (
      <div style={{ paddingBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {msgs.map((msg, index) => {
          if (!msg) return null;
          const isAgent = msg.role === 'agent';
          const isNew = index >= seenMsgCountRef.current;
          const prevMsg = msgs[index - 1];
          const isFirstInGroup = !prevMsg || prevMsg.role !== msg.role;
          const isHuman = !isAgent;

          if (msg.type === 'resign_request' || msg.type === 'draw_offer') {
            return (
              <div key={msg.id} style={{ alignSelf: 'center', background: '#1a1a1a', border: '1px solid #2a2a2a', color: 'white', borderRadius: '12px', padding: '12px', margin: '8px 0', width: '100%', fontFamily: "'Inter', sans-serif", fontSize: '13px', textAlign: 'center' }}>
                {msg.text || msg.message || msg.content}
                {game?.status === 'active' && msg.type === 'resign_request' && (
                  <button onClick={acceptAgentResignation} className="block w-full mt-3 text-white bg-[#e63946] rounded py-2 font-bold transition-all hover:bg-opacity-80 active:scale-95">Accept Resignation</button>
                )}
                {game?.status === 'active' && msg.type === 'draw_offer' && (
                  <button onClick={async () => {
                    await fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-token': agentToken }, body: JSON.stringify({ action: 'end_game', result: 'draw', reason: 'agreement', gameId }) });
                  }} className="block w-full mt-3 text-white bg-green-600 rounded py-2 font-bold transition-all hover:bg-opacity-80 active:scale-95">Accept Draw</button>
                )}
              </div>
            );
          }
        
          const textStr = msg.text || msg.message || msg.content;
          const timeStr = formatTime(msg.timestamp || msg.ts);

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isAgent ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
                alignSelf: isAgent ? 'flex-start' : 'flex-end',
                position: 'relative',
                animation: isNew ? 'msgSlide 0.2s ease-out' : 'none',
                marginTop: isFirstInGroup ? '8px' : '2px'
              }}
            >
              {isFirstInGroup && (
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', padding: '0 4px', display: 'flex', gap: '4px', alignItems: 'center', fontFamily: "'Inter', sans-serif", width: '100%', justifyContent: isAgent ? 'flex-start' : 'flex-end' }}>
                  {isAgent ? (
                    <>
                      <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{agentName}</span>
                      <span style={{ opacity: 0.5 }}>|</span>
                      <span>{timeStr}</span>
                    </>
                  ) : (
                    <>
                      <span>{timeStr}</span>
                      <span style={{ opacity: 0.5 }}>|</span>
                      <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>You</span>
                    </>
                  )}
                </div>
              )}
              
              <div style={{
                background: isHuman ? 'linear-gradient(135deg, #f0525f 0%, #e63946 100%)' : 'linear-gradient(135deg, #888584 0%, #767372 100%)',
                color: isHuman ? '#ffffff' : '#f2f2f2',
                borderRadius: isHuman 
                  ? (isFirstInGroup ? '16px 16px 4px 16px' : '16px 4px 4px 16px')
                  : (isFirstInGroup ? '16px 16px 16px 4px' : '4px 16px 16px 4px'),
                padding: '10px 14px',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                wordBreak: 'break-word',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                position: 'relative'
              }}>
                {isFirstInGroup && (
                  <svg 
                    width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                    style={{
                      position: 'absolute',
                      top: 'auto',
                      bottom: '0px',
                      left: isHuman ? 'auto' : '-10px',
                      right: isHuman ? '-10px' : 'auto',
                      transform: isHuman ? 'none' : 'scaleX(-1)'
                    }}
                  >
                    <path d="M0 16V0C0 0 2 12 14 16H0Z" fill={isHuman ? '#e63946' : '#767372'} />
                  </svg>
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{textStr}</span>
              </div>
            </div>
          );
        })}
        {game?.agent_typing && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginTop: '12px',
            position: 'relative',
            animation: 'msgSlide 0.2s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #888584 0%, #767372 100%)',
              borderRadius: '16px 16px 16px 4px',
              padding: '12px 14px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              <svg 
                width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', bottom: '0px', left: '-10px', transform: 'scaleX(-1)' }}
              >
                <path d="M0 16V0C0 0 2 12 14 16H0Z" fill="#767372" />
              </svg>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <div style={{ width: '6px', height: '6px', background: '#f2f2f2', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both' }} />
                <div style={{ width: '6px', height: '6px', background: '#f2f2f2', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                <div style={{ width: '6px', height: '6px', background: '#f2f2f2', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const emojiAnimating = false;
  const displayedEmoji = game?.agent_avatar || '🦞';
  const agentPresence = (() => {
    if (!game?.agent_connected || !game?.agent_last_seen) return 'not_here';
    const secs = (Date.now() - new Date(game.agent_last_seen).getTime()) / 1000;
    if (secs < 45) return 'connected';
    if (secs <= 180) return 'reconnecting';
    return 'not_here';
  })();
  const presenceColor = agentPresence === 'connected' ? '#22c55e' : agentPresence === 'reconnecting' ? '#fbbf24' : '#e63946';
  const statusLabel = agentPresence === 'reconnecting' ? 'Away' : agentPresence === 'not_here' ? 'Offline' : (game?.status === 'waiting' ? 'Waiting' : 'Online');
  const getAgentLastSeenText = () => game?.agent_last_seen ? 'Seen recently' : 'Never seen';
  
  const agentColor = (game?.player_color || 'w') === 'w' ? 'b' : 'w';
  const isAgentThinking = game?.turn === agentColor && game?.status === 'active';
  const agentNameContent = (
    <>
      {game?.agent_name && game?.agent_name !== 'Your Agent' ? game.agent_name : 'Your Agent'}
      {isAgentThinking && (
        <span style={{ display: 'inline-block' }}>
          <span style={{ animation: 'typingPulse 1.2s infinite 0ms', color: 'rgba(230,57,70,0.6)' }}>.</span>
          <span style={{ animation: 'typingPulse 1.2s infinite 150ms', color: 'rgba(230,57,70,0.6)' }}>.</span>
          <span style={{ animation: 'typingPulse 1.2s infinite 300ms', color: 'rgba(230,57,70,0.6)' }}>.</span>
        </span>
      )}
    </>
  );

  return (
    <div 
      ref={containerRef}
      className={`relative text-white font-sans selection:bg-red-500/30 transition-colors duration-700 box-border scrollbar-none bg-[#2c2826]`}
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
            <AnimatePresence>
        {showLeaveWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{ background: '#1c1a19', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px', maxWidth: '320px', width: '90%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(230,57,70,0.1)', color: '#e63946', padding: '12px', borderRadius: '50%' }}>
                  <AlertTriangle size={32} />
                </div>
              </div>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '20px', fontWeight: 800, color: '#f2f2f2', marginBottom: '8px' }}>Really want to exit game room?</h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(242,242,242,0.6)', marginBottom: '24px' }}>
                You might not be able to return to this game if you haven't saved the link.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowLeaveWarning(false)} style={{ flex: 1, background: '#2a2a2a', border: 'none', padding: '12px', borderRadius: '8px', color: '#f2f2f2', fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: 'pointer', transition: 'background 0.2s' }}>
                  Cancel
                </button>
                <button onClick={() => navigate('/')} style={{ flex: 1, background: '#e63946', border: 'none', padding: '12px', borderRadius: '8px', color: '#fff', fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: 'pointer', transition: 'background 0.2s' }}>
                  Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 15 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'fixed', inset: 0, background: '#1c1a19', zIndex: 200, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
          >
          <div style={{ height: '52px', flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 16px', gap: '16px' }}>
            <button onClick={() => setShowSettings(false)} style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: 'rgba(242,242,242,0.9)', cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '22px', color: '#f2f2f2' }}>Settings</span>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '16px', color: '#f2f2f2' }}>Game ID</span>
              <button onClick={() => { navigator.clipboard.writeText(gameId); toast.success('Game ID copied'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2a2a2a', border: 'none', borderRadius: '8px', padding: '8px 12px', color: 'rgba(242,242,242,0.7)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', cursor: 'pointer' }}>
                <Copy size={14} />
                {gameId ? `${gameId.slice(0, 13)}...` : ''}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleDraw} style={{ flex: 1, height: '48px', borderRadius: '10px', border: 'none', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '15px', color: '#1a1a1a', cursor: 'pointer', background: 'linear-gradient(180deg, #d4b95a 0%, #b89c3e 100%)' }}>
                {confirmDraw ? 'Confirm?' : 'Offer Draw'}
              </button>
              <button onClick={handleResign} style={{ flex: 1, height: '48px', borderRadius: '10px', border: 'none', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '15px', color: '#fff', cursor: 'pointer', background: 'linear-gradient(180deg, #e6555f 0%, #c92f3a 100%)' }}>
                {confirmResign ? 'Confirm?' : 'Resign'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid #2a2a2a' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '15px', color: '#f2f2f2' }}>Sound effects</span>
              <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ width: '48px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: soundEnabled ? '#4ade80' : '#3a3a3a', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: soundEnabled ? '23px' : '3px', transition: 'left 0.2s' }} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '15px', color: '#f2f2f2' }}>BGM</span>
              <button onClick={() => setBgmEnabled(!bgmEnabled)} style={{ width: '48px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: bgmEnabled ? '#4ade80' : '#3a3a3a', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: bgmEnabled ? '23px' : '3px', transition: 'left 0.2s' }} />
              </button>
            </div>

            <div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '16px', color: '#f2f2f2', display: 'block', marginBottom: '10px' }}>Thoughts language</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['english', 'hindi', 'hinglish'].map((lang) => (
                  <button 
                    key={lang} 
                    onClick={() => setThoughtLanguage(lang)}
                    style={{ 
                      flex: 1, 
                      padding: '8px', 
                      background: thoughtLanguage === lang ? '#e63946' : '#2a2a2a', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#f2f2f2', 
                      fontFamily: "'Inter', sans-serif", 
                      fontSize: '13px', 
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    {lang === 'english' ? 'ENG' : lang === 'hindi' ? 'HIN' : 'HING'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '16px', color: '#f2f2f2', display: 'block', marginBottom: '10px' }}>Chessboard theme</span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['green', 'brown', 'red', 'blue', 'icy_sea'].map((key) => {
                  const bg = { green: '#769656', brown: '#B58863', red: '#C45A41', blue: '#4B7399', icy_sea: '#8CA2AC' }[key];
                  return (
                    <button key={key} onClick={() => { setBoardTheme(key); localStorage.setItem('cwc_theme', key); }} style={{ width: 40, height: 40, borderRadius: 8, border: boardTheme === key ? '2px solid #fff' : '2px solid transparent', background: bg, cursor: 'pointer' }} title={key} />
                  );
                })}
              </div>
            </div>

            <div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '16px', color: '#f2f2f2', display: 'block', marginBottom: '10px' }}>Chess pieces</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['neo', 'neo_wood', 'ocean'].map((key) => (
                  <button key={key} onClick={() => { setPieceTheme(key); localStorage.setItem('cwc_pieces', key); }} style={{ width: 80, height: 48, borderRadius: 8, border: pieceTheme === key ? '2px solid #fff' : '2px solid transparent', background: '#3a3a3a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 32, height: 32 }}>
                      <img src={`https://images.chesscomfiles.com/chess-themes/pieces/${key}/150/wN.png`} alt={key} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.src = pieceImgUrl('N', true, 'neo'); }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '20px 0 12px', display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(242,242,242,0.35)' }}>
              <span>v0.1.3</span>
              <span>© ChessWithClaw</span>
              <span>@0xalyt</span>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      <style>{`
        @keyframes typingPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.2; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
        @keyframes clawPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.85; }
        }
        @keyframes agentArrive {
          0%   { transform: scale(0.5) translateY(8px); opacity: 0; }
          60%  { transform: scale(1.15) translateY(-3px); opacity: 1; }
          80%  { transform: scale(0.95) translateY(1px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes chatMsgIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes messageIn {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes reactIn {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      {isOffline && (
        <div className="absolute top-0 inset-x-0 bg-red-600 text-white font-semibold text-xs text-center py-1 z-[1000] shadow-[0_0_15px_rgba(220,38,38,0.5)]">
          You are offline. Reconnecting...
        </div>
      )}
      
      {/* HEADER (Fixed) */}
      <header style={{ height: '52px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: 'none', background: '#2c2826', zIndex: 50, position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px', cursor: 'pointer' }} onClick={handleGoHome}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(242,242,242,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <img 
            src="https://jkawzziklwoxfxicbtvf.supabase.co/storage/v1/object/public/assets/logo-v2.png" 
            alt="ChessWithClaw Logo" 
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            style={{ 
              height: '36px',
              width: 'auto',
              objectFit: 'contain',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              pointerEvents: 'none'
            }} 
          />
        </div>
        <button 
          data-testid="settings-button"
          onClick={handleOpenSettings}
          className="text-[rgba(242,242,242,0.7)] hover:text-[rgba(242,242,242,1)] transition-all active:translate-y-[1px] active:scale-[0.98]"
          style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Settings size={26} />
        </button>
      </header>
      {/* MAIN CONTENT AREA - RESPONSIVE */}
      {isDesktop ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', minHeight: 0 }}>
          {/* LEFT DESKTOP COLUMN */}
          <div style={{ width: '56%', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '12px 8px 12px 16px', gap: '8px', overflow: 'hidden' }}>
            
        
                                    {/* A) AGENT CARD */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', position: 'relative', flexShrink: 0 }}>
          {!agentConnected ? (
            <>
              {/* STATE ONE — waiting for the agent to connect */}
              {/* Left Column: Emoji & Name Pill */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, position: 'relative' }}>
                <span style={{ 
                  fontSize: '56px', 
                  lineHeight: 1, 
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  🦞
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    gap: '2px'
                  }}>
                    <span style={{ fontSize: '10px', color: 'rgba(242,242,242,0.5)', animation: 'floatZzz 2.5s ease-in-out infinite', animationDelay: '0s' }}>z</span>
                    <span style={{ fontSize: '13px', color: 'rgba(242,242,242,0.5)', animation: 'floatZzz 2.5s ease-in-out infinite', animationDelay: '0.3s' }}>z</span>
                    <span style={{ fontSize: '16px', color: 'rgba(242,242,242,0.5)', animation: 'floatZzz 2.5s ease-in-out infinite', animationDelay: '0.6s' }}>z</span>
                  </div>
                </span>
                <div 
                  style={{
                    background: '#111111',
                    border: '1.5px solid rgba(230,57,70,0.5)',
                    borderRadius: '9999px',
                    padding: '4px 10px',
                    color: 'rgba(242,242,242,0.6)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    fontWeight: 600,
                    maxWidth: '90px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {agentNameContent}
                </div>
              </div>
              {/* Right Column: Alert Banner */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, minWidth: 0, paddingTop: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(230,57,70,0.12)',
                  border: '1px solid rgba(230,57,70,0.4)',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  animation: 'pulseAlert 2s ease-in-out infinite',
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#fbbf24',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 'bold', lineHeight: 1 }}>!</span>
                  </div>
                  <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, sans-serif', lineHeight: 1.2 }}>
                    Invite your Agent first
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* STATE TWO — connected (agentConnected is true) */}
              {/* Left Column: Emoji & Name Pill */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, position: 'relative' }}>
                <span style={{ 
                  fontSize: '56px', 
                  lineHeight: 1, 
                  userSelect: 'none',
                  transform: emojiAnimating ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {displayedEmoji}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStatusPopover(prev => !prev);
                  }}
                  style={{
                    background: '#111111',
                    border: `1.5px solid ${presenceColor}`,
                    borderRadius: '9999px',
                    padding: '4px 10px',
                    color: '#f2f2f2',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    maxWidth: '90px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    outline: 'none'
                  }}
                >
                  {agentNameContent}
                </button>
                {showStatusPopover && (
                  <div onClick={(e) => e.stopPropagation()} style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#f2f2f2',
                    zIndex: 100,
                    fontFamily: 'Inter, sans-serif',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    alignItems: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}>
                    <span style={{ fontWeight: 600, color: presenceColor }}>{statusLabel}</span>
                    <span style={{ color: 'rgba(242,242,242,0.6)', fontSize: '11px' }}>{getAgentLastSeenText()}</span>
                  </div>
                )}
              </div>
              
              {/* Right Column: Thoughts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1, minWidth: 0, paddingTop: '8px', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 16px)', maskImage: 'linear-gradient(to bottom, transparent, black 16px)' }}>
                {previousThoughtText && (
                  <CloudBubble isPrevious={true}>
                    {previousThoughtText}
                  </CloudBubble>
                )}
                {thoughtText && thoughtVisible && (
                  <CloudBubble isPrevious={false}>
                    {thoughtText}
                  </CloudBubble>
                )}
              </div>
            </>
          )}
        </div>

                    {/* B) CHESS BOARD */}
        <div style={{ width: '100%', flex: 1, position: 'relative', padding: '0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          <div style={{ width: 'min(100%, calc(100vh - 52px - 72px - 48px - 32px))', aspectRatio: '1/1', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          
          <div style={{ borderRadius: "4px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", width: "100%", position: "relative", transition: "box-shadow 0.8s ease" }}>
            {reviewMoveIndex !== null && (
              <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
                <button 
                  onClick={() => setReviewMoveIndex(null)}
                  className="design-btn-primary"
                  style={{ padding: '8px 16px', borderRadius: '24px', fontSize: '13px', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center', whiteSpace: 'nowrap' }}
                >
                  Return to live
                </button>
              </div>
            )}
          <ChessBoard 
            fen={reviewMoveIndex !== null ? getFenAtMove(reviewMoveIndex) : (optimisticFen || game.fen)} 
            showCoordinates={false}
            onMove={makeMove} 
            isMyTurn={isMyTurn} 
            lastMove={lastMoveHighlight || optimisticLastMove || (game.move_history || [])[(game.move_history || [])?.length - 1] || null} arrivedSquare={arrivedSquare} 
            moveHistory={game.move_history || []}
            boardTheme={boardTheme}
            pieceTheme={pieceTheme}
            playerColor={'b'}
            onIllegalMove={handleIllegalMove}
            onCapture={handleCapture}
          />
          </div></div>
          <CapturedPiecesRow byWhite={getCapturedPieces(game?.fen).byWhite} byBlack={getCapturedPieces(game?.fen).byBlack} pieceTheme={pieceTheme} humanColor={game?.player_color || 'w'} />
          {(game.status === 'finished' || game.status === 'abandoned') && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center pointer-events-none">
              <div className="font-sans text-[32px] font-bold text-white tracking-widest drop-shadow-md">
                {game.status === 'abandoned' ? 'GAME ABANDONED' : 'GAME OVER'}
              </div>
              <div className="font-sans text-sm text-red-500 mt-1 font-bold tracking-wide">
                {game?.status === 'abandoned' ? 'Game expired due to inactivity' : (game?.result === 'draw' ? 'Draw by ' + game?.result_reason : (game?.winner === (game?.player_color === 'b' ? 'white' : 'black') ? 'You won by ' : agentName + ' won by ') + game?.result_reason)}
              </div>
            </div>
          )}
        </div></div>
        {/* STEP 4: BOTTOM INFO BAR */}
      <BottomStatusBar agentConnected={agentConnected} game={game} agentName={agentName} isMobile={false} />
          {/* RIGHT DESKTOP COLUMN */}
          <div style={{ width: '40%', minWidth: '380px', display: 'flex', flexDirection: 'column', padding: '12px 16px 12px 8px', gap: '8px', overflow: 'hidden', minHeight: 0 }}>
            
            {/* ACTION BUTTONS (Desktop) */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {/* Only Move History button is needed if you want it here, but actually we use the move history panel header to toggle it.
                  If the prompt implies keeping the toggle button in the row for move history, then we keep the move history button here. */}
              <button onClick={() => setMoveHistoryOpen(!moveHistoryOpen)} style={{ flex: 1, background: '#3d3937', border: 'none', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.44l5.46 5.46"/></svg>
              </button>
            </div>
            
            {/* MOVE HISTORY (Desktop) */}
            <div style={{ background: '#111111', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden', height: moveHistoryOpen ? '240px' : '0px', transition: 'height 280ms ease-out', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0 12px', height: '36px', borderBottom: '1px solid #1a1a1a', background: '#161616', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(242,242,242,0.3)', letterSpacing: '0.08em' }}>
                  MOVE HISTORY · {game?.move_history?.length || 0} MOVES
                </span>
              </div>
              <div ref={moveHistoryScrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }} className="scrollbar-none">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: '8px', paddingBottom: '4px', borderBottom: '1px solid #111', marginBottom: '4px' }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'rgba(242,242,242,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>#</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'rgba(242,242,242,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>You</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'rgba(242,242,242,0.3)', textTransform: 'uppercase', fontWeight: 600 }}>{agentName}</div>
                  </div>
                  {Array.from({ length: Math.ceil((game?.move_history || []).length / 2) }).map((_, i) => {
                    const youMove = game?.player_color === 'b' ? game.move_history[i * 2 + 1] : game.move_history[i * 2];
                    const agentMove = game?.player_color === 'b' ? game.move_history[i * 2] : game.move_history[i * 2 + 1];
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: '8px', padding: '16px 0', fontFamily: "'Inter', sans-serif", fontSize: '14px', alignItems: 'center' }}>
                        <div style={{ color: 'rgba(242,242,242,0.25)' }}>{i + 1}.</div>
                        <div onClick={() => { if (youMove) setReviewMoveIndex(game.player_color === 'b' ? i * 2 + 1 : i * 2); }} style={{ color: '#f2f2f2', display:'flex', alignItems:'center', gap:4, cursor: 'pointer' }}>
                          {youMove?.san && (() => {
                            const { letter, rest } = sanToPieceImg(youMove.san, true, pieceTheme);
                            return (
                              <>
                                <img src={pieceImgUrl(letter, true, pieceTheme)} alt="" style={{width:15,height:15,objectFit:'contain'}}
                                  onError={(e)=>{ if(!e.target.dataset.fb){e.target.dataset.fb='1'; e.target.src=`https://lichess1.org/assets/piece/cburnett/w${letter}.svg`;} }}
                                />
                                <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:13}}>{rest}</span>
                                {(youMove?.created_at || youMove?.timestamp) && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'rgba(242,242,242,0.35)' }}>{formatMoveTime(youMove.created_at || youMove.timestamp, game?.created_at)}</span>}
                              </>
                            );
                          })()}
                        </div>
                        <div onClick={() => { if (agentMove) setReviewMoveIndex(game.player_color === 'b' ? i * 2 : i * 2 + 1); }} style={{ color: '#e63946', display:'flex', alignItems:'center', gap:4, cursor: 'pointer' }}>
                          {agentMove?.san && (() => {
                            const { letter, rest } = sanToPieceImg(agentMove.san, false, pieceTheme);
                            return (
                              <>
                                <img src={pieceImgUrl(letter, false, pieceTheme)} alt="" style={{width:15,height:15,objectFit:'contain'}}
                                  onError={(e)=>{ if(!e.target.dataset.fb){e.target.dataset.fb='1'; e.target.src=`https://lichess1.org/assets/piece/cburnett/b${letter}.svg`;} }}
                                />
                                <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:13}}>{rest}</span>
                                {(agentMove?.created_at || agentMove?.timestamp) && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'rgba(242,242,242,0.35)' }}>{formatMoveTime(agentMove.created_at || agentMove.timestamp, game?.created_at)}</span>}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CHAT SECTION (Desktop) */}
            <div style={{ flexShrink: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '0', borderTop: 'none', background: '#111111', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ flexShrink: 0, padding: '10px 12px', fontFamily: "'Inter', sans-serif", fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(242,242,242,0.3)' }}>
                CHAT WITH {agentName.toUpperCase()}
              </div>
              <div ref={chatMessagesRef} style={{ flex: 1, overflowY: 'auto', padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="scrollbar-none scroll-smooth">
                {normalizedMessages.length === 0 ? (
                  <div style={{ color: '#2a2a2a', fontSize: '13px', textAlign: 'center', margin: 'auto', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}><LobsterEmoji /></span>
                    <span>{agentName} can chat while playing</span>
                  </div>
                ) : (
                  renderChatMessages()
                )}
              </div>
              <form onSubmit={sendMessage} style={{ padding: '6px 12px', borderTop: '1px solid #111', display: 'flex', alignItems: 'center', gap: '8px', height: '44px', boxSizing: 'border-box' }}>
                <input id="chat-input" type="text" value={chatInput} onChange={handleChatInputChange} placeholder={isSpectator ? "Spectating..." : `Message ${agentName}...`} disabled={isSpectator} style={{ flex: 1, height: '34px', background: '#080808', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f2f2f2', fontFamily: "'Inter', sans-serif", fontSize: '13px', padding: '0 10px', outline: 'none', boxSizing: 'border-box' }} />
                <button type="submit" disabled={isSpectator || !chatInput.trim()} style={{ width: '34px', height: '34px', background: (!isSpectator && chatInput.trim()) ? '#e63946' : 'rgba(230,57,70,0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (!isSpectator && chatInput.trim()) ? 'pointer' : 'default', border: 'none', color: 'white', flexShrink: 0 }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* MOBILE LAYOUT */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            
            {/* AGENT CARD (Mobile) */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', position: 'relative', flexShrink: 0 }}>
              {!agentConnected ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, position: 'relative' }}>
                    <span style={{ fontSize: '56px', lineHeight: 1, userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      🦞
                      <div style={{ position: 'absolute', top: '-4px', right: '-8px', display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '2px' }}>
                        <span style={{ fontSize: '10px', color: 'rgba(242,242,242,0.5)', animation: 'floatZzz 2.5s ease-in-out infinite', animationDelay: '0s' }}>z</span>
                        <span style={{ fontSize: '13px', color: 'rgba(242,242,242,0.5)', animation: 'floatZzz 2.5s ease-in-out infinite', animationDelay: '0.3s' }}>z</span>
                        <span style={{ fontSize: '16px', color: 'rgba(242,242,242,0.5)', animation: 'floatZzz 2.5s ease-in-out infinite', animationDelay: '0.6s' }}>z</span>
                      </div>
                    </span>
                    <div style={{ background: '#111111', border: '1.5px solid rgba(230,57,70,0.5)', borderRadius: '9999px', padding: '4px 10px', color: 'rgba(242,242,242,0.6)', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, maxWidth: '90px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {agentNameContent}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, minWidth: 0, paddingTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.4)', borderRadius: '14px', padding: '12px 16px' }}>
                      <div style={{ width: '20px', height: '20px', background: '#fbbf24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 'bold', lineHeight: 1 }}>!</span></div>
                      <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Invite your Agent first</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, position: 'relative' }}>
                    <span style={{ fontSize: '56px', lineHeight: 1, userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: emojiAnimating ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>{displayedEmoji}</span>
                    <button onClick={(e) => { e.stopPropagation(); setShowStatusPopover(prev => !prev); }} style={{ background: '#111111', border: `1.5px solid ${presenceColor}`, borderRadius: '9999px', padding: '4px 10px', color: '#f2f2f2', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, cursor: 'pointer', maxWidth: '90px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', outline: 'none' }}>
                      {agentNameContent}
                    </button>
                    {showStatusPopover && (
                      <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#f2f2f2', zIndex: 100, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: presenceColor }}>{statusLabel}</span>
                        <span style={{ color: 'rgba(242,242,242,0.6)', fontSize: '11px' }}>{getAgentLastSeenText()}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1, minWidth: 0, paddingTop: '8px', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 16px)', maskImage: 'linear-gradient(to bottom, transparent, black 16px)' }}>
                    {previousThoughtText && ( <CloudBubble isPrevious={true}>{previousThoughtText}</CloudBubble> )}
                    {thoughtText && thoughtVisible && ( <CloudBubble isPrevious={false}>{thoughtText}</CloudBubble> )}
                  </div>
                </>
              )}
            </div>

            {/* CHESS BOARD (Mobile) */}
            <div style={{ width: '100%', flex: 1, minHeight: 0, position: 'relative', padding: '0px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {game?.in_check && game.status === 'active' && (
                <div style={{ background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)', borderRadius: '8px', padding: '6px 12px', marginBottom: '8px', color: '#e63946', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600, textAlign: 'center', flexShrink: 0 }}>⚠️ Check!</div>
              )}
              <div style={{ width: '100%', maxHeight: '100%', aspectRatio: '1/1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: "4px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", position: "relative", transition: "box-shadow 0.8s ease" }}>
                  {reviewMoveIndex !== null && (
                    <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
                      <button 
                        onClick={() => setReviewMoveIndex(null)}
                        className="design-btn-primary"
                        style={{ padding: '8px 16px', borderRadius: '24px', fontSize: '13px', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center', whiteSpace: 'nowrap' }}
                      >
                        Return to live
                      </button>
                    </div>
                  )}
                  <ChessBoard fen={reviewMoveIndex !== null ? getFenAtMove(reviewMoveIndex) : (optimisticFen || game.fen)} showCoordinates={false} onMove={makeMove} isMyTurn={isMyTurn} lastMove={lastMoveHighlight || optimisticLastMove || (game.move_history || [])[(game.move_history || [])?.length - 1] || null} arrivedSquare={arrivedSquare} moveHistory={game.move_history || []} boardTheme={boardTheme} pieceTheme={pieceTheme} playerColor={game?.player_color || 'w'} onIllegalMove={handleIllegalMove} onCapture={handleCapture} />
                </div>
              </div>
              <div style={{ padding: '0 16px' }}><CapturedPiecesRow byWhite={getCapturedPieces(game?.fen).byWhite} byBlack={getCapturedPieces(game?.fen).byBlack} pieceTheme={pieceTheme} humanColor={game?.player_color || 'w'} /></div>
              {(game.status === 'finished' || game.status === 'abandoned') && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center pointer-events-none">
                  <div className="font-sans text-[32px] font-bold text-white tracking-widest drop-shadow-md">{game.status === 'abandoned' ? 'GAME ABANDONED' : 'GAME OVER'}</div>
                  <div className="font-sans text-sm text-red-500 mt-1 font-bold tracking-wide">{game?.status === 'abandoned' ? 'Game expired due to inactivity' : (game?.result === 'draw' ? 'Draw by ' + game?.result_reason : (game?.winner === (game?.player_color === 'b' ? 'white' : 'black') ? 'You won by ' : agentName + ' won by ') + game?.result_reason)}</div>
                </div>
              )}
            </div>
            
            {/* MOBILE BUTTONS */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', background: 'transparent', flexShrink: 0, justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 41 }}>
                <button onClick={() => { setMoveHistoryOpen(!moveHistoryOpen); setChatMobileOpen(false); }} style={{ flex: 1, height: '60px', background: 'linear-gradient(180deg, #46423f 0%, #3d3937 100%)', border: 'none', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: moveHistoryOpen ? '#e63946' : '#e0dbd9', cursor: 'pointer', transition: 'color 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                  <History size={28} />
                </button>
                <button onClick={() => { setChatMobileOpen(!chatMobileOpen); setMoveHistoryOpen(false); }} style={{ flex: 1, height: '60px', background: 'linear-gradient(180deg, #46423f 0%, #3d3937 100%)', border: 'none', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: chatMobileOpen ? '#e63946' : '#e0dbd9', position: 'relative', cursor: 'pointer', transition: 'color 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                  <MessageSquare size={28} />
                  {chatMobileOpen === false && normalizedMessages.length > 0 && normalizedMessages[normalizedMessages.length - 1].role === 'agent' && (
                    <div style={{ position: 'absolute', top: '16px', right: '36px', width: '8px', height: '8px', background: '#e63946', borderRadius: '50%' }} />
                  )}
                </button>
              </div>
              
              {/* MOBILE OVERLAYS (ABOVE BUTTONS) */}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: '84px', zIndex: 50, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {/* CHAT OVERLAY */}
                <div style={{ 
                  pointerEvents: chatMobileOpen ? 'auto' : 'none',
                  opacity: chatMobileOpen ? 1 : 0,
                  transform: chatMobileOpen ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 280ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  background: '#1c1a19',
                  borderTopLeftRadius: '16px',
                  borderTopRightRadius: '16px',
                  boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  height: '50vh',
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Chat with {agentName}</div>
                    <button onClick={() => setChatMobileOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}><XIcon size={16} /></button>
                  </div>
                  <div ref={chatMessagesRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)', paddingBottom: '8px', paddingTop: '16px' }} className="scrollbar-none scroll-smooth">
                    {normalizedMessages.length === 0 ? (
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center', margin: 'auto', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}><LobsterEmoji /></span>
                        <span>{agentName} can chat while playing</span>
                      </div>
                    ) : (
                      renderChatMessages()
                    )}
                  </div>
                  <form 
                    onSubmit={sendMessage} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '48px', boxSizing: 'border-box' }}
                  >
                    <input
                      id="chat-input-mobile"
                      data-testid="chat-input-mobile"
                      type="text"
                      value={chatInput}
                      onChange={handleChatInputChange}
                      placeholder={isSpectator ? "Spectating..." : `Chat with ${agentName}...`}
                      disabled={isSpectator}
                      style={{ flex: 1, height: '44px', background: 'rgba(61,57,55,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '22px', color: '#f2f2f2', fontFamily: "'Inter', sans-serif", fontSize: '14px', padding: '0 16px', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box' }}
                      onFocus={(e) => { e.target.style.background = 'rgba(61,57,55,1)'; e.target.style.borderColor = 'rgba(230,57,70,0.5)'; }}
                      onBlur={(e) => { e.target.style.background = 'rgba(61,57,55,0.8)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    />
                    <button 
                      data-testid="chat-send-mobile"
                      type="submit"
                      disabled={isSpectator || !chatInput.trim()}
                      style={{ width: '44px', height: '44px', background: (!isSpectator && chatInput.trim()) ? '#e63946' : 'rgba(230,57,70,0.5)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (!isSpectator && chatInput.trim()) ? 'pointer' : 'default', border: 'none', color: 'white', flexShrink: 0, transition: 'all 0.1s ease', boxShadow: (!isSpectator && chatInput.trim()) ? '0 4px 12px rgba(230,57,70,0.4)' : 'none' }}
                      onMouseDown={(e) => { if(!isSpectator && chatInput.trim()) { e.currentTarget.style.transform = 'scale(0.92)'; } }}
                      onMouseUp={(e) => { if(!isSpectator && chatInput.trim()) { e.currentTarget.style.transform = 'scale(1)'; } }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>

                {/* MOVE HISTORY OVERLAY */}
                <div style={{ 
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  pointerEvents: moveHistoryOpen ? 'auto' : 'none',
                  opacity: moveHistoryOpen ? 1 : 0,
                  transform: moveHistoryOpen ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 280ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  background: '#1c1a19',
                  borderTopLeftRadius: '16px',
                  borderTopRightRadius: '16px',
                  boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '40vh'
                }}>
                  <div 
                    onClick={() => setMoveHistoryOpen(!moveHistoryOpen)}
                    style={{ minHeight: '44px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', zIndex: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(242,242,242,0.6)', letterSpacing: '0.05em' }}>
                      MOVE HISTORY
                    </span>
                    <ChevronDown size={20} color="rgba(255,255,255,0.6)" style={{ transform: moveHistoryOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 280ms ease-out' }} />
                  </div>
                  <div 
                    ref={moveHistoryScrollRef}
                    style={{ overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '2px' }} 
                    className="scrollbar-none"
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(242,242,242,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>#</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(242,242,242,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>You</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(242,242,242,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>{agentName}</div>
                    </div>

              
              </div></div>
            </div>
          </div>
          
          </div>{/* BOTTOM INFO BAR (Mobile) */}
          <BottomStatusBar agentConnected={agentConnected} game={game} agentName={agentName} isMobile={true} />
        </>
      )}
      
      {/* STATUS BAR */}

      <div style={{ position: 'absolute', opacity: 0.01, width: 1, height: 1, overflow: 'hidden', zIndex: -1 }} data-testid="game-status">{game.status}</div>
      <div style={{ position: 'absolute', opacity: 0.01, width: 1, height: 1, overflow: 'hidden', zIndex: -1 }} data-testid="turn-indicator">
        {(() => {
          const agentName = game?.agent_name || 'Your Agent';
          if (game?.status === 'waiting' || !game?.agent_connected) return `Waiting for ${agentName}`;
          if (trueTurn === 'white') return 'Your Turn';
          return `${agentName} is thinking`;
        })()}
      </div>
      <input 
        type="text" 
        data-testid="thinking-input" 
        style={{ position: 'absolute', opacity: 0.01, width: 1, height: 1, zIndex: -1 }} 
        aria-hidden="true" 
        tabIndex={-1} 
      />

            {showGameOverModal && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 1000, 
            background: 'rgba(0,0,0,0.85)', 
            backdropFilter: 'blur(4px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            opacity: closingGameOver ? 0 : 1, 
            transition: 'opacity 200ms ease',
            animation: 'fadeIn 200ms ease-out'
          }}
        >
          <div 
            style={{ 
              background: '#111111', 
              border: '1px solid #222222', 
              borderRadius: '20px', 
              padding: '28px', 
              maxWidth: '340px', 
              width: 'calc(100% - 32px)', 
              textAlign: 'center', 
              position: 'relative', 
              zIndex: 1,
              animation: 'springUp 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275) 80ms backwards'
            }}
          >
            <div 
              style={{ 
                fontSize: '56px', 
                marginBottom: '16px', 
                display: 'flex', 
                justifyContent: 'center',
                animation: 'popIn 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275) 180ms backwards'
              }}
            >
              {game?.winner === (game?.player_color === 'w' ? 'white' : 'black') ? <span style={{ color: '#739552' }}>👑</span> : game?.result === 'draw' ? '🤝' : <LobsterEmoji />}
            </div>
            
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '24px', color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              {game?.result === 'draw' ? 'Draw' : (game?.winner === (game?.player_color === 'b' ? 'white' : 'black') ? 'You Won' : `${agentName} Won`)}
            </h2>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(242,242,242,0.5)', margin: '0 0 24px 0', fontWeight: 500 }}>
              {game?.result_reason}
            </div>

            {/* Final Agent Thought/Chat in CloudBubble */}
            {(thoughtText || normalizedMessages.length > 0) && (
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                <CloudBubble isPrevious={false}>
                  {thoughtText || (normalizedMessages.length > 0 ? (normalizedMessages[normalizedMessages.length - 1].content || normalizedMessages[normalizedMessages.length - 1].text) : 'Good game!')}
                </CloudBubble>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                data-testid="game-over-rematch"
                onClick={handleRematch} 
                style={{
                  flex: 1, 
                  background: '#e63946', 
                  color: 'white', 
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600, 
                  fontSize: '14px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'rgba(255,255,255,0.15) 0px 1px 0px 0px inset'
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <RotateCcw size={16} />
                Rematch
              </button>
              <button 
                onClick={handleCloseGameOverModal} 
                style={{
                  flex: 1, 
                  background: 'transparent', 
                  color: '#f2f2f2', 
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600, 
                  fontSize: '14px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  border: '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer'
                }}
                onMouseDown={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'scale(0.96)'; }}
                onMouseUp={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes springUp {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0); }
          80% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }

        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes scalePulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        @keyframes pressPulse { 0% { transform: scale(1); } 50% { transform: scale(0.94); } 100% { transform: scale(1); } }
          @import url('https://fonts.googleapis.com/css2?family=family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes ripple {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(2.4); opacity: 0;   }
        }
        @keyframes msgSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pillPop {
          0%   { transform: scale(1);    }
          40%  { transform: scale(1.12); }
          70%  { transform: scale(0.96); }
          100% { transform: scale(1);    }
        }
        @keyframes floatLobster {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes agentFlash {
          0% { background-color: rgba(255, 255, 255, 0.8); }
          100% { background-color: rgba(255, 255, 255, 0); }
        }
        @keyframes pieceLift {
          0% { transform: scale(1) translateY(0); filter: none; }
          100% { transform: scale(1.15) translateY(-4px); filter: none; }
        }
        @keyframes pieceDrop {
          0% { transform: scale(1.15) translateY(-4px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes pieceCapture {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.5); opacity: 0; }
        }
        @keyframes boardShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        @keyframes agentMoveFlash {
          0% { background-color: rgba(230, 57, 70, 0.6); }
          100% { background-color: rgba(255, 213, 79, 0.3); }
        }
        @keyframes pieceEntrance {
          0% { opacity: 0; transform: scale(0.8) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes boardThinkingGlow {
          0%, 100% { box-shadow: 0 0 0 1px #0f0f0f, 0 4px 24px rgba(0,0,0,0.8); }
          50% { box-shadow: 0 0 0 1px #0f0f0f, 0 4px 24px rgba(230,57,70,0.2), 0 0 12px rgba(230,57,70,0.1); }
        }
        @keyframes checkPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        input::placeholder { color: #888; }
      `}} />

    </div>
  );
}





