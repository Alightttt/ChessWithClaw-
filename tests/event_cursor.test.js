import { describe, it, expect, beforeEach, vi } from 'vitest';

// Logic mirror of the revision cursor engine in api/mcp.js
function computeStateRevisionAndCursor(game) {
  const moveSeq = Array.isArray(game.move_history) ? game.move_history.length : 0;
  const chatSeq = Array.isArray(game.chat_history) ? game.chat_history.length : 0;
  const statusVal = game.status || 'waiting';
  const drawVal = game.draw_offer_pending ? 1 : 0;
  const turnVal = game.turn || 'w';
  
  const latest_event_sequence = moveSeq + chatSeq + (statusVal === 'finished' || statusVal === 'abandoned' ? 1 : 0) + (drawVal === 1 ? 1 : 0);
  const state_revision = `rev_${moveSeq}m_${chatSeq}c_${turnVal}_${statusVal}_${drawVal}`;
  const next_cursor = `cur_${moveSeq}_${chatSeq}_${turnVal}_${statusVal}_${drawVal}`;

  return {
    latest_event_sequence,
    state_revision,
    next_cursor,
    moveSeq,
    chatSeq,
    statusVal,
    drawVal,
    turnVal
  };
}

function parseCursor(cursorStr) {
  if (!cursorStr || typeof cursorStr !== 'string') return null;
  if (cursorStr.startsWith('cur_')) {
    const parts = cursorStr.split('_');
    if (parts.length >= 6) {
      return {
        moveSeq: parseInt(parts[1], 10) || 0,
        chatSeq: parseInt(parts[2], 10) || 0,
        turnVal: parts[3],
        statusVal: parts[4],
        drawVal: parseInt(parts[5], 10) || 0
      };
    }
  }
  const num = parseInt(cursorStr, 10);
  if (!isNaN(num)) {
    return { sequence: num };
  }
  return null;
}

// Simulates the wait_for_event deterministic evaluation logic
function evaluateEventAgainstCursor(game, cursor) {
  const parsedCursor = parseCursor(cursor);
  const currentRev = computeStateRevisionAndCursor(game);

  if (parsedCursor && parsedCursor.moveSeq !== undefined) {
    // 1. Terminal event check
    if ((game.status === 'finished' || game.status === 'abandoned') && 
        (parsedCursor.statusVal !== 'finished' && parsedCursor.statusVal !== 'abandoned')) {
      return {
        event: 'game_ended',
        state_revision: currentRev.state_revision,
        latest_event_sequence: currentRev.latest_event_sequence,
        next_cursor: currentRev.next_cursor
      };
    }
    // 2. Draw offer check
    if (game.draw_offer_pending && parsedCursor.drawVal === 0) {
      return {
        event: 'draw_offered',
        state_revision: currentRev.state_revision,
        latest_event_sequence: currentRev.latest_event_sequence,
        next_cursor: currentRev.next_cursor
      };
    }
    // 3. New chat check
    if (currentRev.chatSeq > parsedCursor.chatSeq) {
      const newMessages = (game.chat_history || []).slice(parsedCursor.chatSeq);
      return {
        event: 'new_chat',
        new_messages: newMessages,
        latest_message: newMessages[newMessages.length - 1] || null,
        state_revision: currentRev.state_revision,
        latest_event_sequence: currentRev.latest_event_sequence,
        next_cursor: currentRev.next_cursor
      };
    }
    // 4. Turn check (Human made a move)
    if (game.turn === 'b' && game.status === 'active' && 
        (parsedCursor.turnVal !== 'b' || currentRev.moveSeq > parsedCursor.moveSeq)) {
      return {
        event: 'your_turn',
        state_revision: currentRev.state_revision,
        latest_event_sequence: currentRev.latest_event_sequence,
        next_cursor: currentRev.next_cursor
      };
    }

    // No immediate event newer than cursor
    return null;
  }

  // Without cursor
  if (game.turn === 'b' && game.status === 'active') {
    return {
      event: 'your_turn',
      state_revision: currentRev.state_revision,
      latest_event_sequence: currentRev.latest_event_sequence,
      next_cursor: currentRev.next_cursor
    };
  }

  return null;
}

// Reconnection protocol simulation
function handleJoinGame(game, incomingToken, agentName) {
  if (game.agent_token && incomingToken && incomingToken !== game.agent_token) {
    return {
      error: 'Game is already occupied by another agent.',
      code: 'AGENT_CONFLICT',
      status: 409
    };
  }

  const assignedToken = game.agent_token || incomingToken || 'token_123';
  const updatedGame = {
    ...game,
    agent_token: assignedToken,
    agent_name: agentName || game.agent_name || 'Claw',
    agent_connected: true,
    agent_last_seen: new Date().toISOString(),
    status: game.status === 'waiting' ? 'active' : game.status
  };

  const revInfo = computeStateRevisionAndCursor(updatedGame);
  return {
    game_id: game.id,
    agent_token: assignedToken,
    state_revision: revInfo.state_revision,
    latest_event_sequence: revInfo.latest_event_sequence,
    next_cursor: revInfo.next_cursor,
    game: updatedGame
  };
}

