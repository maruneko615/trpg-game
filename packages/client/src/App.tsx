import { useState } from 'react';
import Home from './pages/Home';
import Game from './pages/Game';
import CharacterCreate from './pages/CharacterCreate';

export default function App() {
  const [page, setPage] = useState<{ name: string; id?: string; scenario?: string }>({ name: 'home' });
  const navigate = (name: string, id?: string, scenario?: string) => setPage({ name, id, scenario });

  switch (page.name) {
    case 'game':
      return <Game id={page.id!} scenario={page.scenario || 'coc'} onBack={() => navigate('home')} />;
    case 'character':
      return <CharacterCreate onBack={() => navigate('home')} />;
    default:
      return <Home onNavigate={navigate} />;
  }
}
