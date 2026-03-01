import { createClient } from '@supabase/supabase-js';
import { Chess } from 'chess.js';

export default async function handler(req, res) {
  // CORS headers to allow agents to fetch from anywhere
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing game ID' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing Supabase credentials' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: game, error } = await supabase.from('games').select('*').eq('id', id).single();

  if (error || !game) return res.status(404).json({ error: 'Game not found' });

  const chess = new Chess(game.fen);
  const legalMoves = chess.moves({ verbose: true }).map(m => m.from + m.to + (m.promotion || ''));

  res.status(200).json({
    instructions: "You are BLACK. If current_turn is BLACK, choose a move from legal_moves and POST to /api/move",
    game_id: id,
    status: game.status,
    current_turn: game.turn === 'w' ? 'WHITE' : 'BLACK',
    you_are: 'BLACK',
    fen: game.fen,
    legal_moves: game.turn === 'b' ? legalMoves : [],
    last_move: game.move_history?.length > 0 ? game.move_history[game.move_history.length - 1] : null,
    move_history: game.move_history || []
  });
}
