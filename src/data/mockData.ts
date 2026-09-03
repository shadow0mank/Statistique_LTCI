import { Draw, BallStat, MonthlyVolume, GameType } from '../types';

const rawInitialDraws = [
  {
    id: 'draw-2840',
    drawNumber: 2840,
    game: 'diamant',
    gameName: 'Loto Diamant',
    date: '03/09/2026',
    time: '13:00 GMT',
    machineId: 'Machine #1489',
    hash: '9b2d8fe289f64c8d1796cb1301a91eef73c09b8b919a86d2b51ffad31ec198a0',
    balls: [4, 12, 18, 27, 42] as [number, number, number, number, number],
    sum: 103,
    evenCount: 4,
    oddCount: 1,
    maxGap: 15,
    isVerified: true,
  },
  {
    id: 'draw-2839',
    drawNumber: 2839,
    game: 'national',
    gameName: 'National CI',
    date: '03/09/2026',
    time: '10:00 GMT',
    machineId: 'Machine #1482',
    hash: 'e4f1a2c3884b65a21efd9018423abcdf9988112233445566778899aabbccdde0',
    balls: [7, 27, 33, 58, 81] as [number, number, number, number, number],
    sum: 206,
    evenCount: 1,
    oddCount: 4,
    maxGap: 25,
    isVerified: true,
  },
  {
    id: 'draw-2838',
    drawNumber: 2838,
    game: 'bambou',
    gameName: 'Loto Bambou',
    date: '02/09/2026',
    time: '19:00 GMT',
    machineId: 'Machine #1485',
    hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    balls: [12, 19, 44, 60, 78] as [number, number, number, number, number],
    sum: 213,
    evenCount: 4,
    oddCount: 1,
    maxGap: 25,
    isVerified: true,
  },
  {
    id: 'draw-2837',
    drawNumber: 2837,
    game: 'fortune',
    gameName: 'Loto Fortune',
    date: '02/09/2026',
    time: '16:00 GMT',
    machineId: 'Machine #1489',
    hash: 'c83b271d9e7421ab5091ffca8432a104bbce8743e21075ffcdba49204859a012',
    balls: [4, 22, 39, 51, 67] as [number, number, number, number, number],
    sum: 183,
    evenCount: 2,
    oddCount: 3,
    maxGap: 18,
    isVerified: true,
  },
  {
    id: 'draw-2836',
    drawNumber: 2836,
    game: 'etoile',
    gameName: 'Loto Étoile',
    date: '02/09/2026',
    time: '13:00 GMT',
    machineId: 'Machine #1477',
    hash: 'ff78e34a5d610bc93418bafe21980345ea8761209bca3487fcd6543189ef01a2',
    balls: [15, 27, 42, 63, 89] as [number, number, number, number, number],
    sum: 236,
    evenCount: 1,
    oddCount: 4,
    maxGap: 26,
    isVerified: true,
  },
  {
    id: 'draw-2835',
    drawNumber: 2835,
    game: 'espoir',
    gameName: 'Loto Espoir',
    date: '02/09/2026',
    time: '10:00 GMT',
    machineId: 'Machine #1482',
    hash: '5d4e3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d',
    balls: [8, 12, 31, 55, 74] as [number, number, number, number, number],
    sum: 180,
    evenCount: 3,
    oddCount: 2,
    maxGap: 24,
    isVerified: true,
  },
  {
    id: 'draw-2834',
    drawNumber: 2834,
    game: 'national',
    gameName: 'National CI',
    date: '01/09/2026',
    time: '19:00 GMT',
    machineId: 'Machine #1489',
    hash: '3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef012',
    balls: [3, 18, 27, 50, 68] as [number, number, number, number, number],
    sum: 166,
    evenCount: 3,
    oddCount: 2,
    maxGap: 23,
    isVerified: true,
  },
  {
    id: 'draw-2833',
    drawNumber: 2833,
    game: 'diamant',
    gameName: 'Loto Diamant',
    date: '01/09/2026',
    time: '13:00 GMT',
    machineId: 'Machine #1485',
    hash: 'bc45ef67890123456789abcdef0123456789abcdef0123456789abcdef012345',
    balls: [10, 24, 42, 73, 85] as [number, number, number, number, number],
    sum: 234,
    evenCount: 3,
    oddCount: 2,
    maxGap: 31,
    isVerified: true,
  },
];

export const INITIAL_DRAWS: Draw[] = rawInitialDraws.map((d) => ({
  ...d,
  source: 'lotobonheur.ci',
  sourceUrl: 'https://lotobonheur.ci/resultats',
  retrievedAt: new Date().toISOString(),
  status: 'CONFORME',
}));


