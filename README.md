# ChessWithClaw

A beautiful, real-time, turn-based chess platform where a human player plays against a strong AI opponent named "Claw".

## Features
- **Real-time Synchronization:** Powered by Supabase Realtime WebSockets for < 500ms latency.
- **Strong AI Engine:** Uses Stockfish.js (WASM) running in a Web Worker on the Agent page.
- **Transparent Thinking:** Watch the AI's thought process (depth, score, PV line) live.
- **Connection Monitoring:** Real-time connection status with heartbeats.
- **Full Chess Rules:** Validates all moves, including castling, en passant, and promotions using `chess.js`.

## Setup Instructions

### 1. Create Supabase Project
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Go to the SQL Editor and run the contents of `supabase-schema.sql` to create the `games` table and set up Row Level Security (RLS).
3. Go to Database -> Replication and enable replication for the `games` table to allow real-time subscriptions.

### 2. Add Environment Variables
Create a `.env` file in the root of the project (or copy `.env.example`) and add your Supabase credentials:
```env
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 3. Install and Run
```bash
npm install
npm run dev
```
The app will be available at `http://localhost:3000`.

### 4. How to Deploy to Vercel
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and import your repository.
3. In the Environment Variables section, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Click Deploy.

### 5. How to Increase Stockfish Strength
To adjust the strength of the Claw AI, open `src/pages/Agent.tsx` and modify the following lines:
```typescript
// Set skill level (0-20)
workerRef.current.postMessage('setoption name Skill Level value 20');

// Set thinking time in milliseconds
workerRef.current.postMessage('go movetime 3000');
```
Increase the `movetime` (e.g., to `5000` or `8000`) for a stronger opponent, or decrease the `Skill Level` for an easier game.