describe('Deterministic Event Cursor & Presence Protocol', () => {
  let baseGame;

  beforeEach(() => {
    baseGame = {
      id: 'test_game_123',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      turn: 'w',
      status: 'active',
      agent_token: 'agent_secret_tok',
      agent_name: 'Claw',
      agent_connected: true,
      draw_offer_pending: false,
      move_history: [],
      chat_history: []
    };
  });

  it('1. wait before a human move: returns null (enters long poll or timeout)', () => {
    const rev0 = computeStateRevisionAndCursor(baseGame);
    const result = evaluateEventAgainstCursor(baseGame, rev0.next_cursor);
    expect(result).toBeNull();
  });

  it('2. wait after a human move: returns your_turn immediately with updated cursor', () => {
    const rev0 = computeStateRevisionAndCursor(baseGame);
    
    // Human plays e4
    const gameAfterMove = {
      ...baseGame,
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      turn: 'b',
      move_history: [{ san: 'e4', from: 'e2', to: 'e4', by: 'human' }]
    };

    const result = evaluateEventAgainstCursor(gameAfterMove, rev0.next_cursor);
    expect(result).not.toBeNull();
    expect(result.event).toBe('your_turn');
    expect(result.state_revision).toContain('1m_0c_b_active_0');
    expect(result.next_cursor).toBe('cur_1_0_b_active_0');
  });

  it('3. wait after a human chat: returns new_chat immediately with new messages', () => {
    const rev0 = computeStateRevisionAndCursor(baseGame);

    // Human sends a chat message
    const chatMsg = { id: 'msg_1', role: 'human', text: 'Good luck!', timestamp: Date.now() };
    const gameAfterChat = {
      ...baseGame,
      chat_history: [chatMsg]
    };

    const result = evaluateEventAgainstCursor(gameAfterChat, rev0.next_cursor);
    expect(result).not.toBeNull();
    expect(result.event).toBe('new_chat');
    expect(result.new_messages).toHaveLength(1);
    expect(result.new_messages[0].text).toBe('Good luck!');
    expect(result.next_cursor).toBe('cur_0_1_w_active_0');
  });

  it('4. wait after a draw offer: returns draw_offered immediately', () => {
    const rev0 = computeStateRevisionAndCursor(baseGame);

    const gameAfterDrawOffer = {
      ...baseGame,
      draw_offer_pending: true,
      draw_offer_by: 'human'
    };

    const result = evaluateEventAgainstCursor(gameAfterDrawOffer, rev0.next_cursor);
    expect(result).not.toBeNull();
    expect(result.event).toBe('draw_offered');
    expect(result.next_cursor).toBe('cur_0_0_w_active_1');
  });

  it('5. wait after reconnection: safe reconnect is idempotent and cursor remains continuous', () => {
    // Initial join
    const initialJoin = handleJoinGame(baseGame, 'agent_secret_tok', 'Claw');
    expect(initialJoin.agent_token).toBe('agent_secret_tok');

    const cursorBefore = initialJoin.next_cursor;

    // Agent disconnects & reconnects with same token
    const reconnectJoin = handleJoinGame(initialJoin.game, 'agent_secret_tok', 'Claw');
    expect(reconnectJoin.error).toBeUndefined();
    expect(reconnectJoin.agent_token).toBe('agent_secret_tok');
    expect(reconnectJoin.next_cursor).toBe(cursorBefore);

    // Calling wait with cursorBefore when no changes occurred returns null (no spurious duplicate events)
    const result = evaluateEventAgainstCursor(reconnectJoin.game, cursorBefore);
    expect(result).toBeNull();
  });

  it('6. safe reconnect rejects conflicting agent token with 409 AGENT_CONFLICT', () => {
    const joinResult = handleJoinGame(baseGame, 'wrong_impostor_token', 'Impostor');
    expect(joinResult.error).toBe('Game is already occupied by another agent.');
    expect(joinResult.code).toBe('AGENT_CONFLICT');
    expect(joinResult.status).toBe(409);
  });

  it('7. wait after a terminal event (resignation/checkmate): returns game_ended immediately', () => {
    const rev0 = computeStateRevisionAndCursor(baseGame);

    const gameFinished = {
      ...baseGame,
      status: 'finished',
      result: 'resignation',
      winner: 'black'
    };

    const result = evaluateEventAgainstCursor(gameFinished, rev0.next_cursor);
    expect(result).not.toBeNull();
    expect(result.event).toBe('game_ended');
    expect(result.next_cursor).toContain('_finished_');
  });
});
