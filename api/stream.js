import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { id } = req.query;
  if (!id) {
    res.write(`data: ${JSON.stringify({ error: 'Missing game ID' })}\n\n`);
    return res.end();
  }

  let supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'undefined') {
    res.write(`data: ${JSON.stringify({ error: 'Server configuration error' })}\n\n`);
    return res.end();
  }

  if (!supabaseUrl.startsWith('http')) {
    supabaseUrl = `https://${supabaseUrl}`;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Send initial connection success message
  res.write(`data: ${JSON.stringify({ status: 'connected', game_id: id, message: 'Listening for game updates...' })}\n\n`);

  // Subscribe to Supabase changes securely on the server side
  const channel = supabase.channel(`game-${id}-server`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${id}` }, (payload) => {
      // Forward the update to the bot without exposing Supabase credentials
      res.write(`data: ${JSON.stringify({ 
        event: 'update', 
        fen: payload.new.fen, 
        current_turn: payload.new.turn === 'w' ? 'WHITE' : 'BLACK',
        last_move: payload.new.move_history?.length > 0 ? payload.new.move_history[payload.new.move_history.length - 1] : null
      })}\n\n`);
    })
    .subscribe();

  // Keep-alive ping to prevent the connection from dropping
  const interval = setInterval(() => {
    res.write(': ping\n\n');
  }, 15000);

  // Cleanup when the bot disconnects
  req.on('close', () => {
    clearInterval(interval);
    supabase.removeChannel(channel);
    res.end();
  });
}
