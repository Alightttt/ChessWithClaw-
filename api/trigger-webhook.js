import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
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
  
  const { id, event, extraData } = req.body || {};
  if (!id || !event) return res.status(400).json({ error: 'Missing id or event in JSON body' });

  let supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'undefined') {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!supabaseUrl.startsWith('http')) {
    supabaseUrl = `https://${supabaseUrl}`;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: game, error } = await supabase.from('games').select('webhook_url, status, result, result_reason, fen, move_history, chat_history').eq('id', id).single();
  if (error || !game) return res.status(404).json({ error: 'Game not found' });

  if (game.webhook_url) {
    try {
      await fetch(game.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          game_id: id,
          status: game.status,
          result: game.result || null,
          result_reason: game.result_reason || null,
          fen: game.fen,
          move_count: (game.move_history || []).length,
          chat_count: (game.chat_history || []).length,
          ...extraData
        })
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to trigger webhook' });
    }
  }

  res.status(200).json({ success: true, message: 'No webhook registered' });
}
