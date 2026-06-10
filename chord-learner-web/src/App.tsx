// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import { MetronomeEngine } from './MetronomeEngine';
import './index.css';

const ALL_CHORDS = [
  'C', 'c', 'C7', 'Csus4',
  'C#', 'c#', 'C#7', 'C#sus4',
  'D', 'd', 'D7', 'Dsus4',
  'D#', 'd#', 'D#7', 'D#sus4',
  'E', 'e', 'E7', 'Esus4',
  'F', 'f', 'F7', 'Fsus4',
  'F#', 'f#', 'F#7', 'F#sus4',
  'G', 'g', 'G7', 'Gsus4',
  'G#', 'g#', 'G#7', 'G#sus4',
  'A', 'a', 'A7', 'Asus4',
  'A#', 'a#', 'A#7', 'A#sus4',
  'H', 'h', 'H7', 'Hsus4',
  'B', 'b', 'B7', 'Bsus4'
];

function App() {
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBeat, setActiveBeat] = useState(-1);
  const [selectedChords, setSelectedChords] = useState<string[]>(['C', 'G', 'a', 'F']);
  
  const [displayedChord, setDisplayedChord] = useState<string>('GOTOWY?');
  const [displayedNextChord, setDisplayedNextChord] = useState<string>('');
  
  const metronomeRef = useRef<MetronomeEngine>(new MetronomeEngine());
  
  const nextChordRef = useRef<string>('');

  const getRandomChord = (chords: string[]) => chords[Math.floor(Math.random() * chords.length)];

  useEffect(() => {
    const metronome = metronomeRef.current;
    
    metronome.onBeat = (beat) => {
      setActiveBeat(beat);
      
      if (beat === 0 && selectedChords.length > 0) {
        setDisplayedChord(nextChordRef.current);
        
        const newNext = getRandomChord(selectedChords);
        setDisplayedNextChord(newNext);
        nextChordRef.current = newNext; 
      }
    };

    return () => metronome.stop(); 
  }, [selectedChords]);

  const togglePlay = () => {
    const metronome = metronomeRef.current;
    if (isPlaying) {
      metronome.stop();
      setActiveBeat(-1);
      setDisplayedNextChord(''); 
      setDisplayedChord('GOTOWY?');
    } else {
      if (selectedChords.length > 0) {
        const first = getRandomChord(selectedChords);
        const second = getRandomChord(selectedChords);
        
        setDisplayedChord(first);
        setDisplayedNextChord(second);
        nextChordRef.current = second;
      }
      
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
      <h1>Szkoła akordeonu im. Zapałki</h1>

      {/* Scena z Akordami (Główny i Następny) */}
      <div className="chord-stage">
        <div className="chord-display">
          {displayedChord}
        </div>
        
        {/* Renderujemy "Następny" tylko jeśli gra metronom i są wybrane akordy */}
        {isPlaying && selectedChords.length > 0 && (
          <div className="chord-next">
            <span className="chord-next-label">Następny: </span>
            <span className="chord-next-value">{displayedNextChord}</span>
          </div>
        )}
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
        <h3>Wybierz akordy:</h3>
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