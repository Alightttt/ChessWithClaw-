'use client';

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Chess } from 'chess.js';
import { Toaster, toast } from 'sonner';
import MoveHistory from './components/chess/MoveHistory';
import { getBestMove } from './lib/minimax';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load the board to prevent any SSR/initial render hydration issues
const DynamicChessBoard = lazy(() => import('./components/chess/ChessBoard'));

const TAUNTS = [
    "Is that the best you can do?",
    "I saw that coming 10 moves ago.",
    "You're playing like a human.",
    "My evaluation is heavily in my favor.",
    "Are you sure about that move?",
    "Fascinating...ly bad.",
    "I'm calculating your defeat.",
];

function Game() {
    const [chess, setChess] = useState(new Chess());
    const [fen, setFen] = useState(chess.fen());
    const [moveHistory, setMoveHistory] = useState([]);
    const [thinkingLog, setThinkingLog] = useState([]);
    const [isAgentThinking, setIsAgentThinking] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem('chess_save');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const newChess = new Chess(parsed.fen);
                setChess(newChess);
                setFen(parsed.fen);
                setMoveHistory(parsed.moveHistory || []);
                setThinkingLog(parsed.thinkingLog || []);
            } catch (e) {
                console.error("Failed to load save", e);
            }
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem('chess_save', JSON.stringify({
                fen,
                moveHistory,
                thinkingLog
            }));
        }
    }, [fen, moveHistory, thinkingLog, isClient]);

    const handleMove = useCallback((move) => {
        try {
            const result = chess.move(move);
            if (result) {
                setFen(chess.fen());
                setMoveHistory(prev => [...prev, result.san]);
                
                if (chess.isGameOver()) {
                    toast.success("Game Over!");
                    return;
                }

                if (chess.turn() === 'b') {
                    setIsAgentThinking(true);
                    const taunt = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
                    setThinkingLog(prev => [...prev, `[OpenClaw]: ${taunt}\nCalculating optimal response...`]);
                    
                    // Web Worker simulation (setTimeout) to avoid blocking UI
                    setTimeout(() => {
                        const bestMove = getBestMove(chess.fen(), 3, false);
                        if (bestMove) {
                            chess.move(bestMove);
                            setFen(chess.fen());
                            setMoveHistory(prev => [...prev, bestMove.san]);
                            setThinkingLog(prev => {
                                const newLog = [...prev];
                                newLog[newLog.length - 1] += `\nFound move: ${bestMove.san}`;
                                return newLog;
                            });
                        }
                        setIsAgentThinking(false);
                        if (chess.isGameOver()) {
                            toast.success("Game Over!");
                        }
                    }, 500);
                }
            }
        } catch (e) {
            toast.error("Invalid move");
        }
    }, [chess]);

    const resetGame = () => {
        const newChess = new Chess();
        setChess(newChess);
        setFen(newChess.fen());
        setMoveHistory([]);
        setThinkingLog([]);
        setIsAgentThinking(false);
        localStorage.removeItem('chess_save');
    };

    if (!isClient) return null; // Prevent hydration mismatch

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Board */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-[#c9973a] font-serif">Chess vs OpenClaw</h1>
                            <p className="text-zinc-400">100% Client-Side Minimax Engine</p>
                        </div>
                        <button onClick={resetGame} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-medium transition-colors">
                            New Game
                        </button>
                    </div>
                    
                    <div className="bg-zinc-900 p-4 md:p-8 rounded-xl border border-zinc-800 shadow-2xl flex justify-center">
                        <div className="w-full max-w-[600px]">
                            <Suspense fallback={<div className="aspect-square w-full bg-zinc-800 animate-pulse rounded flex items-center justify-center text-zinc-500">Loading Board...</div>}>
                                <DynamicChessBoard 
                                    fen={fen} 
                                    onMove={handleMove} 
                                    isMyTurn={chess.turn() === 'w' && !isAgentThinking && !chess.isGameOver()} 
                                    lastMove={moveHistory[moveHistory.length - 1]} 
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>

                {/* Right Column - Info */}
                <div className="space-y-6">
                    {/* Status Panel */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 text-zinc-100">Game Status</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Turn</span>
                                <span className="font-mono text-[#c9973a]">
                                    {chess.isGameOver() ? 'Game Over' : (chess.turn() === 'w' ? 'White (You)' : 'Black (OpenClaw)')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Status</span>
                                <span className="font-mono">
                                    {chess.isCheckmate() ? 'Checkmate' : 
                                     chess.isDraw() ? 'Draw' : 
                                     chess.isCheck() ? 'Check' : 'Active'}
                                </span>
                            </div>
                            {isAgentThinking && (
                                <div className="mt-4 p-3 bg-zinc-800/50 border border-zinc-700 rounded animate-pulse text-center text-[#c9973a] font-mono text-sm">
                                    OpenClaw is thinking...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Thinking Log */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col h-[300px]">
                        <h2 className="text-xl font-bold mb-4 text-zinc-100">OpenClaw's Mind</h2>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 font-mono text-xs">
                            {thinkingLog.length === 0 ? (
                                <p className="text-zinc-500 italic">Waiting for game to start...</p>
                            ) : (
                                thinkingLog.map((log, i) => (
                                    <div key={i} className="bg-zinc-950 p-3 rounded border border-zinc-800 text-zinc-300 whitespace-pre-wrap">
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Move History */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col h-[300px]">
                        <h2 className="text-xl font-bold mb-4 text-zinc-100">Move History</h2>
                        <div className="flex-1 overflow-y-auto">
                            <MoveHistory moveHistory={moveHistory} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <Toaster position="top-center" theme="dark" />
            <Game />
        </ErrorBoundary>
    );
}
