// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import { MetronomeEngine } from './MetronomeEngine';
import './index.css';

const ALL_CHORDS = ['C', 'C7', 'd', 'D', 'e', 'E', 'F', 'G', 'G7', 'a', 'A', 'A7', 'H', 'B'];

function App() {
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBeat, setActiveBeat] = useState(-1);
  const [selectedChords, setSelectedChords] = useState<string[]>(['C', 'G', 'a', 'F']);
  const [displayedChord, setDisplayedChord] = useState<string>('Wybierz akordy i kliknij Start');
  
  const metronomeRef = useRef<MetronomeEngine>(new MetronomeEngine());

  useEffect(() => {
    const metronome = metronomeRef.current;
    
    metronome.onBeat = (beat) => {
      setActiveBeat(beat);
      
      if (beat === 0 && selectedChords.length > 0) {
        const randomChord = selectedChords[Math.floor(Math.random() * selectedChords.length)];
        setDisplayedChord(randomChord);
      }
    };

    return () => metronome.stop(); 
  }, [selectedChords]);

  const togglePlay = () => {
    const metronome = metronomeRef.current;
    if (isPlaying) {
      metronome.stop();
      setActiveBeat(-1);
    } else {
      metronome.setBPM(bpm);
      metronome.start();
    }
    setIsPlaying(!isPlaying);
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = Number(e.target.value);
    setBpm(newBpm);
    metronomeRef.current.setBPM(newBpm);
  };

  const toggleChord = (chord: string) => {
    setSelectedChords(prev => 
      prev.includes(chord) 
        ? prev.filter(c => c !== chord) 
        : [...prev, chord]
    );
  };

  return (
    <div className="container">
      <h1>Ćwiczenie Akordów</h1>

      {/* Ekran głównego akordu */}
      <div className="chord-display">
        {isPlaying ? displayedChord : "GOTOWY?"}
      </div>

      {/* Sygnalizator uderzeń (4 kropki) */}
      <div className="beats-indicator">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`beat-dot ${activeBeat === i ? 'active' : ''} ${i === 0 ? 'accent' : ''}`} />
        ))}
      </div>

      {/* Kontrolki Metronomu */}
      <div className="controls">
        <div className="bpm-slider-container">
          <label>Tempo: <strong>{bpm} BPM</strong></label>
          <input type="range" min="40" max="220" value={bpm} onChange={handleBpmChange} />
        </div>

        <button className={`play-btn ${isPlaying ? 'stop' : 'start'}`} onClick={togglePlay}>
          {isPlaying ? 'STOP' : 'START METRONOMU'}
        </button>
      </div>

      {/* Wybór Akordów */}
      <div className="chord-selector">
        <h3>Wybierz akordy do dzisiejszego treningu:</h3>
        <div className="chord-grid">
          {ALL_CHORDS.map(chord => (
            <button
              key={chord}
              className={`chord-btn ${selectedChords.includes(chord) ? 'selected' : ''}`}
              onClick={() => toggleChord(chord)}
            >
              {chord}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;