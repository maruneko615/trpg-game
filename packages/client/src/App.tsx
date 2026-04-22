import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import CharacterCreate from './pages/CharacterCreate';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game/:id" element={<Game />} />
      <Route path="/character/create" element={<CharacterCreate />} />
    </Routes>
  );
}