// Generate comprehensive stats for all 90 lotto balls
export const INITIAL_BALL_STATS: BallStat[] = (() => {
  const customValues: Record<number, Partial<BallStat>> = {
    27: { score: 94, rank: 1, appearances24M: 184, frequencyPercent: 18.4, hourlyFrequencyPercent: 18.4, currentGap: 2, maxHistoricalGap: 18, status: 'hot', recentTrend: 'up', hourlyPreference: '19h-20h' },
    12: { score: 92, rank: 2, appearances24M: 176, frequencyPercent: 17.6, hourlyFrequencyPercent: 16.8, currentGap: 4, maxHistoricalGap: 21, status: 'hot', recentTrend: 'up', hourlyPreference: '13h-14h' },
    4:  { score: 90, rank: 3, appearances24M: 171, frequencyPercent: 17.1, hourlyFrequencyPercent: 15.9, currentGap: 1, maxHistoricalGap: 19, status: 'hot', recentTrend: 'up', hourlyPreference: '10h-11h' },
    42: { score: 88, rank: 4, appearances24M: 165, frequencyPercent: 16.5, hourlyFrequencyPercent: 15.2, currentGap: 3, maxHistoricalGap: 24, status: 'hot', recentTrend: 'up', hourlyPreference: '16h-17h' },
    18: { score: 86, rank: 5, appearances24M: 162, frequencyPercent: 16.2, hourlyFrequencyPercent: 14.9, currentGap: 5, maxHistoricalGap: 22, status: 'hot', recentTrend: 'stable', hourlyPreference: '13h-14h' },
    55: { score: 84, rank: 6, appearances24M: 158, frequencyPercent: 15.8, hourlyFrequencyPercent: 14.5, currentGap: 6, maxHistoricalGap: 26, status: 'hot', recentTrend: 'stable', hourlyPreference: '10h-11h' },
    73: { score: 81, rank: 7, appearances24M: 152, frequencyPercent: 15.2, hourlyFrequencyPercent: 14.1, currentGap: 7, maxHistoricalGap: 28, status: 'normal', recentTrend: 'down', hourlyPreference: '19h-20h' },
    89: { score: 79, rank: 8, appearances24M: 148, frequencyPercent: 14.8, hourlyFrequencyPercent: 13.8, currentGap: 8, maxHistoricalGap: 31, status: 'normal', recentTrend: 'down', hourlyPreference: '16h-17h' },
    33: { score: 78, rank: 9, appearances24M: 146, frequencyPercent: 14.6, hourlyFrequencyPercent: 13.5, currentGap: 3, maxHistoricalGap: 25, status: 'normal', recentTrend: 'up', hourlyPreference: '10h-11h' },
    58: { score: 77, rank: 10, appearances24M: 144, frequencyPercent: 14.4, hourlyFrequencyPercent: 13.2, currentGap: 9, maxHistoricalGap: 29, status: 'normal', recentTrend: 'stable', hourlyPreference: '19h-20h' },
    15: { score: 45, rank: 85, appearances24M: 92, frequencyPercent: 9.2, hourlyFrequencyPercent: 8.1, currentGap: 34, maxHistoricalGap: 52, status: 'cold', recentTrend: 'down', hourlyPreference: '13h-14h' },
    63: { score: 42, rank: 86, appearances24M: 88, frequencyPercent: 8.8, hourlyFrequencyPercent: 7.9, currentGap: 38, maxHistoricalGap: 54, status: 'cold', recentTrend: 'down', hourlyPreference: '16h-17h' },
    81: { score: 39, rank: 88, appearances24M: 84, frequencyPercent: 8.4, hourlyFrequencyPercent: 7.5, currentGap: 42, maxHistoricalGap: 58, status: 'cold', recentTrend: 'down', hourlyPreference: '10h-11h' },
    7:  { score: 74, rank: 15, appearances24M: 138, frequencyPercent: 13.8, hourlyFrequencyPercent: 12.8, currentGap: 2, maxHistoricalGap: 30, status: 'normal', recentTrend: 'up', hourlyPreference: '10h-11h' },
    19: { score: 72, rank: 18, appearances24M: 134, frequencyPercent: 13.4, hourlyFrequencyPercent: 12.4, currentGap: 4, maxHistoricalGap: 27, status: 'normal', recentTrend: 'stable', hourlyPreference: '19h-20h' },
    44: { score: 70, rank: 21, appearances24M: 131, frequencyPercent: 13.1, hourlyFrequencyPercent: 12.1, currentGap: 5, maxHistoricalGap: 29, status: 'normal', recentTrend: 'stable', hourlyPreference: '19h-20h' },
    60: { score: 68, rank: 25, appearances24M: 127, frequencyPercent: 12.7, hourlyFrequencyPercent: 11.9, currentGap: 6, maxHistoricalGap: 32, status: 'normal', recentTrend: 'down', hourlyPreference: '19h-20h' },
    78: { score: 66, rank: 29, appearances24M: 124, frequencyPercent: 12.4, hourlyFrequencyPercent: 11.6, currentGap: 8, maxHistoricalGap: 35, status: 'normal', recentTrend: 'down', hourlyPreference: '19h-20h' },
  };

  const list: BallStat[] = [];
  for (let n = 1; n <= 90; n++) {
    if (customValues[n]) {
      list.push({
        number: n,
        score: customValues[n].score || 60,
        rank: customValues[n].rank || n,
        appearances24M: customValues[n].appearances24M || 120,
        frequencyPercent: customValues[n].frequencyPercent || 12.0,
        hourlyFrequencyPercent: customValues[n].hourlyFrequencyPercent || 11.5,
        currentGap: customValues[n].currentGap || 12,
        maxHistoricalGap: customValues[n].maxHistoricalGap || 35,
        status: customValues[n].status || 'normal',
        recentTrend: customValues[n].recentTrend || 'stable',
        hourlyPreference: customValues[n].hourlyPreference || '13h-14h',
      });
    } else {
      // Deterministic calculation for consistent realism
      const seed = (n * 37 + 19) % 100;
      const appearances = 80 + Math.floor((seed / 100) * 75);
      const freq = +(appearances / 10).toFixed(1);
      const score = Math.floor(45 + (appearances / 155) * 45);
      const gap = Math.floor((100 - seed) / 3) + 1;
      const status: 'hot' | 'normal' | 'cold' = score >= 80 ? 'hot' : gap > 25 ? 'cold' : 'normal';
      const hours = ['10h-11h', '13h-14h', '16h-17h', '19h-20h'];
      const hourlyPreference = hours[n % 4];

      list.push({
        number: n,
        score,
        rank: 90 - Math.floor(score * 0.85),
        appearances24M: appearances,
        frequencyPercent: freq,
        hourlyFrequencyPercent: +(freq * 0.95).toFixed(1),
        currentGap: gap,
        maxHistoricalGap: gap + 15 + (n % 20),
        status,
        recentTrend: seed > 60 ? 'up' : seed > 30 ? 'stable' : 'down',
        hourlyPreference,
      });
    }
  }

  // Sort and assign definitive ranks
  list.sort((a, b) => b.score - a.score);
  list.forEach((item, index) => {
    item.rank = index + 1;
  });

  return list;
})();

