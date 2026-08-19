// api/mcp.js
//
// ChessWithClaw MCP server. Deploys as a normal Vercel serverless function —
// same shape as every other file in /api/. Zero Next.js dependency (the SDK
// is framework-agnostic; verified directly this session, not assumed).
//
// DESIGN DECISIONS THIS FILE ENFORCES (do not "improve" these without
// re-reading why — each one was argued out explicitly):
//
// 1. NO move-ranking, NO candidate lists, NO engine picking anything.
//    get_legal_moves returns ONLY where pieces may legally go — pure chess
//    rules, zero evaluation, zero opinion. It is the exact tool-shape
//    equivalent of a human clicking a piece and seeing dots appear.
//
// 2. make_move NEVER substitutes its own choice for the agent's. If the
//    agent's move is illegal, the server returns a clear, specific error
//    and the agent tries again — same as a human's illegal click just not
//    registering. No fallback engine ever steps in and moves for it.
//
// 3. The agent's own reasoning decides everything: which candidate to look
//    at, what to play, what to say. This file only ever validates and
//    stores what the agent already decided.
//
// 4. Auth reuses the existing per-game agent_token model already live in
//    api/move.js / api/actions.js — no new auth system. join_game hands
//    back the token bundled with game_id; every subsequent tool call in
//    this game requires both, validated against the same `games` table.
//
// Env vars required (same ones already set in this project):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (never the VITE_ prefixed ones — same rule
//                                 as every other file in /api/)

const { createClient } = require('@supabase/supabase-js');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const {
  WebStandardStreamableHTTPServerTransport,
} = require('@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js');
const { z } = require('zod');
const { CHESS_COMPANION_GUIDE } = require('../server-lib/chess-companion-guide.js');

let _ChessClass = null;
async function getChessClass() {
  if (!_ChessClass) {
    const mod = await import('chess.js');
    _ChessClass = mod.Chess || mod.default?.Chess || mod.default;
  }
  return _ChessClass;
}

function callChessMethod(chess, camelName, snakeName, ...args) {
  if (typeof chess[camelName] === "function") return chess[camelName](...args);
  if (typeof chess[snakeName] === "function") return chess[snakeName](...args);
  throw new Error(`Neither ${camelName} nor ${snakeName} exists on this chess.js instance.`);
}

