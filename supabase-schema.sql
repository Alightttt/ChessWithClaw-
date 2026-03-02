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
    thinking_log jsonb[] DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Allow public access for simplicity (since games are public)
CREATE POLICY "Allow public read access" ON public.games FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.games FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.games FOR UPDATE USING (true);

-- Enable real-time for the games table
alter publication supabase_realtime add table public.games;
