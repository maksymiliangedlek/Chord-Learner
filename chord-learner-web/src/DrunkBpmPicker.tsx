import { useState, useEffect, useRef, useCallback } from 'react';

const DIGIT_SIZE = 52;
const FLYING_COUNT = 18;
const MAX_SLOTS = 3;

type FlyingDigit = {
  id: number;
  digit: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type DrunkBpmPickerProps = {
  bpm: number;
  onBpmChange: (bpm: number) => void;
};

function randomDigit(): number {
  return Math.floor(Math.random() * 10);
}

function spawnDigit(id: number, w: number, h: number, fixedDigit?: number): FlyingDigit {
  return {
    id,
    digit: fixedDigit ?? randomDigit(),
    x: Math.random() * (w - DIGIT_SIZE),
    y: Math.random() * (h - DIGIT_SIZE),
    vx: (Math.random() - 0.5) * 2.4,
    vy: (Math.random() - 0.5) * 2.4,
  };
}

function clampBpm(raw: number): number {
  if (isNaN(raw)) return 40;
  return Math.min(220, Math.max(40, raw));
}

export function DrunkBpmPicker({ bpm, onBpmChange }: DrunkBpmPickerProps) {
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null]);
  const [digits, setDigits] = useState<FlyingDigit[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const dropZoneRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(FLYING_COUNT);
  const rafRef = useRef<number>(0);
  const draggingIdRef = useRef<number | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const digitsRef = useRef(digits);
  const slotsRef = useRef(slots);

  useEffect(() => { draggingIdRef.current = draggingId; }, [draggingId]);
  useEffect(() => { dragOffsetRef.current = dragOffset; }, [dragOffset]);
  useEffect(() => { digitsRef.current = digits; }, [digits]);
  useEffect(() => { slotsRef.current = slots; }, [slots]);

  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const guaranteed = Array.from({ length: 10 }, (_, digit) => spawnDigit(digit, w, h, digit));
    const extra = Array.from({ length: FLYING_COUNT - 10 }, (_, i) => spawnDigit(10 + i, w, h));
    setDigits([...guaranteed, ...extra]);
  }, []);

  useEffect(() => {
    const animate = () => {
      if (draggingIdRef.current === null) {
        setDigits(prev =>
          prev.map(d => {
            let { x, y, vx, vy } = d;
            x += vx;
            y += vy;
            if (x <= 0) { x = 0; vx = Math.abs(vx); }
            if (y <= 0) { y = 0; vy = Math.abs(vy); }
            if (x >= window.innerWidth - DIGIT_SIZE) { x = window.innerWidth - DIGIT_SIZE; vx = -Math.abs(vx); }
            if (y >= window.innerHeight - DIGIT_SIZE) { y = window.innerHeight - DIGIT_SIZE; vy = -Math.abs(vy); }
            return { ...d, x, y, vx, vy };
          })
        );
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const placeDigit = useCallback((digit: number) => {
    setSlots(prev => {
      const next = [...prev];
      const idx = next.findIndex(s => s === null);
      if (idx === -1) return prev;
      next[idx] = digit;
      const str = next.filter(v => v !== null).join('');
      if (str.length >= 2) {
        onBpmChange(clampBpm(parseInt(str, 10)));
      }
      return next;
    });
  }, [onBpmChange]);

  const removeFromSlot = (index: number) => {
    const digit = slots[index];
    if (digit === null) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const id = nextIdRef.current++;
    setDigits(prev => [...prev, { ...spawnDigit(id, w, h), digit }]);

    const newSlots = [...slots];
    newSlots[index] = null;
    for (let i = index; i < MAX_SLOTS - 1; i++) {
      newSlots[i] = newSlots[i + 1];
    }
    newSlots[MAX_SLOTS - 1] = null;
    setSlots(newSlots);
  };

  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    e.preventDefault();
    const d = digitsRef.current.find(d => d.id === id);
    if (!d) return;
    const offset = { x: e.clientX - d.x, y: e.clientY - d.y };
    dragOffsetRef.current = offset;
    setDragOffset(offset);
    setDraggingId(id);
  };

  useEffect(() => {
    if (draggingId === null) return;

    const onMove = (e: PointerEvent) => {
      const id = draggingIdRef.current;
      if (id === null) return;
      const offset = dragOffsetRef.current;
      setDigits(prev =>
        prev.map(d =>
          d.id === id
            ? { ...d, x: e.clientX - offset.x, y: e.clientY - offset.y }
            : d
        )
      );
    };

    const onUp = (e: PointerEvent) => {
      const id = draggingIdRef.current;
      if (id === null) return;

      const dragged = digitsRef.current.find(d => d.id === id);
      const zone = dropZoneRef.current?.getBoundingClientRect();

      if (dragged && zone) {
        const inZone =
          e.clientX >= zone.left && e.clientX <= zone.right &&
          e.clientY >= zone.top && e.clientY <= zone.bottom;

        if (inZone && slotsRef.current.some(s => s === null)) {
          placeDigit(dragged.digit);
          setDigits(prev => prev.filter(d => d.id !== id));
        }
      }

      setDraggingId(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [draggingId, placeDigit]);

  const clearSlots = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const toRespawn = slots.filter((s): s is number => s !== null);
    setDigits(prev => [
      ...prev,
      ...toRespawn.map(digit => {
        const id = nextIdRef.current++;
        return { ...spawnDigit(id, w, h), digit };
      }),
    ]);
    setSlots([null, null, null]);
  };

  const displayBpm = slots.filter(s => s !== null).length >= 2
    ? clampBpm(parseInt(slots.filter(s => s !== null).join(''), 10))
    : bpm;

  return (
    <>
      <div className="drunk-bpm-picker">
        <div className="bpm-label-row">
          <label>Tempo</label>
          <span className="drunk-bpm-hint">Łap cyferki i wrzuć tutaj ↓</span>
        </div>

        <div className="drunk-bpm-drop-zone" ref={dropZoneRef}>
          {slots.map((slot, i) => (
            <button
              key={i}
              type="button"
              className={`drunk-bpm-slot${slot !== null ? ' filled' : ''}`}
              onClick={() => removeFromSlot(i)}
              title={slot !== null ? 'Kliknij żeby usunąć' : undefined}
            >
              {slot !== null ? slot : '—'}
            </button>
          ))}
          <span className="drunk-bpm-unit">BPM</span>
        </div>

        <div className="drunk-bpm-footer">
          <span className="drunk-bpm-value">{displayBpm} BPM</span>
          {slots.some(s => s !== null) && (
            <button type="button" className="drunk-bpm-clear" onClick={clearSlots}>
              Wyczyść
            </button>
          )}
        </div>
      </div>

      <div className="flying-digits-layer">
        {digits.map(d => (
          <div
            key={d.id}
            className={`flying-digit${draggingId === d.id ? ' dragging' : ''}`}
            style={{ left: d.x, top: d.y }}
            onPointerDown={e => handlePointerDown(e, d.id)}
          >
            {d.digit}
          </div>
        ))}
      </div>
    </>
  );
}
