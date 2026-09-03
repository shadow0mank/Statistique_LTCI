import { useState, useMemo } from 'react';
import {
  Clock,
  Filter,
  Flame,
  Award,
  Download,
  Search,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Draw, DetectedHourInfo, HourlyNumberStat, FormulaWeights } from '../types';
import { computeHourlyStats } from '../data/lonaciEngine';
import LottoBall from '../components/LottoBall';

interface HourlyAnalysisViewProps {
  draws: Draw[];
  detectedHours: DetectedHourInfo[];
  weights: FormulaWeights;
  onOpenNumberDetail: (ballNumber: number) => void;
  onOpenCompare: (preselectedBalls: number[], hour: string) => void;
}

export default function HourlyAnalysisView({
  draws,
  detectedHours,
  weights,
  onOpenNumberDetail,
  onOpenCompare,
}: HourlyAnalysisViewProps) {
  // Default to first detected hour or 10:00
  const [selectedHour, setSelectedHour] = useState<string>(
    detectedHours.find((h) => h.hour === '10:00')?.hour || detectedHours[0]?.hour || '10:00'
  );
  const [periodDays, setPeriodDays] = useState<number>(730); // 24 months default
  const [filterHighScoreOnly, setFilterHighScoreOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Multi-selection for comparison
  const [selectedBallsToCompare, setSelectedBallsToCompare] = useState<number[]>([]);

  // Calculate hourly statistics for the selected hour and period
  const statsForHour: HourlyNumberStat[] = useMemo(() => {
    return computeHourlyStats(draws, selectedHour, periodDays, weights);
  }, [draws, selectedHour, periodDays, weights]);

  // Current hour details
  const currentHourInfo = detectedHours.find((h) => h.hour === selectedHour);
  const totalDrawsForHour = currentHourInfo?.drawCount || 0;

  // Filtered numbers
  const filteredNumbers = useMemo(() => {
    return statsForHour.filter((item) => {
      if (filterHighScoreOnly && item.score < 90) return false;
      if (searchQuery) {
        const q = searchQuery.trim();
        const numStr = item.number.toString();
        if (!numStr.includes(q)) return false;
      }
      return true;
    });
  }, [statsForHour, filterHighScoreOnly, searchQuery]);

  // High score numbers count
  const highScoreCount = statsForHour.filter((s) => s.score >= 90).length;
  const topBall = statsForHour[0];

  const toggleBallCompare = (num: number) => {
    if (selectedBallsToCompare.includes(num)) {
      setSelectedBallsToCompare((prev) => prev.filter((n) => n !== num));
    } else {
      if (selectedBallsToCompare.length >= 5) return;
      setSelectedBallsToCompare((prev) => [...prev, num]);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Rang', 'Numero', 'Heure', 'Score', 'Frequence_Pourcent', 'Sorties', 'Ecart_Actuel', 'Ecart_Max', 'Tendance'];
    const rows = filteredNumbers.map((s, idx) => [
      idx + 1,
      s.number,
      s.hour,
      s.score,
      s.frequencyPercent,
      s.appearances,
      s.currentGap,
      s.maxGap,
      s.trend,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analyse_horaire_${selectedHour.replace(':', 'h')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Header & Principle Explanation */}
      <div className="bg-[#171f33] p-4 sm:p-5 rounded-xl border border-[#222a3d] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#4edea3]" />
            <h2 className="font-sans text-lg text-[#dae2fd] font-bold">
              Analyse Statistique par Heure de Jeu
            </h2>
            <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
              Détection Dynamique Réelle
            </span>
          </div>
          <p className="font-sans text-xs text-[#bbcabf] mt-1 max-w-3xl">
            Chaque créneau horaire possède sa propre dynamique statistique. Les heures ci-dessous ont été
            automatiquement extraites de l'historique officiel LONACI.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] px-3.5 py-2 rounded-lg font-mono text-xs transition-colors border border-[#2d3449]"
        >
          <Download className="w-4 h-4 text-[#7bd0ff]" />
          <span>Exporter CSV ({selectedHour})</span>
        </button>
      </div>

      {/* Dynamic Hours Selector Bar (Directly from detectedHours) */}
      <div className="bg-[#131b2e] p-3 rounded-xl border border-[#222a3d] space-y-2 shadow-inner">
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-xs text-[#bbcabf] flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#ec6a06]" />
            Créneaux Horaires Détectés ({detectedHours.length} heures) :
          </span>
          <span className="text-[11px] font-mono text-[#86948a]">
            Sélectionnez une heure pour isoler ses statistiques
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {detectedHours.map((hInfo) => {
            const isSelected = selectedHour === hInfo.hour;
            return (
              <button
                key={hInfo.hour}
                onClick={() => setSelectedHour(hInfo.hour)}
                className={`flex flex-col items-center justify-center px-3.5 py-2 rounded-lg font-mono text-xs transition-all flex-shrink-0 border ${
                  isSelected
                    ? 'bg-[#10b981] text-[#003824] font-bold border-[#4edea3] shadow-md shadow-[#10b981]/25 scale-105'
                    : 'bg-[#171f33] text-[#dae2fd] border-[#222a3d] hover:border-[#4edea3]/50 hover:bg-[#222a3d]'
                }`}
              >
                <span className="text-sm font-bold tracking-tight">{hInfo.hour}</span>
                <span className={`text-[10px] ${isSelected ? 'text-[#00422b]' : 'text-[#86948a]'}`}>
                  {hInfo.drawCount} tirages
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Deck for Current Selected Hour */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d] shadow-sm">
          <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider block mb-1">
            Créneau Actif
          </span>
          <div className="font-mono text-xl text-[#dae2fd] font-bold flex items-baseline gap-2">
            <span>{selectedHour}</span>
            <span className="text-xs text-[#4edea3] font-normal">
              ({currentHourInfo?.slotName || 'Standard'})
            </span>
          </div>
          <div className="font-mono text-[11px] text-[#bbcabf] mt-1">
            {totalDrawsForHour} tirages historiques analysés
          </div>
        </div>

        <div className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d] shadow-sm">
          <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider block mb-1">
            Numéros Score ≥ 90/100
          </span>
          <div className="font-mono text-xl text-[#ffdbca] font-bold flex items-baseline gap-2">
            <span>{highScoreCount} numéros</span>
            <span className="text-xs text-[#ec6a06]">
              ({highScoreCount > 0 ? ((highScoreCount / 90) * 100).toFixed(0) : 0}%)
            </span>
          </div>
          <div className="font-mono text-[11px] text-[#bbcabf] mt-1">
            Seuil statistique élevé pour {selectedHour}
          </div>
        </div>

        <div className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d] shadow-sm">
          <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider block mb-1">
            Top Score Statistique
          </span>
          <div className="font-mono text-xl text-[#4edea3] font-bold flex items-baseline gap-2">
            <span>N° {topBall ? (topBall.number < 10 ? `0${topBall.number}` : topBall.number) : '--'}</span>
            <span className="text-xs text-[#dae2fd]">
              (Score {topBall?.score || 0}/100)
            </span>
          </div>
          <div className="font-mono text-[11px] text-[#bbcabf] mt-1">
            {topBall?.appearances || 0} sorties à {selectedHour} ({topBall?.frequencyPercent}%)
          </div>
        </div>

        <div className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d] shadow-sm">
          <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider block mb-1">
            Cadre de Non-Prédiction
          </span>
          <div className="font-mono text-sm text-[#ec6a06] font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#ec6a06]" />
            <span>Classement Historique</span>
          </div>
          <div className="font-sans text-[11px] text-[#bbcabf] mt-1">
            Aucune garantie de gain. Hasard intégral.
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-[#131b2e] p-3.5 rounded-xl border border-[#222a3d] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#bbcabf]" />
            <input
              type="text"
              placeholder="Rechercher un numéro (ex: 27)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#171f33] text-[#dae2fd] placeholder:text-[#bbcabf]/60 font-sans text-xs pl-9 pr-3 py-2 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3]"
            />
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#bbcabf]">
            <span>Période :</span>
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              className="bg-[#171f33] text-[#dae2fd] px-2.5 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none font-medium"
            >
              <option value={730}>24 mois (Recommandé)</option>
              <option value={365}>12 mois</option>
              <option value={180}>6 mois</option>
              <option value={90}>3 mois (90 jours)</option>
              <option value={30}>30 derniers jours</option>
              <option value={7}>7 derniers jours</option>
            </select>
          </div>

          {/* Filter Score >= 90 toggle */}
          <button
            onClick={() => setFilterHighScoreOnly(!filterHighScoreOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all border ${
              filterHighScoreOnly
                ? 'bg-[#ec6a06] text-white border-[#ffb690] shadow-md shadow-[#ec6a06]/20'
                : 'bg-[#171f33] text-[#bbcabf] border-[#222a3d] hover:text-[#dae2fd]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Scores ≥ 90/100 uniquement ({highScoreCount})</span>
          </button>
        </div>

        {/* Compare launcher button */}
        {selectedBallsToCompare.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#4edea3]">
              {selectedBallsToCompare.length} sélectionné(s) :
            </span>
            <button
              onClick={() => onOpenCompare(selectedBallsToCompare, selectedHour)}
              className="bg-[#10b981] hover:bg-[#4edea3] text-[#003824] px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Comparer à {selectedHour}</span>
            </button>
            <button
              onClick={() => setSelectedBallsToCompare([])}
              className="font-mono text-xs text-[#ec6a06] hover:underline"
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* Main Table: 90 Numbers for this Hour */}
      <div className="bg-[#171f33] rounded-xl border border-[#222a3d] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#131b2e] border-b border-[#222a3d] font-mono text-[11px] text-[#bbcabf] uppercase tracking-wider">
                <th className="py-3 px-4 text-center">Comp.</th>
                <th className="py-3 px-4">Rang</th>
                <th className="py-3 px-4">Numéro</th>
                <th className="py-3 px-4 text-center">Score ({selectedHour})</th>
                <th className="py-3 px-4 text-center">Fréquence (%)</th>
                <th className="py-3 px-4 text-center">Sorties / Tirages</th>
                <th className="py-3 px-4 text-center">Écart Actuel</th>
                <th className="py-3 px-4 text-center">Écart Max</th>
                <th className="py-3 px-4 text-center">Tendance</th>
                <th className="py-3 px-4 text-right">Fiche</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222a3d]/50 font-mono text-xs">
              {filteredNumbers.length > 0 ? (
                filteredNumbers.map((stat, index) => {
                  const isHighScore = stat.score >= 90;
                  const isChecked = selectedBallsToCompare.includes(stat.number);

                  return (
                    <tr
                      key={stat.number}
                      className={`hover:bg-[#222a3d]/60 transition-colors ${
                        isHighScore ? 'bg-[#ec6a06]/5' : ''
                      }`}
                    >
                      {/* Checkbox for comparison */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBallCompare(stat.number)}
                          className="rounded border-[#222a3d] text-[#10b981] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Rank */}
                      <td className="py-3 px-4 font-bold text-[#bbcabf]">
                        #{index + 1}
                      </td>

                      {/* Number Ball */}
                      <td className="py-3 px-4">
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => onOpenNumberDetail(stat.number)}
                        >
                          <LottoBall
                            number={stat.number}
                            size="sm"
                            variant={isHighScore ? 'amber' : stat.score >= 75 ? 'emerald' : 'neutral'}
                          />
                          <span className="font-bold text-[#dae2fd] hover:text-[#4edea3] transition-colors">
                            Numéro {stat.number < 10 ? `0${stat.number}` : stat.number}
                          </span>
                        </div>
                      </td>

                      {/* Statistical Score */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                              isHighScore
                                ? 'bg-[#ec6a06] text-white shadow-sm shadow-[#ec6a06]/30'
                                : stat.score >= 75
                                ? 'bg-[#10b981]/25 text-[#4edea3]'
                                : 'bg-[#222a3d] text-[#bbcabf]'
                            }`}
                          >
                            {stat.score} / 100
                          </span>
                          {isHighScore && (
                            <span className="font-sans text-[9px] text-[#ffb690] mt-0.5 font-bold uppercase">
                              Score ≥ 90
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Frequency at this hour */}
                      <td className="py-3 px-4 text-center font-bold text-[#dae2fd]">
                        {stat.frequencyPercent}%
                      </td>

                      {/* Appearances */}
                      <td className="py-3 px-4 text-center text-[#bbcabf]">
                        <span className="text-[#dae2fd] font-semibold">{stat.appearances}</span> / {stat.totalDrawsAtHour}
                      </td>

                      {/* Current Gap */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={
                            stat.currentGap <= 2
                              ? 'text-[#4edea3] font-bold'
                              : stat.currentGap >= 15
                              ? 'text-[#ec6a06] font-bold'
                              : 'text-[#dae2fd]'
                          }
                        >
                          {stat.currentGap} tirages
                        </span>
                      </td>

                      {/* Max Gap */}
                      <td className="py-3 px-4 text-center text-[#bbcabf]">
                        {stat.maxGap}
                      </td>

                      {/* Trend */}
                      <td className="py-3 px-4 text-center">
                        {stat.trend === 'up' && (
                          <span className="inline-flex items-center gap-1 text-[#4edea3] font-bold text-[11px]">
                            <TrendingUp className="w-3.5 h-3.5" /> En hausse
                          </span>
                        )}
                        {stat.trend === 'down' && (
                          <span className="inline-flex items-center gap-1 text-[#ec6a06] font-bold text-[11px]">
                            <TrendingDown className="w-3.5 h-3.5" /> En baisse
                          </span>
                        )}
                        {stat.trend === 'stable' && (
                          <span className="inline-flex items-center gap-1 text-[#bbcabf] text-[11px]">
                            <Minus className="w-3.5 h-3.5" /> Stable
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onOpenNumberDetail(stat.number)}
                          className="px-2.5 py-1 rounded bg-[#222a3d] hover:bg-[#10b981] text-[#bbcabf] hover:text-[#00422b] transition-colors text-xs font-semibold"
                        >
                          Détails &gt;
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#bbcabf]">
                    Aucun numéro ne correspond aux filtres actuels.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
