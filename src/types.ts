export type GameType =
  | 'national'
  | 'diamant'
  | 'etoile'
  | 'espoir'
  | 'fortune'
  | 'bambou'
  | 'kado'
  | 'privilege'
  | 'monni'
  | 'afterwork'
  | 'digital'
  | 'all';

export type DrawStatus = 'CONFORME' | 'A_VERIFIER' | 'DUPLICATE' | 'ERREUR';

export interface Draw {
  id: string;
  drawNumber: number;
  game: string;
  gameName: string;
  date: string; // e.g. "03/09/2026" or ISO
  time: string; // e.g. "10:00"
  machineId: string;
  hash: string;
  balls: [number, number, number, number, number];
  machineBalls?: number[];
  sum: number;
  evenCount: number;
  oddCount: number;
  maxGap: number;
  source: string;
  sourceUrl: string;
  retrievedAt: string;
  status: DrawStatus;
  isVerified: boolean;
  notes?: string;
}

export interface DetectedHourInfo {
  hour: string; // e.g. "10:00"
  drawCount: number;
  firstSeen: string;
  lastSeen: string;
  slotName?: string;
  status: 'active' | 'infrequent' | 'historical';
}

export interface BallStat {
  number: number;
  score: number; // 0-100
  rank: number;
  appearances24M: number;
  frequencyPercent: number;
  hourlyFrequencyPercent: number;
  currentGap: number; // draws since last appearance
  maxHistoricalGap: number;
  status: 'hot' | 'normal' | 'cold';
  recentTrend: 'up' | 'stable' | 'down';
  hourlyPreference: string; // e.g. "10:00" or "16:00"
}

export interface HourlyNumberStat {
  number: number;
  hour: string;
  appearances: number;
  totalDrawsAtHour: number;
  frequencyPercent: number;
  currentGap: number;
  maxGap: number;
  recentAppearances30d: number;
  trend: 'up' | 'stable' | 'down';
  score: number; // 0-100 calculated specifically for this hour
  isHighScore: boolean; // score >= 90
  lastAppearanceDate?: string;
}

export interface FormulaWeights {
  history24M: number; // e.g. 30%
  recentTrend: number; // e.g. 20%
  gap90d: number; // e.g. 15%
  stability6M: number; // e.g. 15%
  hourlyFreq: number; // e.g. 20%
}

export interface SyncLog {
  id: string;
  timestamp: string;
  source: string;
  totalFound: number;
  newImported: number;
  duplicates: number;
  errors: number;
  toVerify: number;
  durationMs: number;
  detectedHoursCount: number;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  details: string;
}

export interface ImportPreviewRow {
  date: string;
  hour: string;
  game: string;
  balls: number[];
  machineBalls?: number[];
  status: 'VALID' | 'DUPLICATE' | 'INVALID_RANGE' | 'INVALID_COUNT';
  errorReason?: string;
}

export interface ImportValidationResult {
  fileName: string;
  fileSize: number;
  totalRows: number;
  validRows: number;
  duplicateRows: number;
  errorRows: number;
  detectedHours: string[];
  previewRows: ImportPreviewRow[];
}

export interface MonthlyVolume {
  month: string;
  year?: number;
  drawCount?: number;
  drawsCount?: number;
  percentage?: number;
  averageSum?: number;
}

export type SourceType =
  | 'official_portal'
  | 'ussd_gateway'
  | 'gazette_archive'
  | 'cedeao_hub'
  | 'custom_api';

export interface DataSource {
  id: string;
  name: string;
  category: SourceType;
  url: string;
  status: 'ONLINE' | 'STANDBY' | 'SYNCING' | 'ERROR';
  lastSync: string;
  totalRecords: number;
  latencyMs: number;
  reliabilityPercent: number;
  isPrimary: boolean;
  description: string;
  syncFrequency: string; // e.g. "Temps Réel", "Chaque Heure", "Quotidien"
  protocol: 'REST API' | 'USSD Gateway' | 'Web Scraping' | 'Flux Certifié';
}

export interface DailyHourPrediction {
  hour: string; // e.g. "10:00"
  slotName: string; // e.g. "Matinée - Loto Diamant"
  gameName: string; // e.g. "Loto Diamant"
  status: 'COMPLETED' | 'LIVE' | 'UPCOMING';
  drawDate: string; // e.g. "04/09/2026"
  banker: number; // Le numéro favori / banker n°1
  bankerScore: number; // Score statistique (ex: 95)
  bankerGap: number; // Écart actuel
  twoSure: [number, number]; // Les 2 numéros les plus probables ensemble
  twoSureScore: number;
  top5: number[]; // Les 5 numéros recommandés
  machinePicks: number[]; // 5 numéros machine recommandés
  confidence: number; // Indice global 0-100%
  expectedSumRange: [number, number];
  frequentPairs: [number, number][];
  actualDraw?: Draw; // Si le tirage a déjà eu lieu dans la base
  hitCount?: number; // Nombre de numéros gagnés si tirage terminé
  bankerHit?: boolean;
}

export interface DailyPredictionDay {
  date: string; // e.g. "04/09/2026"
  isoDate: string; // e.g. "2026-09-04"
  dayName: string; // e.g. "Vendredi"
  isToday: boolean;
  slots: DailyHourPrediction[];
}

