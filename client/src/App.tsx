import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { SkullKingApp } from './games/skull-king/SkullKingApp';
import { LoveLetterApp } from './games/love-letter/LoveLetterApp';

function HomePage() {
  return (
    <div className="lobby">
      <h1>🎮 Gameio</h1>
      <p style={{ color: 'var(--c-text-dim)', marginBottom: 32 }}>Choisissez un jeu</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link to="/skull-king" style={{ textDecoration: 'none' }}>
          <div className="match-item" style={{ cursor: 'pointer', padding: '24px 40px', fontSize: 18 }}>
            ☠️ Skull King
          </div>
        </Link>
        <Link to="/love-letter" style={{ textDecoration: 'none' }}>
          <div className="match-item" style={{ cursor: 'pointer', padding: '24px 40px', fontSize: 18 }}>
            💌 Love Letter
          </div>
        </Link>
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/skull-king/*" element={<SkullKingApp />} />
        <Route path="/love-letter/*" element={<LoveLetterApp />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
