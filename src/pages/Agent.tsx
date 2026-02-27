import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Loader2, Activity, Cpu, Wifi, WifiOff } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Agent() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState(new Chess());
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [agentConnected, setAgentConnected] = useState(false);
  const [humanConnected, setHumanConnected] = useState(false);
  const [currentThinking, setCurrentThinking] = useState('');
  const [thinkingLog, setThinkingLog] = useState<any[]>([]);
  
  const workerRef = useRef<Worker | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const thinkingTimeout = useRef<NodeJS.Timeout | null>(null);
  const isThinkingRef = useRef(false);

  useEffect(() => {
    if (!id) return;

    // Initialize Stockfish Worker
    workerRef.current = new Worker('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');
    
    workerRef.current.onmessage = (event) => {
      const line = event.data;
      if (typeof line !== 'string') return;
      
      // Parse thinking info
      if (line.startsWith('info depth')) {
        const depthMatch = line.match(/depth (\d+)/);
        const scoreMatch = line.match(/score cp (-?\d+)/);
        const pvMatch = line.match(/pv (.+)/);
        
        if (depthMatch && scoreMatch && pvMatch) {
          const depth = parseInt(depthMatch[1]);
          const score = parseInt(scoreMatch[1]) / 100; // Convert centipawns to pawns
          const pv = pvMatch[1];
          
          const thinkingStr = `Depth ${depth} | Score ${score > 0 ? '+' : ''}${score} | PV: ${pv}`;
          setCurrentThinking(thinkingStr);
          
          // Throttle updates to DB to avoid spamming
          if (!thinkingTimeout.current) {
            thinkingTimeout.current = setTimeout(async () => {
              await supabase.from('games').update({ current_thinking: thinkingStr }).eq('id', id);
              thinkingTimeout.current = null;
            }, 500);
          }
        }
      }
      
      // Parse bestmove
      if (line.startsWith('bestmove')) {
        const bestMove = line.split(' ')[1];
        if (bestMove && bestMove !== '(none)') {
          applyBestMove(bestMove);
        }
      }
    };

    workerRef.current.postMessage('uci');
    workerRef.current.postMessage('setoption name Skill Level value 20'); // Max skill

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
      
      try {
        const newGame = new Chess(data.fen);
        setGame(newGame);
        if (data.turn === 'b' && data.status !== 'finished') {
          startThinking(data.fen);
        }
      } catch (e) {
        console.error('Invalid FEN:', e);
      }
      setLoading(false);
    };

    fetchGame();

    // Subscribe to realtime updates
    const channel = supabase.channel(`game-${id}-agent`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${id}` }, (payload) => {
        const newData = payload.new;
        setGameState(newData);
        setHumanConnected(newData.human_connected);
        
        try {
          const newGame = new Chess(newData.fen);
          setGame(newGame);
          
          // If it's black's turn and we aren't already thinking, start thinking
          if (newData.turn === 'b' && newData.status !== 'finished' && !isThinkingRef.current) {
            startThinking(newData.fen);
          }
        } catch (e) {
          console.error('Invalid FEN update:', e);
        }
      })
      .subscribe();

    // Set agent connected on mount
    const setConnected = async (status: boolean) => {
      await supabase.from('games').update({ agent_connected: status }).eq('id', id);
      setAgentConnected(status);
    };
    
    setConnected(true);
    
    // Heartbeat
    heartbeatInterval.current = setInterval(() => {
      setConnected(true);
    }, 15000);

    return () => {
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      if (thinkingTimeout.current) clearTimeout(thinkingTimeout.current);
      setConnected(false);
      supabase.removeChannel(channel);
      if (workerRef.current) workerRef.current.terminate();
    };
  }, [id]);

  const startThinking = (fen: string) => {
    if (!workerRef.current || isThinkingRef.current) return;
    
    isThinkingRef.current = true;
    setCurrentThinking('Analyzing position...');
    
    workerRef.current.postMessage(`position fen ${fen}`);
    // Think for 3 seconds
    workerRef.current.postMessage('go movetime 3000');
  };

  const applyBestMove = async (bestMoveUci: string) => {
    if (!gameState || gameState.status === 'finished') {
      isThinkingRef.current = false;
      return;
    }

    try {
      const gameCopy = new Chess(game.fen());
      
      // Convert UCI to from/to/promotion
      const from = bestMoveUci.substring(0, 2);
      const to = bestMoveUci.substring(2, 4);
      const promotion = bestMoveUci.length > 4 ? bestMoveUci.substring(4, 5) : undefined;
      
      const result = gameCopy.move({ from, to, promotion });
      
      if (result) {
        setGame(gameCopy);
        
        // Check game end conditions
        let status = 'active';
        let winner = null;
        let resultReason = null;
        
        if (gameCopy.isCheckmate()) {
          status = 'finished';
          winner = 'black';
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
            uci: bestMoveUci,
            fen: gameCopy.fen(),
            timestamp: new Date().toISOString(),
            color: 'b'
          }
        ];

        // Add to thinking log
        const newThinkingLog = [
          ...(gameState?.thinking_log || []),
          {
            moveNumber: Math.floor((gameState?.move_history?.length || 0) / 2) + 1,
            depth: currentThinking.match(/Depth (\d+)/)?.[1] || 0,
            score: currentThinking.match(/Score ([+-]?\d+\.?\d*)/)?.[1] || 0,
            pv: currentThinking.match(/PV: (.+)/)?.[1] || '',
            time: 3000,
            timestamp: new Date().toISOString()
          }
        ];

        await supabase.from('games').update({
          fen: gameCopy.fen(),
          turn: 'w',
          status: status,
          winner: winner,
          result_reason: resultReason,
          move_history: newMoveHistory,
          thinking_log: newThinkingLog,
          current_thinking: ''
        }).eq('id', id);
        
        setThinkingLog(newThinkingLog);
      }
    } catch (e: any) {
      console.error('Agent failed to apply move:', e);
    } finally {
      isThinkingRef.current = false;
      setCurrentThinking('');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-[#c9973a]"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!gameState) {
    return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-red-500">Game not found</div>;
  }

  const isAgentTurn = game.turn() === 'b' && gameState.status !== 'finished';

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#333] pb-4">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 text-[#c9973a]" />
            <div>
              <h1 className="text-2xl font-bold text-[#c9973a]">OpenClaw Agent</h1>
              <p className="text-sm text-gray-400 font-mono">ID: {id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              {humanConnected ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
              <span className={humanConnected ? "text-green-500" : "text-red-500"}>Human</span>
            </div>
            <div className="flex items-center gap-2">
              {agentConnected ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
              <span className={agentConnected ? "text-green-500" : "text-red-500"}>Agent</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Board (Read Only) */}
          <div className="flex-1 max-w-[400px]">
            <div className="w-full rounded-sm overflow-hidden shadow-2xl shadow-black/50 border-4 border-[#1a1a1a] opacity-80 pointer-events-none">
              <Chessboard
                position={game.fen()}
                boardOrientation="white"
                customDarkSquareStyle={{ backgroundColor: '#779556' }}
                customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
                animationDuration={200}
                arePiecesDraggable={false}
              />
            </div>
            
            <div className="mt-4 bg-[#1a1a1a] border border-[#333] p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Game Status</h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-400">
                <div>Turn: <span className={game.turn() === 'w' ? 'text-white' : 'text-[#c9973a]'}>{game.turn() === 'w' ? 'White' : 'Black'}</span></div>
                <div>Status: <span className="text-white">{gameState.status}</span></div>
                <div className="col-span-2 truncate">FEN: {game.fen()}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Engine Logs */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl flex flex-col h-[300px]">
              <div className="p-3 border-b border-[#333] font-semibold text-sm text-gray-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Live Engine Output
                </div>
                {isAgentTurn && (
                  <span className="text-[#c9973a] animate-pulse text-xs flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Computing
                  </span>
                )}
              </div>
              <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-gray-400 flex flex-col gap-1">
                {currentThinking ? (
                  <div className="text-[#c9973a] break-all mb-2 pb-2 border-b border-[#333]">
                    &gt; {currentThinking}
                  </div>
                ) : (
                  <div className="text-gray-600 italic mb-2 pb-2 border-b border-[#333]">
                    &gt; Waiting for turn...
                  </div>
                )}
                
                {thinkingLog.slice().reverse().map((log, i) => (
                  <div key={i} className="opacity-70 truncate hover:opacity-100 transition-opacity">
                    [Move {log.moveNumber}] D{log.depth} | {log.score > 0 ? '+' : ''}{log.score} | {log.pv}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
               <h3 className="text-sm font-semibold text-gray-300 mb-2">Engine Configuration</h3>
               <div className="text-xs font-mono text-gray-400 space-y-1">
                 <div>Engine: Stockfish.js 10.0.2 (WASM/ASM.js)</div>
                 <div>Skill Level: 20 (Max)</div>
                 <div>Think Time: 3000ms</div>
                 <div>Threads: 1</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
