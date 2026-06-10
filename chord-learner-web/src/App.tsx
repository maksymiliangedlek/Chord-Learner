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
  const [bpmInput, setBpmInput] = useState('100');

  const [displayedChord, setDisplayedChord] = useState<string>('—');
  const [displayedNextChord, setDisplayedNextChord] = useState<string>('');
  const [isChanging, setIsChanging] = useState(false);

  const metronomeRef = useRef<MetronomeEngine>(new MetronomeEngine());
  const nextChordRef = useRef<string>('');

  const getRandomChord = (chords: string[]) => chords[Math.floor(Math.random() * chords.length)];

  useEffect(() => {
    const metronome = metronomeRef.current;

    metronome.onBeat = (beat) => {
      setActiveBeat(beat);

      if (beat === 0 && selectedChords.length > 0) {
        // Krótka animacja — scale bounce na karcie
        setIsChanging(true);
        setTimeout(() => setIsChanging(false), 150);

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
      setDisplayedChord('—');
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

  const handleBpmInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBpmInput(e.target.value);
  };
  
  const handleBpmBlur = () => {
    const raw = parseInt(bpmInput, 10);
    const clamped = isNaN(raw) ? 40 : Math.min(220, Math.max(40, raw));
    setBpm(clamped);
    setBpmInput(String(clamped));
    metronomeRef.current.setBPM(clamped);
  };
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setBpm(val);
    setBpmInput(String(val));
    metronomeRef.current.setBPM(val);
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
      <h1>Szkoła Akordeonu im. Zapałki</h1>

      {/* Scena z akordami */}
      <div className="chord-stage">
        <div className={`chord-display${isChanging ? ' changing' : ''}`}>
          {displayedChord}
        </div>

        {isPlaying && selectedChords.length > 0 && (
          /* key powoduje re-mount przy każdej zmianie → animation fadeSlideIn odpala się świeżo */
          <div className="chord-next" key={displayedNextChord}>
            <span className="chord-next-label">Następny</span>
            <span className="chord-next-value">{displayedNextChord}</span>
          </div>
        )}
      </div>

      {/* Wskaźnik uderzeń */}
      <div className="beats-indicator">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`beat-dot${activeBeat === i ? ' active' : ''}${i === 0 ? ' accent' : ''}`}
          />
        ))}
      </div>

      {/* Kontrolki */}
      <div className="controls">
        <div className="bpm-slider-container">
          <div className="bpm-label-row">
            <label>Tempo</label>
            <input
              type="number"
              className="bpm-input"
              min={40}
              max={220}
              value={bpmInput}
              onChange={handleBpmInput}
              onBlur={handleBpmBlur}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            />
          </div>
          <input type="range" min="40" max="220" value={bpm} onChange={handleSliderChange} />
        </div>
        <button className={`play-btn ${isPlaying ? 'stop' : 'start'}`} onClick={togglePlay}>
          {isPlaying ? 'Stop' : 'Start'}
        </button>
      </div>

      {/* Wybór akordów */}
      <div className="chord-selector">
        <h3>Wybierz akordy ({selectedChords.length})</h3>
        <div className="chord-grid">
          {ALL_CHORDS.map(chord => (
            <button
              key={chord}
              className={`chord-btn${selectedChords.includes(chord) ? ' selected' : ''}`}
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