export const MONTHLY_VOLUME_DATA: MonthlyVolume[] = [
  { month: 'Oct 24', year: 2024, drawCount: 95, percentage: 67 },
  { month: 'Déc 24', year: 2024, drawCount: 104, percentage: 73 },
  { month: 'Fév 25', year: 2025, drawCount: 110, percentage: 77 },
  { month: 'Avr 25', year: 2025, drawCount: 118, percentage: 83 },
  { month: 'Juil 25', year: 2025, drawCount: 122, percentage: 86 },
  { month: 'Nov 25', year: 2025, drawCount: 130, percentage: 91 },
  { month: 'Fév 26', year: 2026, drawCount: 136, percentage: 95 },
  { month: 'Juin 26', year: 2026, drawCount: 142, percentage: 100 },
];

export const GAMES_CATALOG: { id: GameType; name: string; drawsCount: number; hours: string[] }[] = [
  { id: 'national', name: 'National CI', drawsCount: 710, hours: ['10h00', '19h00'] },
  { id: 'diamant', name: 'Loto Diamant', drawsCount: 680, hours: ['13h00', '19h00'] },
  { id: 'etoile', name: 'Loto Étoile', drawsCount: 420, hours: ['13h00'] },
  { id: 'espoir', name: 'Loto Espoir', drawsCount: 390, hours: ['10h00'] },
  { id: 'fortune', name: 'Loto Fortune', drawsCount: 360, hours: ['16h00'] },
  { id: 'bambou', name: 'Loto Bambou', drawsCount: 280, hours: ['19h00'] },
];

export const INITIAL_SYNC_LOGS = [
  { id: 1, time: '09:30:14 GMT', event: 'Réplication MySQL LONACI Master', status: 'Succès', latency: '34ms', records: '+4 tirages' },
  { id: 2, time: '06:00:02 GMT', event: 'Vérification cryptographique SHA-256', status: 'Intègre 100%', latency: '82ms', records: '2 840 tirages vérifiés' },
  { id: 3, time: 'Hier 19:30:22 GMT', event: 'Ingestion Tirage Soir (Bambou #2838)', status: 'Succès', latency: '29ms', records: '+1 tirage' },
  { id: 4, time: 'Hier 16:30:19 GMT', event: 'Ingestion Tirage Après-midi (Fortune #2837)', status: 'Succès', latency: '41ms', records: '+1 tirage' },
  { id: 5, time: 'Hier 13:30:08 GMT', event: 'Ingestion Tirage Midi (Étoile #2836)', status: 'Succès', latency: '31ms', records: '+1 tirage' },
];
