import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Game from './pages/Game';
import Agent from './pages/Agent';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" theme="dark" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Game" element={<Game />} />
        <Route path="/Agent" element={<Agent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
