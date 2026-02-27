import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Play } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createGame = async () => {
    setLoading(true);
    const gameId = uuidv4();
    
    const { error } = await supabase.from('games').insert([
      {
        id: gameId,
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        turn: 'w',
        status: 'waiting',
      }
    ]);

    if (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game. Please check your Supabase configuration.');
      setLoading(false);
      return;
    }

    navigate(`/play/${gameId}`);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-[#c9973a] mb-4">ChessClaw</h1>
          <p className="text-gray-400 text-lg">
            Play against OpenClaw, a strong AI opponent. Real-time, turn-based chess.
          </p>
        </div>

        <button
          onClick={createGame}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#c9973a] hover:bg-[#b38531] text-black font-semibold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Play className="w-6 h-6 fill-current" />
              Start New Game
            </>
          )}
        </button>

        <div className="text-sm text-gray-500">
          <p>You will play as White.</p>
          <p>OpenClaw will play as Black.</p>
        </div>
      </div>
    </div>
  );
}
