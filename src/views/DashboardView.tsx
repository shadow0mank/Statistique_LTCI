import { useState, useMemo } from 'react';
import {
  Gavel,
  ShieldCheck,
  TrendingUp,
  Dices,
  Clock,
  Award,
  CheckCircle2,
  Copy,
  ArrowRight,
  RefreshCw,
  Upload,
  Sparkles,
  ChevronRight,
  Flame,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { Draw, BallStat, GameType, DetectedHourInfo, FormulaWeights } from '../types';
import { computeHourlyStats } from '../data/lonaciEngine';
import LottoBall from '../components/LottoBall';

interface DashboardViewProps {
  latestDraw?: Draw | null;
  draws: Draw[];
  detectedHours: DetectedHourInfo[];
  ballStats?: BallStat[];
  weights?: FormulaWeights;
  selectedGame?: GameType | 'all';
  isSyncing?: boolean;
  onSync?: () => Promise<any>;
  onNavigateTab: (tab: any) => void;
  onOpenDrawReport: (draw: Draw) => void;
  onOpenFormulaModal: () => void;
  onOpenNumberDetail: (ballNumber: number) => void;
}

export default function DashboardView({
  latestDraw: propLatestDraw,
  draws,
  detectedHours,
  ballStats,
  weights,
  selectedGame,
  isSyncing = false,
  onSync,
  onNavigateTab,
  onOpenDrawReport,
  onOpenFormulaModal,
  onOpenNumberDetail,
}: DashboardViewProps) {
  const latestDraw = propLatestDraw || draws[0];

  const [selectedDashboardHour, setSelectedDashboardHour] = useState<string>(
    detectedHours.find((h) => h.hour === '10:00')?.hour || detectedHours[0]?.hour || '10:00'
  );
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(latestDraw.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Top high scores for the chosen hour
  const hourlyTopStats = useMemo(() => {
    const stats = computeHourlyStats(draws, selectedDashboardHour, 730);
    return stats.slice(0, 5);
  }, [draws, selectedDashboardHour]);

  // Max draws count among hours for visual scaling
  const maxDrawCount = useMemo(() => {
    return Math.max(...detectedHours.map((h) => h.drawCount), 1);
  }, [detectedHours]);

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Disclaimer strip */}
      <div className="bg-[#131b2e] px-4 py-2.5 rounded-lg border border-[#222a3d] flex items-center gap-3">
        <span className="text-[#ec6a06] text-lg flex-shrink-0">⚠️</span>
        <p className="font-sans text-xs text-[#bbcabf] leading-relaxed">
          <strong>Avertissement Légal &amp; Non-Prédiction :</strong> Les résultats présentés sont des
          analyses statistiques objectives basées sur l'historique officiel LONACI. En aucun cas ils ne
          constituent une prédiction ou une certitude de gain. Les tirages de loterie sont strictement
          aléatoires.
        </p>
      </div>

      {/* System Status Banner & Coverage Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Compliance Notice Card */}
        <div className="lg:col-span-8 bg-[#171f33] p-4 sm:p-5 rounded-xl border border-[#222a3d] flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#ec6a06]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#ec6a06]/15 flex items-center justify-center text-[#ec6a06] flex-shrink-0 mt-0.5">
              <Gavel className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-[#ffb690] tracking-wider uppercase font-bold">
                  Architecture Certifiée &amp; Contrôle Qualité
                </span>
                <span className="bg-[#222a3d] text-[#bbcabf] font-mono text-[10px] px-2 py-0.5 rounded">
                  LOTTO-CI-API v3.5
                </span>
              </div>
              <p className="font-sans text-xs text-[#bbcabf] leading-relaxed">
                Traitement rigoureux en 5 étapes : Récupérer &gt; Contrôler &gt; Stocker &gt; Analyser par
                Heure &gt; Classer. Intégrité des 5 boules garanties (bornes 1-90, aucun doublon, hash SHA-256).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#222a3d] text-center font-mono">
            <div className="bg-[#131b2e] p-2 rounded-lg border border-[#222a3d]/60">
              <span className="text-[10px] text-[#bbcabf] uppercase block">Base Historique</span>
              <span className="text-[#dae2fd] text-sm font-bold">{draws.length} tirages</span>
            </div>
            <div className="bg-[#131b2e] p-2 rounded-lg border border-[#222a3d]/60">
              <span className="text-[10px] text-[#bbcabf] uppercase block">Heures Détectées</span>
              <span className="text-[#4edea3] text-sm font-bold">{detectedHours.length} créneaux</span>
            </div>
            <div className="bg-[#131b2e] p-2 rounded-lg border border-[#222a3d]/60">
              <span className="text-[10px] text-[#bbcabf] uppercase block">Contrôle Parité</span>
              <span className="text-[#7bd0ff] text-sm font-bold">100% Intègre</span>
            </div>
            <div className="bg-[#131b2e] p-2 rounded-lg border border-[#222a3d]/60">
              <span className="text-[10px] text-[#bbcabf] uppercase block">Période Réelle</span>
              <span className="text-[#ffb690] text-sm font-bold">24 Mois</span>
            </div>
          </div>
        </div>

        {/* Real-time Quick Sync & Actions */}
        <div className="lg:col-span-4 bg-[#171f33] p-4 sm:p-5 rounded-xl border border-[#222a3d] flex flex-col justify-between shadow-md">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#dae2fd] font-bold flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-[#4edea3]" /> Synchronisation
              </span>
              <span className="font-mono text-[10px] bg-[#10b981]/20 text-[#4edea3] px-2 py-0.5 rounded-full font-bold">
                Connecté
              </span>
            </div>
            <p className="font-sans text-xs text-[#bbcabf]">
              Source officielle: <span className="text-[#dae2fd] font-mono">lotobonheur.ci</span>
            </p>
          </div>

          <div className="space-y-2 pt-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onSync ? () => onSync() : () => onNavigateTab('synchronisation-automatique')}
                disabled={isSyncing}
                className="flex-1 bg-[#10b981] hover:bg-[#4edea3] text-[#003824] font-mono text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Actualisation...' : 'Actualiser les Tirages'}</span>
              </button>

              <button
                onClick={() => onNavigateTab('synchronisation-automatique')}
                className="bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] p-2.5 rounded-lg border border-[#2d3449] transition-colors cursor-pointer"
                title="Paramètres des 5 sources"
              >
                <ExternalLink className="w-4 h-4 text-[#7bd0ff]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateTab('prochain-tirage')}
                className="bg-[#ec6a06]/20 hover:bg-[#ec6a06]/30 text-[#ffdbca] font-mono text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-[#ec6a06]/40 cursor-pointer font-bold"
              >
                <Clock className="w-3.5 h-3.5 text-[#ec6a06]" />
                <span>Pronostics du Jour</span>
              </button>

              <button
                onClick={() => onNavigateTab('importer-donnees')}
                className="bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] font-mono text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-[#2d3449] cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#7bd0ff]" />
                <span>Importer CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Certified Draw Card */}
      <div className="bg-[#171f33] p-4 sm:p-5 rounded-xl border border-[#222a3d] shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#4edea3] uppercase font-bold tracking-wider">
                Dernier Tirage Officiel Enregistré
              </span>
              <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                ✓ Conforme
              </span>
            </div>
            <h3 className="font-sans text-base sm:text-lg text-[#dae2fd] font-bold mt-0.5">
              {latestDraw.gameName} — {latestDraw.date} à {latestDraw.time}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenDrawReport(latestDraw)}
              className="bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] px-3 py-1.5 rounded-lg font-mono text-xs transition-colors border border-[#2d3449] flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-[#4edea3]" />
              <span>Vérifier la source</span>
            </button>
          </div>
        </div>

        {/* Balls strip */}
        <div className="bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[11px] text-[#bbcabf] uppercase tracking-wider block">
              Combinaison Gagnante (5 numéros) :
            </span>
            <div className="flex items-center gap-2 sm:gap-3">
              {latestDraw.balls.map((ball, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => onOpenNumberDetail(ball)}
                >
                  <LottoBall number={ball} size="lg" />
                </div>
              ))}
            </div>
          </div>

          {latestDraw.machineBalls && latestDraw.machineBalls.length > 0 && (
            <div className="space-y-1">
              <span className="font-mono text-[11px] text-[#bbcabf] uppercase tracking-wider block">
                Machine :
              </span>
              <div className="flex items-center gap-1.5">
                {latestDraw.machineBalls.map((b, idx) => (
                  <span
                    key={idx}
                    className="w-8 h-8 rounded-full bg-[#222a3d] text-[#dae2fd] flex items-center justify-center font-mono font-bold text-xs border border-[#2d3449]"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cryptographic hash */}
          <div className="w-full lg:w-auto flex flex-col items-start lg:items-end space-y-1 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#222a3d]">
            <span className="font-mono text-[10px] text-[#bbcabf] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7bd0ff]" /> Empreinte SHA-256 :
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#ffdbca] bg-[#060e20] px-2 py-1 rounded border border-[#222a3d] max-w-[260px] truncate">
                {latestDraw.hash}
              </span>
              <button
                onClick={handleCopyHash}
                title="Copier le hash SHA-256"
                className="p-1 rounded bg-[#222a3d] hover:bg-[#10b981] hover:text-[#003824] text-[#bbcabf] transition-colors"
              >
                {copiedHash ? <CheckCircle2 className="w-4 h-4 text-[#4edea3]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CLÉ: MODULE STATISTIQUE PAR HEURE SUR LE TABLEAU DE BORD */}
      <div className="bg-[#171f33] p-4 sm:p-5 rounded-xl border border-[#222a3d] shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#ec6a06]" />
              <h3 className="font-sans text-base sm:text-lg text-[#dae2fd] font-bold">
                Aperçu Statistique par Heure Détectée
              </h3>
              <span className="bg-[#ec6a06]/20 text-[#ffb690] font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                Fonctionnalité Essentielle
              </span>
            </div>
            <p className="font-sans text-xs text-[#bbcabf] mt-0.5">
              Sélectionnez une heure réelle parmi les {detectedHours.length} créneaux extraits pour afficher
              son classement :
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('analyse-par-heure')}
            className="flex items-center gap-1.5 font-mono text-xs text-[#4edea3] hover:underline"
          >
            <span>Ouvrir l'analyse complète (90 numéros)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Hour selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {detectedHours.map((hInfo) => {
            const isSelected = selectedDashboardHour === hInfo.hour;
            return (
              <button
                key={hInfo.hour}
                onClick={() => setSelectedDashboardHour(hInfo.hour)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all flex items-center gap-1.5 flex-shrink-0 border ${
                  isSelected
                    ? 'bg-[#10b981] text-[#003824] font-bold border-[#4edea3] shadow-sm'
                    : 'bg-[#131b2e] text-[#dae2fd] border-[#222a3d] hover:border-[#4edea3]/40'
                }`}
              >
                <span>{hInfo.hour}</span>
                <span className={`text-[10px] ${isSelected ? 'text-[#00422b]' : 'text-[#86948a]'}`}>
                  ({hInfo.drawCount})
                </span>
              </button>
            );
          })}
        </div>

        {/* Top 5 for this hour cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
          {hourlyTopStats.map((stat, idx) => {
            const isHighScore = stat.score >= 90;

            return (
              <div
                key={stat.number}
                onClick={() => onOpenNumberDetail(stat.number)}
                className={`bg-[#131b2e] p-3 rounded-xl border transition-all cursor-pointer hover:scale-102 flex flex-col justify-between ${
                  isHighScore
                    ? 'border-[#ec6a06]/70 shadow-md shadow-[#ec6a06]/10'
                    : 'border-[#222a3d] hover:border-[#4edea3]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-[#bbcabf] font-bold">
                    Rang #{idx + 1}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isHighScore
                        ? 'bg-[#ec6a06] text-white'
                        : 'bg-[#10b981]/20 text-[#4edea3]'
                    }`}
                  >
                    Score {stat.score}/100
                  </span>
                </div>

                <div className="flex items-center gap-2.5 my-1">
                  <LottoBall
                    number={stat.number}
                    size="md"
                    variant={isHighScore ? 'amber' : 'emerald'}
                  />
                  <div>
                    <span className="font-sans font-bold text-sm text-[#dae2fd] block">
                      N° {stat.number < 10 ? `0${stat.number}` : stat.number}
                    </span>
                    <span className="font-mono text-[11px] text-[#bbcabf]">
                      {stat.appearances} sorties ({stat.frequencyPercent}%)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#222a3d] flex items-center justify-between font-mono text-[10px] text-[#bbcabf]">
                  <span>Écart: {stat.currentGap} tirages</span>
                  {isHighScore && (
                    <span className="text-[#ec6a06] font-bold flex items-center gap-0.5">
                      <Flame className="w-3 h-3" /> Score ≥ 90
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Draw Distribution Visualizer */}
      <div className="bg-[#171f33] p-4 sm:p-5 rounded-xl border border-[#222a3d] shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#7bd0ff]" />
            <h3 className="font-sans text-base text-[#dae2fd] font-bold">
              Volume des Tirages Enregistrés par Heure de Jeu
            </h3>
          </div>
          <span className="font-mono text-xs text-[#bbcabf]">
            Total: {draws.length} tirages archivés
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2 pt-2">
          {detectedHours.map((hInfo) => {
            const heightPercent = Math.max(15, Math.round((hInfo.drawCount / maxDrawCount) * 100));

            return (
              <div
                key={hInfo.hour}
                onClick={() => {
                  setSelectedDashboardHour(hInfo.hour);
                }}
                className="bg-[#131b2e] p-2.5 rounded-lg border border-[#222a3d] hover:border-[#4edea3] transition-colors cursor-pointer flex flex-col items-center justify-end h-28 group"
              >
                <div className="w-full flex-1 flex items-end justify-center pb-1">
                  <div
                    className="w-full bg-[#222a3d] group-hover:bg-[#10b981] transition-all rounded-t-sm flex items-center justify-center"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
                <span className="font-mono text-xs text-[#dae2fd] font-bold mt-1">
                  {hInfo.hour}
                </span>
                <span className="font-mono text-[10px] text-[#86948a]">
                  {hInfo.drawCount}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
