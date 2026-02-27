/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Play from './pages/Play';
import Agent from './pages/Agent';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:id" element={<Play />} />
        <Route path="/agent/:id" element={<Agent />} />
      </Routes>
    </Router>
  );
}
