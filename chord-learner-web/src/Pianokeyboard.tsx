interface Props {
    activeNotes: number[]; 
  }
  
  const WHITE_IN_OCTAVE = [0, 2, 4, 5, 7, 9, 11];
  const BLACK_IN_OCTAVE = [1, 3, -1, 6, 8, 10, -1]; 
  
  const WHITE_LABELS = ['C','D','E','F','G','A','H','C','D','E','F','G','A','H'];
  
  export function PianoKeyboard({ activeNotes }: Props) {
    const whites: { semitone: number; label: string }[] = [];
    const blacks: { semitone: number; whiteIndex: number } | any[] = [];
  
    for (let oct = 0; oct < 2; oct++) {
      WHITE_IN_OCTAVE.forEach((semi, i) => {
        const globalSemi = oct * 12 + semi;
        whites.push({ semitone: globalSemi, label: WHITE_LABELS[oct * 7 + i] });
      });
      BLACK_IN_OCTAVE.forEach((semi, i) => {
        if (semi === -1) return;
        const globalSemi = oct * 12 + semi;
        const whiteIndex = oct * 7 + i;
        blacks.push({ semitone: globalSemi, whiteIndex });
      });
    }
  
    const W = 36; 
    const H_WHITE = 140;
    const H_BLACK = 88;
    const W_BLACK = 22;
    const totalWidth = whites.length * W;
  
    return (
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <svg
          viewBox={`0 0 ${totalWidth} ${H_WHITE}`}
          width="100%"
          style={{ display: 'block', maxWidth: '100%' }}
        >
          {/* Białe klawisze */}
          {whites.map((wk, i) => {
            const active = activeNotes.includes(wk.semitone);
            return (
              <g key={`w-${i}`}>
                <rect
                  x={i * W + 1}
                  y={0}
                  width={W - 2}
                  height={H_WHITE - 2}
                  rx={4}
                  fill={active ? '#dbeafe' : 'white'}
                  stroke={active ? '#007aff' : '#d1d1d6'}
                  strokeWidth={active ? 1.5 : 1}
                />
                {active && (
                  <circle
                    cx={i * W + W / 2}
                    cy={H_WHITE - 18}
                    r={8}
                    fill="#007aff"
                  />
                )}
                <text
                  x={i * W + W / 2}
                  y={H_WHITE - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill={active ? '#007aff' : '#8e8e93'}
                  fontFamily="-apple-system, sans-serif"
                  fontWeight={active ? '700' : '400'}
                >
                  {wk.label}
                </text>
              </g>
            );
          })}
  
          {/* Czarne klawisze */}
          {blacks.map((bk: any, i: number) => {
            const active = activeNotes.includes(bk.semitone);
            const x = bk.whiteIndex * W + W - W_BLACK / 2 - 1;
            return (
              <g key={`b-${i}`}>
                <rect
                  x={x}
                  y={0}
                  width={W_BLACK}
                  height={H_BLACK}
                  rx={3}
                  fill={active ? '#007aff' : '#1c1c1e'}
                  stroke={active ? '#0051d5' : '#000'}
                  strokeWidth={0.5}
                />
                {active && (
                  <circle
                    cx={x + W_BLACK / 2}
                    cy={H_BLACK - 12}
                    r={6}
                    fill="white"
                    opacity={0.9}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }