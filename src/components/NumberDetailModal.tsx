import { useMemo } from 'react';
import { X, Clock, BarChart2, Flame, Award, TrendingUp, Calendar } from 'lucide-react';
import { Draw } from '../types';
import { getNumberHourlyProfile } from '../data/lonaciEngine';
import LottoBall from './LottoBall';

interface NumberDetailModalProps {
  ballNumber: number | null;
  draws: Draw[];
  onClose: () => void;
  onCompareWith: (ballNumber: number) => void;
}

export default function NumberDetailModal({
  ballNumber,
  draws,
  onClose,
  onCompareWith,
}: NumberDetailModalProps) {
  if (ballNumber === null) return null;

  // Compute profile across all detected hours
  const hourlyProfile = useMemo(() => {
    return getNumberHourlyProfile(draws, ballNumber);
  }, [draws, ballNumber]);

  // Total appearances
  const totalHits = useMemo(() => {
    return draws.filter((d) => d.balls.includes(ballNumber)).length;
  }, [draws, ballNumber]);

  const globalFreq = draws.length > 0 ? ((totalHits / draws.length) * 100).toFixed(2) : '0';

  // Find max percentage for visual bar scaling
  const maxHourlyPct = Math.max(...hourlyProfile.map((p) => p.percentage), 1);

  // Best hour
  const bestHourProfile = [...hourlyProfile].sort((a, b) => b.percentage - a.percentage)[0];

  // Recent draws where this number appeared
  const recentAppearances = useMemo(() => {
    return draws.filter((d) => d.balls.includes(ballNumber)).slice(0, 5);
  }, [draws, ballNumber]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#171f33] border border-[#222a3d] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#131b2e] border-b border-[#222a3d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LottoBall number={ballNumber} size="lg" variant="amber" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-lg sm:text-xl text-[#dae2fd] font-bold">
                  Fiche Détaillée du Numéro {ballNumber < 10 ? `0${ballNumber}` : ballNumber}
                </h3>
                <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {totalHits} sorties
                </span>
              </div>
              <p className="font-sans text-xs text-[#bbcabf]">
                Profil statistique et distribution sur l'ensemble des créneaux horaires
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#bbcabf] hover:text-[#dae2fd] hover:bg-[#222a3d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Top KPI row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#131b2e] p-3 rounded-xl border border-[#222a3d]">
              <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider block mb-1">
                Fréquence Globale
              </span>
              <div className="font-mono text-lg text-[#4edea3] font-bold">
                {globalFreq}%
              </div>
              <span className="font-mono text-[10px] text-[#bbcabf]">
                Sur {draws.length} tirages
              </span>
            </div>

            <div className="bg-[#131b2e] p-3 rounded-xl border border-[#222a3d]">
              <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider block mb-1">
                Meilleur Créneau
              </span>
              <div className="font-mono text-lg text-[#ffdbca] font-bold">
                {bestHourProfile ? bestHourProfile.hour : '--:--'}
              </div>
              <span className="font-mono text-[10px] text-[#ec6a06]">
                {bestHourProfile?.percentage}% ({bestHourProfile?.appearances} sorties)
              </span>
            </div>

            <div className="bg-[#131b2e] p-3 rounded-xl border border-[#222a3d]">
              <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider block mb-1">
                Comportement
              </span>
              <div className="font-mono text-sm text-[#7bd0ff] font-bold flex items-center gap-1">
                <Flame className="w-4 h-4 text-[#ec6a06]" />
                <span>Actif</span>
              </div>
              <span className="font-mono text-[10px] text-[#bbcabf]">
                Régulier sur 24M
              </span>
            </div>
          </div>

          {/* Hourly Distribution Bar Chart */}
          <div className="bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#dae2fd] font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#ec6a06]" />
                Répartition des Sorties par Heure Détectée :
              </span>
              <span className="font-mono text-[11px] text-[#86948a]">
                Pourcentage de présence à chaque créneau
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {hourlyProfile.map((p) => {
                const barWidth = Math.max(4, Math.round((p.percentage / maxHourlyPct) * 100));
                const isBest = p.hour === bestHourProfile?.hour;

                return (
                  <div key={p.hour} className="flex items-center gap-2.5 font-mono text-xs">
                    <span className="w-12 text-[#dae2fd] font-bold">{p.hour}</span>
                    <div className="flex-1 bg-[#060e20] h-5 rounded-md overflow-hidden p-0.5 border border-[#222a3d]">
                      <div
                        className={`h-full rounded transition-all flex items-center justify-end pr-2 text-[10px] font-bold ${
                          isBest
                            ? 'bg-gradient-to-r from-[#10b981] to-[#4edea3] text-[#003824]'
                            : 'bg-[#222a3d] text-[#bbcabf]'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      >
                        {p.appearances > 0 && `${p.appearances}`}
                      </div>
                    </div>
                    <span
                      className={`w-14 text-right font-bold ${
                        isBest ? 'text-[#4edea3]' : 'text-[#bbcabf]'
                      }`}
                    >
                      {p.percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5 Dernières Apparitions */}
          <div className="bg-[#131b2e] p-3.5 rounded-xl border border-[#222a3d] space-y-2">
            <span className="font-mono text-xs text-[#dae2fd] font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#7bd0ff]" />
              Dernières Apparitions Officielles :
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              {recentAppearances.map((d) => (
                <div
                  key={d.id}
                  className="bg-[#171f33] p-2.5 rounded-lg border border-[#222a3d] flex items-center justify-between"
                >
                  <div>
                    <span className="text-[#dae2fd] font-bold">{d.date}</span>
                    <span className="text-[#bbcabf] ml-1.5">({d.time})</span>
                    <p className="text-[10px] text-[#86948a]">{d.gameName}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {d.balls.map((b, i) => (
                      <span
                        key={i}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          b === ballNumber
                            ? 'bg-[#10b981] text-[#003824]'
                            : 'bg-[#222a3d] text-[#dae2fd]'
                        }`}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#131b2e] border-t border-[#222a3d] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onCompareWith(ballNumber);
            }}
            className="flex items-center gap-2 bg-[#222a3d] hover:bg-[#2d3449] text-[#4edea3] px-3.5 py-2 rounded-lg font-mono text-xs transition-colors border border-[#2d3449]"
          >
            <BarChart2 className="w-4 h-4 text-[#4edea3]" />
            <span>Comparer ce numéro...</span>
          </button>

          <button
            onClick={onClose}
            className="bg-[#10b981] hover:bg-[#4edea3] text-[#003824] px-4 py-2 rounded-lg font-mono text-xs font-bold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
