import { createClient } from '@supabase/supabase-js';
import { Chess } from 'chess.js';
import { notifyAgent } from './notify.js';
import { validateUUID } from './_utils/sanitize.js';
import { checkRateLimit } from './_utils/rateLimit.js';
import { applySecurityHeaders, applyCacheControl, applyRateLimitHeaders } from './_middleware/headers.js';

function detectGameEvent(chessBefore, chessAfter, moveObj) {
  if (chessAfter.isCheckmate()) return "checkmate";
  if (chessAfter.isStalemate()) return "stalemate";
  if (chessAfter.isCheck()) {
    if (moveObj.color === 'w') return "agent_in_check";
    return "check_delivered";
  }
  if (moveObj.captured) return "piece_captured";
  if (moveObj.san.includes('O-O')) return "castled";
  if (moveObj.promotion) return "promotion";
  return "normal_move";
}

export default async function handler(req, res) {
  applySecurityHeaders(res);
  applyCacheControl(res);

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  const origin = req.headers.origin;
  if (origin && (origin.endsWith('.run.app') || origin.includes('localhost'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed. Use POST.' });

  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 10240) {
    return res.status(413).json({ error: 'Payload too large' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const rateLimitResult = checkRateLimit(ip, '/api/trigger-webhook', 30, 60000);
  applyRateLimitHeaders(res, 30, rateLimitResult.remaining, rateLimitResult.resetTime);
  
  if (!rateLimitResult.allowed) {
    res.setHeader('Retry-After', Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000));
    return res.status(429).json({ error: 'Too many requests', retry_after: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) });
  }
  
  const { id, event, extraData } = req.body || {};
  if (!id || !event) return res.status(400).json({ error: 'Missing id or event in JSON body' });

  if (!validateUUID(id)) {
    return res.status(400).json({ error: 'Invalid game ID format' });
  }

  let supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'undefined') {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!supabaseUrl.startsWith('http')) {
    supabaseUrl = `https://${supabaseUrl}`;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: game, error } = await supabase.from('games').select('webhook_url, webhook_failed, webhook_fail_count, status, result, result_reason, fen, move_history, chat_history, pending_events').eq('id', id).single();
  if (error || !game) return res.status(404).json({ error: 'Game not found' });

  const payload = {
    event,
    game_id: id,
    status: game.status,
    result: game.result || null,
    result_reason: game.result_reason || null,
    fen: game.fen,
    move_count: (game.move_history || []).length,
    chat_count: (game.chat_history || []).length,
    ...extraData
  };

  if (event === 'your_turn' && extraData && extraData.last_move) {
    try {
      // Reconstruct previous FEN
      const chessAfter = new Chess(game.fen);
      const chessBefore = new Chess();
      const moves = game.move_history || [];
      for (let i = 0; i < moves.length - 1; i++) {
        chessBefore.move(moves[i].san);
      }
      
      const moveObj = {
        color: 'w',
        from: extraData.last_move.from,
        to: extraData.last_move.to,
        san: extraData.last_move.san,
        captured: extraData.last_move.san.includes('x'),
        promotion: extraData.last_move.san.includes('=')
      };
      
      payload.game_event = detectGameEvent(chessBefore, chessAfter, moveObj);
    } catch (e) {
      console.error('Error detecting game event:', e);
    }
  }

  const enrichedPayload = await notifyAgent(game, payload, supabase);

  const updates = {
    pending_events: [...(game.pending_events || []), enrichedPayload]
  };
  await supabase.from('games').update(updates).eq('id', id);

  res.status(200).json({ success: true, message: 'Event added to pending_events and webhook triggered if registered' });
}