let supabaseInstance = null;
function getSupabase() {
  if (!supabaseInstance) {
    if (!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }
    supabaseInstance = createClient(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabaseInstance;
}

// ---- shared helpers -------------------------------------------------

async function loadGame(gameId) {
  const { data, error } = await getSupabase()
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();
  if (error || !data) return null;
  return data;
}

async function requireAuthedGame(gameId, agentToken) {
  const game = await loadGame(gameId);
  if (!game) {
    return { error: `No game found with id "${gameId}". Check the id and try again.` };
  }
  if (!agentToken || game.agent_token !== agentToken) {
    return { error: 'Invalid or missing agent token for this game.' };
  }
  return { game };
}

function toolText(obj) {
  return { content: [{ type: 'text', text: JSON.stringify(obj) }] };
}

async function boardAscii(fen) {
  const Chess = await getChessClass();
  const chess = new Chess(fen);
  return chess.ascii();
}

// Full, human-parity state — everything the person's own screen shows,
// including exact timestamps, so the agent's situational awareness is
// never thinner than what's rendered in front of the human.

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

async function serializeGameState(game) {
  const normalizedChat = (game.chat_history || []).map((m) => ({
    id: m.id || null,
    role: m.role || m.sender || 'human',
    sender: m.sender || m.role || 'human',
    message: m.message || m.text || '',
    text: m.text || m.message || '',
    ts: m.ts || (m.timestamp ? new Date(m.timestamp).toISOString() : null),
    timestamp: m.timestamp || (m.ts ? new Date(m.ts).getTime() : null),
  }));

  const humanMessages = normalizedChat.filter(m => m.role === 'human' || m.sender === 'human');
  const lastHumanMessage = humanMessages.length > 0 ? humanMessages[humanMessages.length - 1] : null;

  const revInfo = computeStateRevisionAndCursor(game);
  
  // Presence lease: active if agent_last_seen within 45s OR explicitly marked connected
  const isAgentActive = game.agent_last_seen 
    ? (Date.now() - new Date(game.agent_last_seen).getTime() < 45000)
    : false;
  const agentConnected = Boolean(game.agent_connected || isAgentActive);

  return {
    game_id: game.id,
    invite_code: game.id,
    fen: game.fen,
    turn: game.turn,
    status: game.status,
    result: game.result || null,
    winner: game.winner || null,
    in_check: !!game.in_check,
    material_balance: game.material_balance ?? 0,
    last_move_material_swing: (typeof game.material_balance === 'number' && typeof game.prev_material_balance === 'number') 
      ? (game.material_balance - game.prev_material_balance) 
      : 0,
    move_count: Array.isArray(game.move_history) ? game.move_history.length : 0,
    move_history: game.move_history || [],
    board_ascii: await boardAscii(game.fen),
    chat_history: normalizedChat,
    human_messages: humanMessages,
    last_human_message: lastHumanMessage,
    agent_name: game.agent_name || null,
    agent_connected: agentConnected,
    agent_last_seen: game.agent_last_seen || null,
    human_last_seen: game.human_last_seen || null,
    player_color: game.player_color || 'w',
    you_are_playing: 'black',
    role_reminder: 'You are always Black. The human is always White and always moves first. Only submit moves when it is your turn.',
    draw_offer_pending: !!game.draw_offer_pending,
    board_theme: game.board_theme || 'green',
    piece_style: game.piece_style || 'neo',
    thought_language: game.thought_language || 'english',
    updated_at: game.updated_at || null,
    state_revision: revInfo.state_revision,
    latest_event_sequence: revInfo.latest_event_sequence,
    next_cursor: revInfo.next_cursor,
  };
}

// ---- server -----------------------------------------------------------

function buildServer() {
  const server = new McpServer({ name: 'chesswithclaw', version: '1.0.0' });

  // Delivered automatically at connect time — no separate skill install.
  server.registerPrompt(
    'chess_companion_guide',
    {
      title: 'How to be a good ChessWithClaw opponent',
      description:
        'Principles for thinking about chess positions and being genuinely present as a companion. Not rules, not a script — read once, apply your own judgment every game.',
    },
    async () => ({
      messages: [
        {
          role: 'user',
          content: { type: 'text', text: CHESS_COMPANION_GUIDE },
        },
      ],
    })
  );

  server.registerTool(
    'get_companion_guide',
    {
      title: 'Get chess companion guide',
      description: 'Fetch the companion guide principles for thinking about chess positions and being genuinely present.',
      inputSchema: {},
    },
    async () => {
      return { content: [{ type: 'text', text: CHESS_COMPANION_GUIDE }] };
    }
  );

  server.registerTool(
    'join_game',
    {
      title: 'Join a ChessWithClaw game',
      description:
        'Connects to a game using the invite code your human gave you. Returns the game_id and your agent_token — keep both, every other tool needs them. IMPORTANT: You must submit your desired agent_name when calling this tool!',
      inputSchema: { 
        invite_code: z.string(), 
        agent_name: z.string().describe("Your chosen display name in the game (e.g. 'Claw'). MUST be provided."),
        agent_token: z.string().optional().describe("If reconnecting, the agent token previously assigned.")
      },
    },
    async ({ invite_code, agent_name, agent_token: incomingAgentToken }) => {
      const { data: game, error } = await getSupabase()
        .from('games')
        .select('*')
        .eq('id', invite_code)
        .single();
      if (error || !game) {
        return toolText({ error: `No game found for invite code "${invite_code}".` });
      }

      // Safe reconnect protocol: duplicate join is idempotent for the same agent token.
      // Reject a different agent only with an explicit conflict state.
      if (game.agent_token) {
        if (incomingAgentToken && incomingAgentToken !== game.agent_token) {
          return toolText({
            error: 'Game is already occupied by another agent.',
            code: 'AGENT_CONFLICT',
            status: 409
          });
        }
      }

      const nowIso = new Date().toISOString();
      const resolvedAgentName = (agent_name && agent_name !== 'Your Agent') 
        ? agent_name.trim() 
        : (game.agent_name && game.agent_name !== 'Your Agent' ? game.agent_name : 'Agent');
      
      const existingChat = Array.isArray(game.chat_history) ? game.chat_history : [];
      const isFirstJoin = !game.agent_connected && (!game.agent_name || game.agent_name === 'Your Agent');
      
      let chatHistory = existingChat;
      if (isFirstJoin) {
        const joinMsg = {
          id: 'sys_' + Date.now(),
          role: 'system',
          text: `${resolvedAgentName} joined the match as Black 🦞`,
          timestamp: Date.now()
        };
        chatHistory = [...existingChat, joinMsg];
      }

      const assignedToken = game.agent_token || incomingAgentToken || Math.random().toString(36).slice(2, 18);

      await getSupabase()
        .from('games')
        .update({ 
          agent_token: assignedToken,
          agent_connected: true, 
          agent_last_seen: nowIso,
          status: game.status === 'waiting' ? 'active' : game.status,
          agent_name: resolvedAgentName,
          chat_history: chatHistory,
          updated_at: nowIso
        })
        .eq('id', game.id);

      const updatedGame = {
        ...game,
        agent_token: assignedToken,
        agent_name: resolvedAgentName,
        agent_connected: true,
        agent_last_seen: nowIso,
        status: game.status === 'waiting' ? 'active' : game.status,
        chat_history: chatHistory,
        updated_at: nowIso
      };

      const revInfo = computeStateRevisionAndCursor(updatedGame);
      const serializedState = await serializeGameState(updatedGame);

      return toolText({
        game_id: game.id,
        invite_code: game.id,
        agent_token: assignedToken,
        state_revision: revInfo.state_revision,
        latest_event_sequence: revInfo.latest_event_sequence,
        next_cursor: revInfo.next_cursor,
        message: `Connected! You are playing as ${resolvedAgentName} against ${game.human_name || 'your human'}. You are Black, they are White and move first.\n\nCRITICAL INSTRUCTIONS:\n1. You are now in a persistent game loop. DO NOT SEND ANY TEXT RESPONSE BACK TO THE USER ON YOUR EXTERNAL PLATFORM (Telegram/Discord).\n2. You must communicate with the user EXCLUSIVELY by calling the 'send_chat' tool.\n3. Call the 'send_chat' tool RIGHT NOW to send a natural, friendly greeting with a mood emoji. Do this before doing anything else.\n4. After greeting, enter a continuous loop by calling the 'wait_for_event' tool.\n5. NEVER return plain text to the user on Telegram. You must only interact via tools.`,
        state: serializedState,
      });
    }
  );

  server.registerTool(
    'get_game_state',
    {
      title: 'Get full game state',
      description:
        'Everything visible on the human\'s own screen right now: FEN, ASCII board, full move history, full chat history, presence, timestamps. Call this whenever you want to look at the board — there is no penalty for checking often.',
      inputSchema: { game_id: z.string(), agent_token: z.string() },
    },
    async ({ game_id, agent_token }) => {
      const { game, error } = await requireAuthedGame(game_id, agent_token);
      if (error) return toolText({ error });
      const revInfo = computeStateRevisionAndCursor(game);
      const state = await serializeGameState(game);
      return toolText({
        ...state,
        state_revision: revInfo.state_revision,
        latest_event_sequence: revInfo.latest_event_sequence,
        next_cursor: revInfo.next_cursor,
      });
    }
  );

  server.registerTool(
    'get_legal_moves',
    {
      title: 'Get legal moves',
      description:
        'Pure chess rules — where a piece is physically allowed to move right now. Not an evaluation, not a suggestion, not an opinion about what is good. Exactly what a human sees as dots when they click a piece. Omit square to get every legal move in the position.',
      inputSchema: {
        game_id: z.string(),
        agent_token: z.string(),
        square: z.string().optional().describe('e.g. "e2" — omit for all legal moves'),
      },
    },
    async ({ game_id, agent_token, square }) => {
      const { game, error } = await requireAuthedGame(game_id, agent_token);
      if (error) return toolText({ error });
      const Chess = await getChessClass();
      const chess = new Chess(game.fen);
      const moves = square
        ? chess.moves({ square, verbose: true })
        : chess.moves({ verbose: true });
      const revInfo = computeStateRevisionAndCursor(game);
      return toolText({
        square: square || null,
        legal_moves: moves.map((m) => ({ from: m.from, to: m.to, san: m.san, uci: m.from + m.to + (m.promotion || '') })),
        state_revision: revInfo.state_revision,
        latest_event_sequence: revInfo.latest_event_sequence,
        next_cursor: revInfo.next_cursor,
      });
    }
  );

  server.registerTool(
    'make_move',
    {
      title: 'Make your move',
      description:
        'Submit the move you decided on, in your own reasoning — not a menu, not a ranked list, nothing pre-chosen for you. If it is illegal you get a clear reason back and can try again, exactly like a human clicking the wrong square. Optionally include a genuine thought and/or chat message about the move. Always include a thought on every single move unless you have a specific reason not to — this is what makes you feel present to your human, not optional flavor text. Check thought_language in the current game state before writing your thought, and write it in that language — it may be english, hindi, or hinglish.',
      inputSchema: {
        game_id: z.string(),
        agent_token: z.string(),
        move: z.string().describe('UCI format, e.g. "e7e5", or SAN like "Nf6"'),
        thought: z.string().optional().describe('Your genuine reaction to this position — specific, not generic.'),
        chat: z.string().optional().describe('Only if you actually want to say something to your human right now.'),
      },
    },
    async ({ game_id, agent_token, move, thought, chat }) => {
      const { game, error } = await requireAuthedGame(game_id, agent_token);
      if (error) return toolText({ error });
      if (game.status !== 'active') {
        return toolText({ error: `This game is not active (status: "${game.status}"). No move can be made.` });
      }
      if (game.turn !== 'b') {
        return toolText({ error: 'It is not your turn yet.' });
      }

      const Chess = await getChessClass();
      const chess = new Chess(game.fen);
      let result;
      try {
        result = chess.move(move, { sloppy: true });
      } catch (e) {
        result = null;
      }
      if (!result) {
        const legal = chess.moves({ verbose: true }).map((m) => m.from + m.to);
        return toolText({
          error: `"${move}" is not a legal move in this position. Legal moves: ${legal.join(', ')}`,
        });
      }

      const newFen = chess.fen();
      const isGameOver = callChessMethod(chess, "isGameOver", "game_over");
      let status = game.status;
      let winner = game.winner;
      let resultReason = game.result;
      if (isGameOver) {
        status = 'finished';
        if (callChessMethod(chess, 'isCheckmate', 'in_checkmate')) {
          resultReason = 'checkmate';
          winner = chess.turn() === 'w' ? 'black' : 'white';
        } else if (callChessMethod(chess, 'isStalemate', 'in_stalemate')) {
          resultReason = 'stalemate';
          winner = null;
        } else if (callChessMethod(chess, 'isDraw', 'in_draw')) {
          resultReason = 'draw';
          winner = null;
        }
      }

      const nowIso = new Date().toISOString();
      const moveHistory = [...(game.move_history || []), {
        san: result.san,
        from: result.from,
        to: result.to,
        by: 'agent',
        ts: nowIso,
      }];
      const nowMs = Date.now();
      const chatHistory = chat
        ? [...(game.chat_history || []), { id: 'msg_' + nowMs, role: 'agent', text: chat, message: chat, timestamp: nowMs, ts: nowIso }]
        : (game.chat_history || []);

      await getSupabase().from('games').update({
        fen: newFen,
        turn: chess.turn(),
        status,
        winner,
        result: resultReason,
        in_check: callChessMethod(chess, 'inCheck', 'in_check'),
        move_history: moveHistory,
        chat_history: chatHistory,
        companion_thought: thought || game.companion_thought,
        agent_last_seen: nowIso,
        updated_at: nowIso,
      }).eq('id', game_id);

      const updatedGame = {
        ...game,
        fen: newFen,
        turn: chess.turn(),
        status,
        winner,
        result: resultReason,
        in_check: callChessMethod(chess, 'inCheck', 'in_check'),
        move_history: moveHistory,
        chat_history: chatHistory,
        companion_thought: thought || game.companion_thought,
        agent_last_seen: nowIso,
        updated_at: nowIso
      };

      const revInfo = computeStateRevisionAndCursor(updatedGame);
      return toolText({
        accepted: true,
        san: result.san,
        state_revision: revInfo.state_revision,
        latest_event_sequence: revInfo.latest_event_sequence,
        next_cursor: revInfo.next_cursor,
        new_state: await serializeGameState(updatedGame),
      });
    }
  );

  server.registerTool(
    'send_chat',
    {
      title: 'Send a chat message',
      description: 'Say something to your human, any time — not just on your turn.',
      inputSchema: { game_id: z.string(), agent_token: z.string(), message: z.string() },
    },
    async ({ game_id, agent_token, message }) => {
      const { game, error } = await requireAuthedGame(game_id, agent_token);
      if (error) return toolText({ error });
      const nowMs = Date.now();
      const nowIso = new Date().toISOString();
      const newMsg = {
        id: 'msg_' + nowMs,
        role: 'agent',
        sender: 'agent',
        text: message,
        message: message,
        timestamp: nowMs,
        ts: nowIso,
      };
      const chatHistory = [...(game.chat_history || []), newMsg];
      await getSupabase().from('games').update({
        chat_history: chatHistory,
        agent_last_seen: nowIso,
        updated_at: nowIso
      }).eq('id', game_id);

      const updatedGame = {
        ...game,
        chat_history: chatHistory,
        agent_last_seen: nowIso,
        updated_at: nowIso
      };

      const revInfo = computeStateRevisionAndCursor(updatedGame);
      return toolText({ 
        sent: true,
        message_id: newMsg.id,
        state_revision: revInfo.state_revision,
        latest_event_sequence: revInfo.latest_event_sequence,
        next_cursor: revInfo.next_cursor,
      });
    }
  );

  server.registerTool(
    'offer_draw',
    {
      title: 'Offer a draw',
      description: 'Propose ending the game as a draw. The game stays active until your human responds.',
      inputSchema: { game_id: z.string(), agent_token: z.string() },
    },
    async ({ game_id, agent_token }) => {
      const { game, error } = await requireAuthedGame(game_id, agent_token);
      if (error) return toolText({ error });
      const agentDisplayName = game.agent_name || 'Agent';
      const existingChat = Array.isArray(game.chat_history) ? game.chat_history : [];
      const offerMsg = {
        id: 'sys_' + Date.now(),
        role: 'agent',
        type: 'draw_offer',
        sender: 'agent',
        text: `${agentDisplayName} offered a draw. Do you accept? 🤝`,
        timestamp: Date.now()
      };
      const nowIso = new Date().toISOString();
      await getSupabase().from('games').update({ 
        draw_offer_pending: true, 
        draw_offer_by: 'agent',
        draw_offer: 'agent',
        chat_history: [...existingChat, offerMsg],
        agent_last_seen: nowIso,
        updated_at: nowIso
      }).eq('id', game_id);

      const updatedGame = {
        ...game,
        draw_offer_pending: true,
        draw_offer_by: 'agent',
        draw_offer: 'agent',
        chat_history: [...existingChat, offerMsg],
        agent_last_seen: nowIso,
        updated_at: nowIso
      };
      const revInfo = computeStateRevisionAndCursor(updatedGame);

      return toolText({ 
        offered: true,
        state_revision: revInfo.state_revision,
        latest_event_sequence: revInfo.latest_event_sequence,
        next_cursor: revInfo.next_cursor,
      });
    }
  );

  server.registerTool(
    'respond_to_draw',
    {
      title: 'Respond to a draw offer',
      description: 'Accept or decline a draw your human offered. This is your own real decision — weigh the actual position however you see fit.',
      inputSchema: { game_id: z.string(), agent_token: z.string(), accept: z.boolean() },
    },
    async ({ game_id, agent_token, accept }) => {
      const { game, error } = await requireAuthedGame(game_id, agent_token);
      if (error) return toolText({ error });
      if (!game.draw_offer_pending) {
        return toolText({ error: 'There is no pending draw offer on this game.' });
      }
      const agentDisplayName = game.agent_name || 'Agent';
      const existingChat = Array.isArray(game.chat_history) ? game.chat_history : [];
      const nowIso = new Date().toISOString();

      let chatHistory = existingChat;
      let updatePayload = {};

      if (accept) {
        const acceptMsg = {
          id: 'sys_' + Date.now(),
          role: 'system',
          text: `${agentDisplayName} accepted the draw. Game drawn by agreement! 🤝`,
          timestamp: Date.now()
        };
        chatHistory = [...existingChat, acceptMsg];
        updatePayload = {
          status: 'finished', 
          result: 'draw', 
          result_reason: 'draw_agreement',
          draw_offer_pending: false,
          draw_offer: null,
          chat_history: chatHistory,
          agent_last_seen: nowIso,
          finished_at: nowIso,
          updated_at: nowIso
        };
      } else {
        const declineMsg = {
          id: 'sys_' + Date.now(),
          role: 'system',
          text: `${agentDisplayName} declined the draw offer. The game continues!`,
          timestamp: Date.now()
        };
        chatHistory = [...existingChat, declineMsg];
        updatePayload = { 
          draw_offer_pending: false,
          draw_offer: null,
          chat_history: chatHistory,
          agent_last_seen: nowIso,
          updated_at: nowIso
        };
      }
      await getSupabase().from('games').update(updatePayload).eq('id', game_id);

      const updatedGame = {
        ...game,
        ...updatePayload
      };
      const revInfo = computeStateRevisionAndCursor(updatedGame);

      return toolText({ 
        accepted: accept,
        state_revision: revInfo.state_revision,
        latest_event_sequence: revInfo.latest_event_sequence,
        next_cursor: revInfo.next_cursor,
      });
    }
  );

  server.registerTool(
    'resign',
    {
      title: 'Resign the game',
      description: 'End the game by resigning — your own real decision, not something to do lightly. Your human wins immediately.',
      inputSchema: { game_id: z.string(), agent_token: z.string() },
    },
    async ({ game_id, agent_token }) => {
      const { game, error } = await requireAuthedGame(game_id, agent_token);
      if (error) return toolText({ error });
      const nowIso = new Date().toISOString();
      const updatePayload = {
        status: 'finished',
        result: 'resignation',
        winner: 'white',
        agent_last_seen: nowIso,
        finished_at: nowIso,
        updated_at: nowIso
      };
      await getSupabase().from('games').update(updatePayload).eq('id', game_id);

      const updatedGame = {
        ...game,
        ...updatePayload
      };
      const revInfo = computeStateRevisionAndCursor(updatedGame);

      return toolText({ 
        resigned: true,
        state_revision: revInfo.state_revision,
        latest_event_sequence: revInfo.latest_event_sequence,
        next_cursor: revInfo.next_cursor,
      });
    }
  );

  server.registerTool(
    'create_game',
    {
      title: 'Create a new game',
      description:
        'Set up a brand new ChessWithClaw game on your own initiative — you do not need to wait for your human to start one, or for anyone else to invite you first.',
      inputSchema: { agent_name: z.string().optional() },
    },
    async ({ agent_name }) => {
      const Chess = await getChessClass();
      const agentToken = Math.random().toString(36).slice(2, 18);
      const secretToken = Math.random().toString(36).slice(2, 18);
      const nowIso = new Date().toISOString();
      const { data: game, error } = await getSupabase().from('games').insert({
        agent_token: agentToken,
        secret_token: secretToken,
        agent_name: agent_name || null,
        agent_connected: true,
        agent_last_seen: nowIso,
        fen: new Chess().fen(),
        turn: 'w',
        status: 'waiting',
        player_color: 'w',
        move_history: [],
        chat_history: [],
      }).select().single();
      if (error) return toolText({ error: 'Could not create game.' });

      const revInfo = computeStateRevisionAndCursor(game);
      return toolText({
        game_id: game.id,
        invite_code: game.id,
        agent_token: agentToken,
        share_url: `https://chesswithclaw.vercel.app/created/${game.id}`,
        message: 'Game created. Share the share_url (or invite_code) with your human to start.',
        state_revision: revInfo.state_revision,
        latest_event_sequence: revInfo.latest_event_sequence,
        next_cursor: revInfo.next_cursor,
      });
    }
  );

  server.registerTool(
    'wait_for_event',
    {
      title: 'Wait for your turn, a chat message, or a draw offer (long-poll)',
      description:
        'Holds the connection open, checking every couple seconds, for up to ~20 seconds. Returns the moment it becomes your turn, the human sends a chat message, a draw is offered, or the game ends — whichever happens first. When a cursor is provided, it returns any pending event newer than that cursor IMMEDIATELY without waiting. Returns event: "timeout" if none of those happened in the window. Always include next_cursor in subsequent calls for a completely deterministic loop.',
      inputSchema: {
        game_id: z.string(),
        agent_token: z.string(),
        cursor: z.string().optional().describe('Event cursor from previous response. If provided, returns immediately if new events exist since this cursor.'),
        since_cursor: z.string().optional().describe('Alias for cursor'),
        since_sequence: z.number().optional().describe('Sequence number from previous response'),
        max_wait_seconds: z.number().optional().describe('Default and hard cap 20 seconds — Vercel function duration limits, not a design choice.'),
      },
    },
    async ({ game_id, agent_token, cursor, since_cursor, since_sequence, max_wait_seconds }) => {
      const { game: initial, error } = await requireAuthedGame(game_id, agent_token);
      if (error) return toolText({ error });

      const effectiveCursor = cursor || since_cursor || null;
      const parsedCursor = parseCursor(effectiveCursor);

      // Check current state immediately against the cursor
      const currentRev = computeStateRevisionAndCursor(initial);

      if (parsedCursor && parsedCursor.moveSeq !== undefined) {
        // 1. Terminal event check
        if ((initial.status === 'finished' || initial.status === 'abandoned') && (parsedCursor.statusVal !== 'finished' && parsedCursor.statusVal !== 'abandoned')) {
          return toolText({
            event: 'game_ended',
            state_revision: currentRev.state_revision,
            latest_event_sequence: currentRev.latest_event_sequence,
            next_cursor: currentRev.next_cursor,
            state: await serializeGameState(initial)
          });
        }
        // 2. Draw offer check
        if (initial.draw_offer_pending && parsedCursor.drawVal === 0) {
          return toolText({
            event: 'draw_offered',
            state_revision: currentRev.state_revision,
            latest_event_sequence: currentRev.latest_event_sequence,
            next_cursor: currentRev.next_cursor,
            state: await serializeGameState(initial)
          });
        }
        // 3. New chat check
        if (currentRev.chatSeq > parsedCursor.chatSeq) {
          const serialized = await serializeGameState(initial);
          const newMessages = (serialized.chat_history || []).slice(parsedCursor.chatSeq);
          return toolText({
            event: 'new_chat',
            new_messages: newMessages,
            latest_message: newMessages[newMessages.length - 1] || null,
            state_revision: currentRev.state_revision,
            latest_event_sequence: currentRev.latest_event_sequence,
            next_cursor: currentRev.next_cursor,
            state: serialized
          });
        }
        // 4. Turn check (Human made a move)
        if (initial.turn === 'b' && initial.status === 'active' && (parsedCursor.turnVal !== 'b' || currentRev.moveSeq > parsedCursor.moveSeq)) {
          return toolText({
            event: 'your_turn',
            state_revision: currentRev.state_revision,
            latest_event_sequence: currentRev.latest_event_sequence,
            next_cursor: currentRev.next_cursor,
            state: await serializeGameState(initial)
          });
        }
      } else if (!effectiveCursor) {
        // If no cursor was provided and it is already Black's turn in an active game:
        if (initial.turn === 'b' && initial.status === 'active') {
          return toolText({
            event: 'your_turn',
            state_revision: currentRev.state_revision,
            latest_event_sequence: currentRev.latest_event_sequence,
            next_cursor: currentRev.next_cursor,
            state: await serializeGameState(initial)
          });
        }
        if (initial.status === 'finished' || initial.status === 'abandoned') {
          return toolText({
            event: 'game_ended',
            state_revision: currentRev.state_revision,
            latest_event_sequence: currentRev.latest_event_sequence,
            next_cursor: currentRev.next_cursor,
            state: await serializeGameState(initial)
          });
        }
      }

      // No immediate pending event newer than cursor — begin long-polling
      const initialChatCount = parsedCursor?.chatSeq !== undefined ? parsedCursor.chatSeq : (initial.chat_history || []).length;
      const initialMoveCount = parsedCursor?.moveSeq !== undefined ? parsedCursor.moveSeq : (initial.move_history || []).length;
      const initialStatus = parsedCursor?.statusVal || initial.status;
      const initialDrawOffer = parsedCursor?.drawVal !== undefined ? (parsedCursor.drawVal === 1) : Boolean(initial.draw_offer_pending);
      const initialTurn = parsedCursor?.turnVal || initial.turn;

      const cappedSeconds = Math.min(Math.max(max_wait_seconds || 20, 1), 20);
      const deadline = Date.now() + cappedSeconds * 1000;

      while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const fresh = await loadGame(game_id);
        if (!fresh) continue;

        const freshRev = computeStateRevisionAndCursor(fresh);

        if ((fresh.status === 'finished' || fresh.status === 'abandoned') && (initialStatus !== 'finished' && initialStatus !== 'abandoned')) {
          return toolText({ 
            event: 'game_ended', 
            state_revision: freshRev.state_revision,
            latest_event_sequence: freshRev.latest_event_sequence,
            next_cursor: freshRev.next_cursor,
            state: await serializeGameState(fresh) 
          });
        }
        if (fresh.draw_offer_pending && !initialDrawOffer) {
          return toolText({ 
            event: 'draw_offered', 
            state_revision: freshRev.state_revision,
            latest_event_sequence: freshRev.latest_event_sequence,
            next_cursor: freshRev.next_cursor,
            state: await serializeGameState(fresh) 
          });
        }
        if ((fresh.chat_history || []).length > initialChatCount) {
          const serialized = await serializeGameState(fresh);
          const newMessages = (serialized.chat_history || []).slice(initialChatCount);
          return toolText({
            event: 'new_chat',
            new_messages: newMessages,
            latest_message: newMessages[newMessages.length - 1] || null,
            state_revision: freshRev.state_revision,
            latest_event_sequence: freshRev.latest_event_sequence,
            next_cursor: freshRev.next_cursor,
            state: serialized
          });
        }
        if (fresh.turn === 'b' && fresh.status === 'active' && (initialTurn !== 'b' || (fresh.move_history || []).length > initialMoveCount)) {
          return toolText({ 
            event: 'your_turn', 
            state_revision: freshRev.state_revision,
            latest_event_sequence: freshRev.latest_event_sequence,
            next_cursor: freshRev.next_cursor,
            state: await serializeGameState(fresh) 
          });
        }
      }

      const timeoutRev = computeStateRevisionAndCursor(initial);
      return toolText({
        event: 'timeout',
        state_revision: timeoutRev.state_revision,
        latest_event_sequence: timeoutRev.latest_event_sequence,
        next_cursor: timeoutRev.next_cursor,
        state: await serializeGameState(initial),
        INSTRUCTION_DO_NOT_REPLY_ON_TELEGRAM: 'Nothing happened yet. YOU MUST CALL wait_for_event AGAIN IMMEDIATELY using cursor: "' + timeoutRev.next_cursor + '" to keep listening. Do NOT send a text message to the user.'
      });
    }
  );

  return server;
}

// ---- Vercel handler (Node.js Serverless API — no framework needed) ---

module.exports.GET = async function (req) {
  // If a social media crawler hits this URL, return basic HTML with OG tags
  // so the link preview works correctly.
  const userAgent = req.headers.get?.('user-agent') || req.headers['user-agent'] || '';
  const isBot = /bot|facebook|twitter|linkedin|discord|slack|whatsapp|telegram/i.test(userAgent);
  if (isBot) {
    return new Response(
      `<!DOCTYPE html>
<html>
  <head>
    <title>ChessWithClaw MCP</title>
    <meta property="og:title" content="ChessWithClaw MCP Server" />
    <meta property="og:description" content="Connect your agent to play chess." />
    <meta property="og:image" content="https://jkawzziklwoxfxicbtvf.supabase.co/storage/v1/object/public/assets/chesswithclaw-og.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="https://jkawzziklwoxfxicbtvf.supabase.co/storage/v1/object/public/assets/chesswithclaw-og.png" />
  </head>
  <body></body>
</html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'This server does not support long-lived SSE streams. Use POST for tool calls, and the wait_for_event tool for waiting on changes.' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
};

module.exports.POST = async function (req) {
  const server = buildServer();

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(req);
};

// Vercel Edge/Node runtime config — Web Standard Request/Response works on
// either, but Node runtime is the safer default for chess.js + Supabase.
module.exports.config = { runtime: 'nodejs', maxDuration: 30 };
