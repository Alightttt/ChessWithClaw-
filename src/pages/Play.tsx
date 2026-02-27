import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Chess, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Copy, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Play() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState(new Chess());
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [agentConnected, setAgentConnected] = useState(false);
  const [humanConnected, setHumanConnected] = useState(false);
  const [currentThinking, setCurrentThinking] = useState('');
  const [thinkingLog, setThinkingLog] = useState<any[]>([]);
  
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchGame = async () => {
      const { data, error } = await supabase.from('games').select('*').eq('id', id).single();
      if (error) {
        console.error('Error fetching game:', error);
        setLoading(false);
        return;
      }
      
      setGameState(data);
      setAgentConnected(data.agent_connected);
      setHumanConnected(data.human_connected);
      setCurrentThinking(data.current_thinking || '');
      setThinkingLog(data.thinking_log || []);
      
      try {
        const newGame = new Chess(data.fen);
        setGame(newGame);
      } catch (e) {
        console.error('Invalid FEN:', e);
      }
      setLoading(false);
    };

    fetchGame();

    // Subscribe to realtime updates
    const channel = supabase.channel(`game-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${id}` }, (payload) => {
        const newData = payload.new;
        setGameState(newData);
        setAgentConnected(newData.agent_connected);
        setHumanConnected(newData.human_connected);
        setCurrentThinking(newData.current_thinking || '');
        setThinkingLog(newData.thinking_log || []);
        
        try {
          const newGame = new Chess(newData.fen);
          setGame(newGame);
        } catch (e) {
          console.error('Invalid FEN update:', e);
        }
      })
      .subscribe();

    // Set human connected on mount
    const setConnected = async (status: boolean) => {
      await supabase.from('games').update({ human_connected: status }).eq('id', id);
    };
    
    setConnected(true);
    
    // Heartbeat
    heartbeatInterval.current = setInterval(() => {
      setConnected(true);
    }, 15000);

    return () => {
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      setConnected(false);
      supabase.removeChannel(channel);
    };
  }, [id]);

  const copyAgentLink = () => {
    const url = `${window.location.origin}/agent/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const makeMove = async (move: { from: string, to: string, promotion?: string }) => {
    if (gameState?.status === 'finished') return false;
    if (game.turn() !== 'w') {
      showError("It's not your turn!");
      return false;
    }

    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      
      if (result) {
        setGame(gameCopy);
        
        // Check game end conditions
        let status = 'active';
        let winner = null;
        let resultReason = null;
        
        if (gameCopy.isCheckmate()) {
          status = 'finished';
          winner = 'white';
          resultReason = 'Checkmate';
        } else if (gameCopy.isDraw()) {
          status = 'finished';
          winner = 'draw';
          if (gameCopy.isStalemate()) resultReason = 'Stalemate';
          else if (gameCopy.isThreefoldRepetition()) resultReason = 'Threefold Repetition';
          else if (gameCopy.isInsufficientMaterial()) resultReason = 'Insufficient Material';
          else resultReason = '50-Move Rule';
        }
        
        const newMoveHistory = [
          ...(gameState?.move_history || []),
          {
            moveNumber: Math.floor((gameState?.move_history?.length || 0) / 2) + 1,
            san: result.san,
            uci: `${result.from}${result.to}${result.promotion || ''}`,
            fen: gameCopy.fen(),
            timestamp: new Date().toISOString(),
            color: 'w'
          }
        ];

        await supabase.from('games').update({
          fen: gameCopy.fen(),
          turn: 'b',
          status: status,
          winner: winner,
          result_reason: resultReason,
          move_history: newMoveHistory,
          current_thinking: '' // Clear thinking for next turn
        }).eq('id', id);
        
        return true;
      }
    } catch (e: any) {
      showError(e.message || "Invalid move");
      return false;
    }
    return false;
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    return makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to queen for simplicity
    });
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 3000);
  };

  const playAgain = async () => {
    const newId = uuidv4();
    await supabase.from('games').insert([
      {
        id: newId,
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        turn: 'w',
        status: 'waiting',
      }
    ]);
    navigate(`/play/${newId}`);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-[#c9973a]"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!gameState) {
    return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-red-500">Game not found</div>;
  }

  const isMyTurn = game.turn() === 'w' && gameState.status !== 'finished';
  const isAgentTurn = game.turn() === 'b' && gameState.status !== 'finished';

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
      {/* Left Column: Board */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-[480px] mb-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", agentConnected ? "bg-green-500" : "bg-red-500")} />
            <span className="text-gray-400">OpenClaw (Black) {agentConnected ? 'Connected' : 'Offline'}</span>
          </div>
          {isAgentTurn && agentConnected && (
             <span className="text-[#c9973a] animate-pulse flex items-center gap-1">
               <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
             </span>
          )}
        </div>
        
        <div className="w-full max-w-[480px] rounded-sm overflow-hidden shadow-2xl shadow-black/50 border-4 border-[#1a1a1a]">
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardOrientation="white"
            customDarkSquareStyle={{ backgroundColor: '#779556' }}
            customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
            animationDuration={200}
            arePiecesDraggable={isMyTurn}
          />
        </div>

        <div className="w-full max-w-[480px] mt-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", humanConnected ? "bg-green-500" : "bg-red-500")} />
            <span className="text-gray-400">You (White)</span>
          </div>
          {isMyTurn && (
             <span className="text-green-500 font-semibold">Your Turn</span>
          )}
        </div>
      </div>

      {/* Right Column: Info & Controls */}
      <div className="flex-1 flex flex-col gap-6 max-w-md w-full">
        {/* Connection & Setup Banner */}
        {!agentConnected && gameState.status !== 'finished' && (
          <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-xl">
            <h3 className="text-[#c9973a] font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Waiting for OpenClaw
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Open the agent link in another tab or send it to your agent script to start playing.
            </p>
            <button
              onClick={copyAgentLink}
              className="w-full flex items-center justify-center gap-2 bg-[#2a2a2a] hover:bg-[#333] text-white py-2 px-4 rounded-lg transition-colors text-sm"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Agent Link'}
            </button>
          </div>
        )}

        {/* Game Over Banner */}
        {gameState.status === 'finished' && (
          <div className="bg-[#1a1a1a] border border-[#c9973a] p-6 rounded-xl text-center">
            <h2 className="text-2xl font-bold text-[#c9973a] mb-2">Game Over</h2>
            <p className="text-lg text-white mb-1">
              {gameState.winner === 'white' ? 'You won!' : gameState.winner === 'black' ? 'OpenClaw won!' : 'Draw!'}
            </p>
            <p className="text-sm text-gray-400 mb-6">{gameState.result_reason}</p>
            <button
              onClick={playAgain}
              className="w-full flex items-center justify-center gap-2 bg-[#c9973a] hover:bg-[#b38531] text-black font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Play Again
            </button>
          </div>
        )}

        {/* Thinking Panel */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl flex flex-col h-[200px]">
          <div className="p-3 border-b border-[#333] font-semibold text-sm text-gray-300">
            OpenClaw's Brain
          </div>
          <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-gray-400 flex flex-col gap-1">
            {isAgentTurn && currentThinking ? (
              <div className="text-[#c9973a] break-all">{currentThinking}</div>
            ) : isAgentTurn ? (
              <div className="animate-pulse">Thinking...</div>
            ) : (
              <div className="text-gray-600 italic">Waiting for turn...</div>
            )}
            {thinkingLog.slice(-5).reverse().map((log, i) => (
              <div key={i} className="opacity-50 truncate">
                D{log.depth} | {log.score > 0 ? '+' : ''}{log.score} | {log.pv}
              </div>
            ))}
          </div>
        </div>

        {/* Move History */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl flex flex-col flex-1 min-h-[200px]">
          <div className="p-3 border-b border-[#333] font-semibold text-sm text-gray-300">
            Move History
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {gameState.move_history?.reduce((result: any[], value: any, index: number, array: any[]) => {
                if (index % 2 === 0) result.push(array.slice(index, index + 2));
                return result;
              }, []).map((pair: any[], i: number) => (
                <div key={i} className="col-span-2 grid grid-cols-[30px_1fr_1fr] gap-2 py-1 border-b border-[#222] last:border-0">
                  <span className="text-gray-600">{i + 1}.</span>
                  <span className="text-gray-300">{pair[0]?.san}</span>
                  <span className="text-[#c9973a]">{pair[1]?.san || ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {errorToast && (
        <div className="fixed bottom-4 right-4 bg-red-900/90 border border-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <AlertCircle className="w-5 h-5" />
          {errorToast}
        </div>
      )}
    </div>
  );
}
