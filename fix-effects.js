const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

const effect1ToDelete = `  useEffect(() => {
    if (Array.isArray(game?.chat_history) && game.chat_history.length > 0) {
      setChatMessages(game.chat_history);
    }
  }, [game?.chat_history]);

`;

code = code.replace(effect1ToDelete, '');

const effect2ToDelete = `  useEffect(() => {
    if (game?.status === 'finished' || game?.status === 'abandoned') {
      // Clear ALL intervals immediately on game over
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current = [];
      allIntervalsRef.current.forEach(clearInterval);
      allIntervalsRef.current = [];
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      setShowGameOver(true);
    }
  }, [game?.status]);

`;

code = code.replace(effect2ToDelete, '');

const effectToUpdate = `  useEffect(() => {
    if (game?.status === 'finished' || game?.status === 'abandoned') {
      localStorage.removeItem('chesswithclaw_active_game');
      setShowGameOver(true);`;

const updatedEffect = `  useEffect(() => {
    if (game?.status === 'finished' || game?.status === 'abandoned') {
      // Clear ALL intervals immediately on game over
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current = [];
      allIntervalsRef.current.forEach(clearInterval);
      allIntervalsRef.current = [];
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      
      localStorage.removeItem('chesswithclaw_active_game');
      setShowGameOver(true);`;

code = code.replace(effectToUpdate, updatedEffect);

fs.writeFileSync('src/pages/Game.jsx', code);
