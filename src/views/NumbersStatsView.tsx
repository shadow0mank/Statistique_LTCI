import { useState, useMemo } from 'react';
import { BarChart3, Flame, Snowflake, TrendingUp, Clock, Info, Check, Filter } from 'lucide-react';
import { BallStat } from '../types';
import LottoBall from '../components/LottoBall';

interface NumbersStatsViewProps {
  ballStats: BallStat[];
  onOpenNumberDetail: (ballNumber: number) => void;
}

export default function NumbersStatsView({ ballStats, onOpenNumberDetail }: NumbersStatsViewProps) {
  const [filterType, setFilterType] = useState<
    'all' | 'hot' | 'normal' | 'cold' | 'even' | 'odd'
  >('all');
  const [selectedNumber, setSelectedNumber] = useState<number>(27);

  const selectedStat = useMemo(() => {
    return ballStats.find((b) => b.number === selectedNumber) || ballStats[0];
  }, [ballStats, selectedNumber]);

  const filteredBalls = useMemo(() => {
    return ballStats.filter((b) => {
      if (filterType === 'hot') return b.status === 'hot';
      if (filterType === 'cold') return b.status === 'cold';
      if (filterType === 'normal') return b.status === 'normal';
      if (filterType === 'even') return b.number % 2 === 0;
      if (filterType === 'odd') return b.number % 2 !== 0;
      return true;
    });
  }, [ballStats, filterType]);

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#171f33] p-4 sm:p-5 rounded-xl border border-[#222a3d]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#4edea3]" />
            <h2 className="font-sans text-lg text-[#dae2fd] font-bold">
              Matrice Complète des 90 Numéros
            </h2>
            <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
              90 Numéros Actifs
            </span>
          </div>
          <p className="font-sans text-xs text-[#bbcabf] mt-1">
            Indice de fréquence, écarts courants et probabilités empiriques sur l'horizon 24M LONACI.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#131b2e] p-1 rounded-lg border border-[#222a3d]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded font-mono text-xs transition-colors ${
              filterType === 'all'
                ? 'bg-[#10b981] text-[#00422b] font-bold'
                : 'text-[#bbcabf] hover:text-[#dae2fd]'
            }`}
          >
            Tous (90)
          </button>
          <button
            onClick={() => setFilterType('hot')}
            className={`px-2.5 py-1 rounded font-mono text-xs transition-colors ${
              filterType === 'hot'
                ? 'bg-[#ec6a06] text-white font-bold'
                : 'text-[#bbcabf] hover:text-[#dae2fd]'
            }`}
          >
            Chauds
          </button>
          <button
            onClick={() => setFilterType('cold')}
            className={`px-2.5 py-1 rounded font-mono text-xs transition-colors ${
              filterType === 'cold'
                ? 'bg-[#19aee8] text-[#060e20] font-bold'
                : 'text-[#bbcabf] hover:text-[#dae2fd]'
            }`}
          >
            Froids
          </button>
          <button
            onClick={() => setFilterType('even')}
            className={`px-2.5 py-1 rounded font-mono text-xs transition-colors ${
              filterType === 'even'
                ? 'bg-[#222a3d] text-[#dae2fd] font-bold'
                : 'text-[#bbcabf] hover:text-[#dae2fd]'
            }`}
          >
            Pairs
          </button>
          <button
            onClick={() => setFilterType('odd')}
            className={`px-2.5 py-1 rounded font-mono text-xs transition-colors ${
              filterType === 'odd'
                ? 'bg-[#222a3d] text-[#dae2fd] font-bold'
                : 'text-[#bbcabf] hover:text-[#dae2fd]'
            }`}
          >
            Impairs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Numbers Grid (Left) */}
        <div className="lg:col-span-8 bg-[#171f33] p-4 sm:p-5 rounded-xl border border-[#222a3d] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#bbcabf] pb-2 border-b border-[#222a3d]">
            <span>Affichage : {filteredBalls.length} numéros</span>
            <span>Cliquez sur une boule pour inspecter</span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-10 gap-2">
            {filteredBalls.map((ball) => {
              const isSelected = ball.number === selectedNumber;
              return (
                <button
                  key={ball.number}
                  onClick={() => setSelectedNumber(ball.number)}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all border ${
                    isSelected
                      ? 'bg-[#10b981]/25 border-[#4edea3] shadow-md scale-105'
                      : 'bg-[#131b2e] border-[#222a3d] hover:border-[#4edea3]/40'
                  }`}
                >
                  <LottoBall
                    number={ball.number}
                    size="sm"
                    variant={ball.status === 'hot' ? 'amber' : ball.status === 'cold' ? 'cyan' : 'neutral'}
                  />
                  <span className="font-mono text-[9px] text-[#bbcabf] mt-1 font-bold">
                    {ball.score} pts
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Focus Sheet (Right) */}
        <div className="lg:col-span-4 bg-[#171f33] p-5 rounded-xl border border-[#222a3d] space-y-4 sticky top-20 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#222a3d]">
            <div className="flex items-center gap-3">
              <LottoBall
                number={selectedStat.number}
                size="md"
                variant={selectedStat.status === 'hot' ? 'amber' : selectedStat.status === 'cold' ? 'cyan' : 'neutral'}
              />
              <div>
                <h3 className="font-sans text-base text-[#dae2fd] font-bold">
                  Numéro {selectedStat.number < 10 ? `0${selectedStat.number}` : selectedStat.number}
                </h3>
                <span className="font-mono text-[10px] text-[#bbcabf]">
                  Rang #{selectedStat.rank} sur 90
                </span>
              </div>
            </div>

            <span
              className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full ${
                selectedStat.status === 'hot'
                  ? 'bg-[#ec6a06] text-white'
                  : selectedStat.status === 'cold'
                  ? 'bg-[#19aee8] text-[#060e20]'
                  : 'bg-[#222a3d] text-[#dae2fd]'
              }`}
            >
              Score {selectedStat.score}/100
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="bg-[#131b2e] p-3 rounded-lg flex items-center justify-between border border-[#222a3d]">
              <span className="text-[#bbcabf]">Sorties sur 24 Mois :</span>
              <strong className="text-[#4edea3] text-sm">{selectedStat.appearances24M}</strong>
            </div>

            <div className="bg-[#131b2e] p-3 rounded-lg flex items-center justify-between border border-[#222a3d]">
              <span className="text-[#bbcabf]">Fréquence globale :</span>
              <strong className="text-[#dae2fd]">{selectedStat.frequencyPercent}%</strong>
            </div>

            <div className="bg-[#131b2e] p-3 rounded-lg flex items-center justify-between border border-[#222a3d]">
              <span className="text-[#bbcabf]">Écart actuel :</span>
              <strong className={selectedStat.currentGap > 15 ? 'text-[#ec6a06]' : 'text-[#4edea3]'}>
                {selectedStat.currentGap} tirages
              </strong>
            </div>

            <div className="bg-[#131b2e] p-3 rounded-lg flex items-center justify-between border border-[#222a3d]">
              <span className="text-[#bbcabf]">Écart max historique :</span>
              <strong className="text-[#dae2fd]">{selectedStat.maxHistoricalGap} tirages</strong>
            </div>

            <div className="bg-[#131b2e] p-3 rounded-lg flex items-center justify-between border border-[#222a3d]">
              <span className="text-[#bbcabf]">Affinité créneau :</span>
              <strong className="text-[#7bd0ff]">{selectedStat.hourlyPreference} ({selectedStat.hourlyFrequencyPercent}%)</strong>
            </div>
          </div>

          <button
            onClick={() => onOpenNumberDetail(selectedStat.number)}
            className="w-full bg-[#10b981] hover:bg-[#4edea3] text-[#003824] font-mono text-xs font-bold py-2.5 rounded-lg transition-colors shadow-sm"
          >
            Ouvrir la Fiche Complète avec Répartition Horaire &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
