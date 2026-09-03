import { useState, useMemo } from 'react';
import { X, GitCompare, Clock, Plus, Trash2, TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react';
import { Draw, DetectedHourInfo, FormulaWeights } from '../types';
import { computeHourlyStats } from '../data/lonaciEngine';
import LottoBall from './LottoBall';

interface NumberComparisonModalProps {
  initialBalls: number[];
  initialHour?: string;
  draws: Draw[];
  detectedHours: DetectedHourInfo[];
  weights: FormulaWeights;
  onClose: () => void;
}

export default function NumberComparisonModal({
  initialBalls,
  initialHour,
  draws,
  detectedHours,
  weights,
  onClose,
}: NumberComparisonModalProps) {
  const [selectedHour, setSelectedHour] = useState<string>(
    initialHour || detectedHours[0]?.hour || '10:00'
  );
  const [balls, setBalls] = useState<number[]>(
    initialBalls.length >= 2 ? initialBalls.slice(0, 5) : [initialBalls[0] || 7, 27, 44]
  );
  const [newBallInput, setNewBallInput] = useState<string>('');

  // Calculate hourly statistics for all numbers at this hour
  const statsForHour = useMemo(() => {
    return computeHourlyStats(draws, selectedHour, 730, weights);
  }, [draws, selectedHour, weights]);

  // Extract stats for chosen numbers
  const comparedStats = useMemo(() => {
    return balls.map((num) => {
      const stat = statsForHour.find((s) => s.number === num);
      return (
        stat || {
          number: num,
          hour: selectedHour,
          appearances: 0,
          totalDrawsAtHour: 0,
          frequencyPercent: 0,
          currentGap: 0,
          maxGap: 0,
          recentAppearances30d: 0,
          trend: 'stable' as const,
          score: 50,
          isHighScore: false,
        }
      );
    });
  }, [balls, statsForHour, selectedHour]);

  const handleAddBall = () => {
    const val = parseInt(newBallInput.trim(), 10);
    if (!isNaN(val) && val >= 1 && val <= 90 && !balls.includes(val) && balls.length < 5) {
      setBalls([...balls, val]);
      setNewBallInput('');
    }
  };

  const handleRemoveBall = (num: number) => {
    if (balls.length > 2) {
      setBalls(balls.filter((n) => n !== num));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#171f33] border border-[#222a3d] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#131b2e] border-b border-[#222a3d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#4edea3] border border-[#10b981]/40">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans text-base sm:text-lg text-[#dae2fd] font-bold">
                Comparateur de Numéros par Heure de Jeu
              </h3>
              <p className="font-sans text-xs text-[#bbcabf]">
                Comparez 2 à 5 numéros côte à côte pour un créneau horaire précis
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

        {/* Hour & Ball controls */}
        <div className="p-4 bg-[#131b2e]/60 border-b border-[#222a3d] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          {/* Hour selection */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ec6a06]" />
            <span className="text-[#bbcabf] font-bold">Heure d'analyse :</span>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className="bg-[#171f33] text-[#4edea3] px-3 py-1.5 rounded-lg border border-[#222a3d] font-bold"
            >
              {detectedHours.map((h) => (
                <option key={h.hour} value={h.hour}>
                  {h.hour} ({h.drawCount} tirages - {h.slotName})
                </option>
              ))}
            </select>
          </div>

          {/* Add ball form */}
          {balls.length < 5 && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={90}
                placeholder="Numéro (1-90)"
                value={newBallInput}
                onChange={(e) => setNewBallInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBall()}
                className="w-28 bg-[#171f33] text-[#dae2fd] px-3 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none"
              />
              <button
                onClick={handleAddBall}
                className="bg-[#222a3d] hover:bg-[#10b981] hover:text-[#003824] text-[#dae2fd] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Comparison Grid */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          <div
            className={`grid gap-4 ${
              balls.length === 2
                ? 'grid-cols-2'
                : balls.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : balls.length === 4
                ? 'grid-cols-2 md:grid-cols-4'
                : 'grid-cols-2 md:grid-cols-5'
            }`}
          >
            {comparedStats.map((stat) => {
              const isHighScore = stat.score >= 90;

              return (
                <div
                  key={stat.number}
                  className={`bg-[#131b2e] rounded-xl border p-4 flex flex-col justify-between space-y-4 relative ${
                    isHighScore ? 'border-[#ec6a06]/70 shadow-lg shadow-[#ec6a06]/10' : 'border-[#222a3d]'
                  }`}
                >
                  {/* Delete button */}
                  {balls.length > 2 && (
                    <button
                      onClick={() => handleRemoveBall(stat.number)}
                      title="Retirer de la comparaison"
                      className="absolute top-2.5 right-2.5 p-1 text-[#bbcabf] hover:text-[#ec6a06] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Ball visual */}
                  <div className="flex flex-col items-center text-center pt-2">
                    <LottoBall
                      number={stat.number}
                      size="lg"
                      variant={isHighScore ? 'amber' : stat.score >= 75 ? 'emerald' : 'neutral'}
                    />
                    <span className="font-sans font-bold text-base text-[#dae2fd] mt-2">
                      Numéro {stat.number < 10 ? `0${stat.number}` : stat.number}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full mt-1 ${
                        isHighScore
                          ? 'bg-[#ec6a06] text-white'
                          : 'bg-[#10b981]/20 text-[#4edea3]'
                      }`}
                    >
                      Score : {stat.score} / 100
                    </span>
                  </div>

                  {/* Metrics list */}
                  <div className="space-y-2.5 font-mono text-xs border-t border-[#222a3d] pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#bbcabf]">Fréquence ({selectedHour}) :</span>
                      <span className="text-[#dae2fd] font-bold">{stat.frequencyPercent}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#bbcabf]">Sorties à {selectedHour} :</span>
                      <span className="text-[#dae2fd] font-semibold">
                        {stat.appearances} / {stat.totalDrawsAtHour}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#bbcabf]">Écart actuel :</span>
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
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#bbcabf]">Écart max historique :</span>
                      <span className="text-[#dae2fd]">{stat.maxGap}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#bbcabf]">Tendance récente :</span>
                      <span>
                        {stat.trend === 'up' && (
                          <span className="text-[#4edea3] font-bold flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" /> En hausse
                          </span>
                        )}
                        {stat.trend === 'down' && (
                          <span className="text-[#ec6a06] font-bold flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5" /> En baisse
                          </span>
                        )}
                        {stat.trend === 'stable' && (
                          <span className="text-[#bbcabf] flex items-center gap-1">
                            <Minus className="w-3.5 h-3.5" /> Stable
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* High score badge */}
                  {isHighScore && (
                    <div className="bg-[#ec6a06]/15 border border-[#ec6a06]/30 p-2 rounded-lg text-center font-mono text-[11px] text-[#ffdbca] flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#ec6a06]" />
                      <span>Score élevé (≥ 90) pour {selectedHour}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#131b2e] border-t border-[#222a3d] flex items-center justify-between">
          <span className="font-sans text-xs text-[#bbcabf]">
            Comparaison calculée sur l'historique complet pour le créneau de {selectedHour}.
          </span>
          <button
            onClick={onClose}
            className="bg-[#10b981] hover:bg-[#4edea3] text-[#003824] px-4 py-2 rounded-lg font-mono text-xs font-bold transition-colors"
          >
            Fermer le comparateur
          </button>
        </div>
      </div>
    </div>
  );
}
