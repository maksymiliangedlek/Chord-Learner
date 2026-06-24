export interface ChordInfo {
    notes: number[];        // indeksy klawiszy (0=C4 .. 23=B5)
    fingers: string;        // opis palcowania
    description: string;    // czym jest ten akord
  }
    
  function chord(root: number, intervals: number[]): number[] {
    return intervals.map(i => root + i);
  }
  
  const roots: Record<string, number> = {
    C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5,
    'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, H: 11, B: 11,
  };
  
  const MAJ   = [0, 4, 7];
  const MIN   = [0, 3, 7];
  const DOM7  = [0, 4, 7, 10];
  const SUS4  = [0, 5, 7];
  

  
  function fingeringMaj(rootName: string) {
    return `Palec 1 (kciuk) na ${rootName}, palec 3 (środkowy) na tercji wielkiej, palec 5 (mały) na kwincie`;
  }
  function fingeringMin(rootName: string) {
    return `Palec 1 (kciuk) na ${rootName}, palec 3 (środkowy) na tercji małej, palec 5 (mały) na kwincie`;
  }
  function fingering7(rootName: string) {
    return `Palec 1 na ${rootName}, palec 2 na tercji, palec 4 na kwincie, palec 5 na septymie małej`;
  }
  function fingeringSus4(rootName: string) {
    return `Palec 1 na ${rootName}, palec 2 lub 3 na kwarcie czystej, palec 5 na kwincie`;
  }
  
  function descMaj() { return `Akord durowy — brzmi radośnie i jasno. Podstawa harmonii klasycznej.`; }
  function descMin() { return `Akord molowy — brzmi melancholijnie i poważnie.`; }
  function desc7()   { return `Dominantoseptymowy — napięty, prowadzi do rozwiązania. Często w bluesie i jazzie.`; }
  function descSus4(){ return `Suspended 4 — kwarta zamiast tercji, brzmi zawieszono i nowoczesnie.`; }
  
  export const CHORD_DATA: Record<string, ChordInfo> = {};
  
  const noteNames: Record<string, string> = {
    C:'C', 'C#':'C#', D:'D', 'D#':'D#', E:'E', F:'F',
    'F#':'F#', G:'G', 'G#':'G#', A:'A', 'A#':'A#', H:'H/B', B:'H/B'
  };
  
  for (const [key, root] of Object.entries(roots)) {
    const rName = noteNames[key] ?? key;
  
    CHORD_DATA[key]         = { notes: chord(root, MAJ),  fingers: fingeringMaj(rName), description: descMaj() };
    CHORD_DATA[key.toLowerCase()] = { notes: chord(root, MIN),  fingers: fingeringMin(rName), description: descMin() };
    CHORD_DATA[`${key}7`]   = { notes: chord(root, DOM7), fingers: fingering7(rName),   description: desc7()   };
    CHORD_DATA[`${key}sus4`]= { notes: chord(root, SUS4), fingers: fingeringSus4(rName),description: descSus4()};
  }
  
  for (const key of ['C#','D#','F#','G#','A#']) {
    CHORD_DATA[`${key.toLowerCase()}`] = { ...CHORD_DATA[key.toLowerCase()] ?? CHORD_DATA[key] };
    const root = roots[key];
    CHORD_DATA[`${key.toLowerCase()}`] = { notes: chord(root, MIN), fingers: fingeringMin(key), description: descMin() };
  }
  
  CHORD_DATA['Hsus4'] = CHORD_DATA['Bsus4'] ?? { notes: chord(11, SUS4), fingers: fingeringSus4('H/B'), description: descSus4() };
  CHORD_DATA['hsus4'] = { notes: chord(11, SUS4), fingers: fingeringSus4('H/B'), description: descSus4() };