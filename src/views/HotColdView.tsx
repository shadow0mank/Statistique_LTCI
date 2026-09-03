import { useState, useMemo } from 'react';
import { Flame, Snowflake, Clock, TrendingUp, AlertCircle, Filter } from 'lucide-react';
import { Draw, DetectedHourInfo, BallStat } from '../types';
import { computeHourlyStats } from '../data/lonaciEngine';
import LottoBall from '../components/LottoBall';

interface HotColdViewProps {
  draws: Draw[];
  detectedHours: DetectedHourInfo[];
  ballStats: BallStat[];
  onOpenNumberDetail: (ballNumber: number) => void;
}

export default function HotColdView({
  draws,
  detectedHours,
  ballStats,
  onOpenNumberDetail,
}: HotColdViewProps) {
  const [selectedHour, setSelectedHour] = useState<string>('all');

  // Compute stats according to selected hour or globally
  const { hotBalls, coldBalls } = useMemo(() => {
    if (selectedHour === 'all') {
      const hot = [...ballStats].sort((a, b) => b.score - a.score).slice(0, 10);
      const cold = [...ballStats].sort((a, b) => b.currentGap - a.currentGap).slice(0, 10);
      return { hotBalls: hot, coldBalls: cold };
    } else {
      const hourly = computeHourlyStats(draws, selectedHour, 730);
      const hot = [...hourly].sort((a, b) => b.score - a.score).slice(0, 10).map((h) => ({
        number: h.number,
        score: h.score,
        rank: 0,
        appearances24M: h.appearances,
        frequencyPercent: h.frequencyPercent,
        hourlyFrequencyPercent: h.frequencyPercent,
        currentGap: h.currentGap,
        maxHistoricalGap: h.maxGap,
        status: (h.score >= 80 ? 'hot' : 'normal') as any,
        recentTrend: h.trend,
        hourlyPreference: selectedHour,
      }));
      const cold = [...hourly].sort((a, b) => b.currentGap - a.currentGap).slice(0, 10).map((h) => ({
        number: h.number,
        score: h.score,
        rank: 0,
        appearances24M: h.appearances,
        frequencyPercent: h.frequencyPercent,
        hourlyFrequencyPercent: h.frequencyPercent,
        currentGap: h.currentGap,
        maxHistoricalGap: h.maxGap,
        status: 'cold' as any,
        recentTrend: h.trend,
        hourlyPreference: selectedHour,
      }));
      return { hotBalls: hot, coldBalls: cold };
    }
  }, [draws, selectedHour, ballStats]);

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#171f33] p-5 rounded-xl border border-[#222a3d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#ec6a06]" />
            <h2 className="font-sans text-lg text-[#dae2fd] font-bold">
              Analyse Comparative Chauds &amp; Froids
            </h2>
          </div>
          <p className="font-sans text-xs text-[#bbcabf] mt-1">
            Surveillance des deux extrêmes de distribution statistique sur la période 2024-2026.
          </p>
        </div>

        {/* Filter by hour */}
        <div className="flex items-center gap-2 bg-[#131b2e] px-3 py-2 rounded-xl border border-[#222a3d] font-mono text-xs">
          <Clock className="w-4 h-4 text-[#ec6a06]" />
          <span className="text-[#bbcabf]">Créneau :</span>
          <select
            value={selectedHour}
            onChange={(e) => setSelectedHour(e.target.value)}
            className="bg-[#171f33] text-[#4edea3] px-2.5 py-1 rounded border border-[#222a3d] font-bold focus:outline-none"
          >
            <option value="all">Tous créneaux confondus</option>
            {detectedHours.map((h) => (
              <option key={h.hour} value={h.hour}>
                À {h.hour} ({h.drawCount} tirages)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hot Column */}
        <div className="bg-[#171f33] p-5 rounded-xl border border-[#222a3d] space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#222a3d]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#ec6a06]/20 flex items-center justify-center text-[#ec6a06]">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sans text-base text-[#dae2fd] font-bold">Top 10 Numéros Chauds</h3>
                <p className="font-sans text-[11px] text-[#bbcabf]">
                  Fréquence d'apparition maximale et vélocité récente forte {selectedHour !== 'all' ? `à ${selectedHour}` : ''}
                </p>
              </div>
            </div>
            <span className="bg-[#ec6a06] text-white font-mono text-[10px] px-2 py-0.5 rounded font-black">
              Score Élevé
            </span>
          </div>

          <div className="space-y-2">
            {hotBalls.map((ball, idx) => (
              <div
                key={ball.number}
                onClick={() => onOpenNumberDetail(ball.number)}
                className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d] hover:border-[#ec6a06] transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#bbcabf] font-bold w-4">#{idx + 1}</span>
                  <LottoBall number={ball.number} size="sm" variant="amber" />
                  <div>
                    <span className="font-mono text-xs font-bold text-[#dae2fd]">
                      Numéro {ball.number < 10 ? `0${ball.number}` : ball.number}
                    </span>
                    <div className="font-mono text-[10px] text-[#bbcabf] flex items-center gap-2 mt-0.5">
                      <span>{ball.appearances24M} sorties</span>
                      <span>•</span>
                      <span>Fréq: {ball.frequencyPercent}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-[#ffb690] bg-[#ec6a06]/20 px-2 py-0.5 rounded">
                    Score {ball.score}/100
                  </span>
                  <span className="block text-[10px] text-[#4edea3] mt-1">
                    Écart actuel: {ball.currentGap}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cold Column */}
        <div className="bg-[#171f33] p-5 rounded-xl border border-[#222a3d] space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#222a3d]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#19aee8]/20 flex items-center justify-center text-[#7bd0ff]">
                <Snowflake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sans text-base text-[#dae2fd] font-bold">Top 10 Numéros Froids</h3>
                <p className="font-sans text-[11px] text-[#bbcabf]">
                  Plus grand écart d'absence (tirages consécutifs sans apparition)
                </p>
              </div>
            </div>
            <span className="bg-[#19aee8] text-[#060e20] font-mono text-[10px] px-2 py-0.5 rounded font-black">
              Écart Critique
            </span>
          </div>

          <div className="space-y-2">
            {coldBalls.map((ball, idx) => (
              <div
                key={ball.number}
                onClick={() => onOpenNumberDetail(ball.number)}
                className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d] hover:border-[#7bd0ff] transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#bbcabf] font-bold w-4">#{idx + 1}</span>
                  <LottoBall number={ball.number} size="sm" variant="cyan" />
                  <div>
                    <span className="font-mono text-xs font-bold text-[#dae2fd]">
                      Numéro {ball.number < 10 ? `0${ball.number}` : ball.number}
                    </span>
                    <div className="font-mono text-[10px] text-[#bbcabf] flex items-center gap-2 mt-0.5">
                      <span>{ball.appearances24M} sorties</span>
                      <span>•</span>
                      <span>Écart max: {ball.maxHistoricalGap}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-[#7bd0ff] bg-[#19aee8]/20 px-2 py-0.5 rounded">
                    Écart : {ball.currentGap} tirages
                  </span>
                  <span className="block text-[10px] text-[#bbcabf] mt-1">
                    Score: {ball.score}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
