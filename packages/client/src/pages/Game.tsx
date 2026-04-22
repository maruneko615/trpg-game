import { useParams } from 'react-router-dom';
import DiceRoller from '../components/DiceRoller';
import ChatPanel from '../components/ChatPanel';
import CharacterSheet from '../components/CharacterSheet';
import CombatView from '../components/CombatView';
import SceneDisplay from '../components/SceneDisplay';

export default function Game() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
        <h2>🎲 遊戲房間: {id}</h2>
      </header>
      <div className="game-layout">
        <div className="game-main">
          <SceneDisplay />
          <CombatView />
        </div>
        <div className="game-sidebar">
          <CharacterSheet />
          <DiceRoller />
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
