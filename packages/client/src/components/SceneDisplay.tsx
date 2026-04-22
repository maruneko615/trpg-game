import type { Scene } from '@trpg/shared';

const placeholder: Scene = {
  id: '0',
  description: '你站在一座古老城堡的入口前，空氣中瀰漫著神秘的氣息...',
  choices: [
    { id: '1', text: '推開大門' },
    { id: '2', text: '繞到後方' },
  ],
  enemies: [],
};

export default function SceneDisplay() {
  const scene = placeholder;

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem' }}>
      <h3>🏰 場景</h3>
      <p style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>{scene.description}</p>
      {scene.choices.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.8rem' }}>
          {scene.choices.map((c) => (
            <button key={c.id} style={{ background: 'var(--bg-card)', textAlign: 'left' }}>{c.text}</button>
          ))}
        </div>
      )}
    </div>
  );
}
