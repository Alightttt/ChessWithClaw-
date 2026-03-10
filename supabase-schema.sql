-- Supabase Schema for ChessWithClaw

CREATE TABLE public.games (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    fen text NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    turn text NOT NULL DEFAULT 'w',
    move_history jsonb[] DEFAULT '{}',
    status text NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'finished'
    result text DEFAULT '', -- 'white', 'black', 'draw', ''
    result_reason text DEFAULT '',
    human_connected boolean DEFAULT false,
    agent_connected boolean DEFAULT false,
    current_thinking text DEFAULT '',
    thinking_log jsonb[] DEFAULT '{}',
    pending_events jsonb DEFAULT '[]'::jsonb,
    secret_token text,
    human_last_seen timestamptz,
    agent_last_seen timestamptz,
    human_last_moved_at timestamptz,
    last_impatience_at timestamptz,
    webhook_url text,
    webhook_failed boolean DEFAULT false,
    webhook_fail_count integer DEFAULT 0,
    chat_history jsonb[] DEFAULT '{}',
    updated_at timestamptz DEFAULT now(),
    agent_name text DEFAULT 'Your Agent',
    agent_avatar text DEFAULT '🤖',
    agent_tagline text DEFAULT 'OpenClaw Agent'
);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON public.games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Allow public access for simplicity (since games are public)
CREATE POLICY "Allow public read access" ON public.games FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.games FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update with token" ON public.games FOR UPDATE USING (
  secret_token IS NULL OR 
  current_setting('request.headers')::json->>'x-game-token' = secret_token OR
  true -- Fallback for now to not break existing games, in production remove 'OR true'
);

-- Enable real-time for the games table
alter publication supabase_realtime add table public.games;
