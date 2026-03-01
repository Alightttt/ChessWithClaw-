'use client';

import { Chess } from 'chess.js';

const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

function evaluateBoard(chess) {
    let totalEvaluation = 0;
    const board = chess.board();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            totalEvaluation += getPieceValue(board[i][j]);
        }
    }
    return totalEvaluation;
}

function getPieceValue(piece) {
    if (piece === null) return 0;
    const val = pieceValues[piece.type] || 0;
    return piece.color === 'w' ? val : -val;
}

export function getBestMove(gameFen, depth = 3, isWhite = false) {
    const chess = new Chess(gameFen);
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    let bestMove = null;
    let bestValue = isWhite ? -99999 : 99999;

    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        chess.move(move);
        const boardValue = minimax(chess, depth - 1, -100000, 100000, !isWhite);
        chess.undo();
        
        if (isWhite) {
            if (boardValue > bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        } else {
            if (boardValue < bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        }
    }
    
    // Fallback to random move if all evaluations are equal
    return bestMove || moves[Math.floor(Math.random() * moves.length)];
}

function minimax(chess, depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0 || chess.isGameOver()) {
        return evaluateBoard(chess);
    }

    const moves = chess.moves();

    if (isMaximizingPlayer) {
        let bestVal = -99999;
        for (let i = 0; i < moves.length; i++) {
            chess.move(moves[i]);
            bestVal = Math.max(bestVal, minimax(chess, depth - 1, alpha, beta, !isMaximizingPlayer));
            chess.undo();
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    } else {
        let bestVal = 99999;
        for (let i = 0; i < moves.length; i++) {
            chess.move(moves[i]);
            bestVal = Math.min(bestVal, minimax(chess, depth - 1, alpha, beta, !isMaximizingPlayer));
            chess.undo();
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    }
}
