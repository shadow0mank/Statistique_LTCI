import { useState, useMemo } from 'react';
import {
  Target,
  Clock,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Draw, DetectedHourInfo, FormulaWeights } from '../types';
import { computeHourlyStats } from '../data/lonaciEngine';
import LottoBall from '../components/LottoBall';

interface NextDrawViewProps {
  draws: Draw[];
  detectedHours: DetectedHourInfo[];
  weights: FormulaWeights;
  onOpenNumberDetail: (num: number) => void;
  onNavigateTab: (tab: any) => void;
}

export default function NextDrawView({
  draws,
  detectedHours,
  weights,
  onOpenNumberDetail,
  onNavigateTab,
}: NextDrawViewProps) {
  // Configured target draw
  const [targetDate, setTargetDate] = useState<string>('2026-09-03');
  const [targetHour, setTargetHour] = useState<string>(
    detectedHours.find((h) => h.hour === '13:00')?.hour || detectedHours[0]?.hour || '10:00'
  );
  const [targetGame, setTargetGame] = useState<string>('Fortune');

  // Compute hourly statistics specifically for this chosen target hour
  const hourlyStats = useMemo(() => {
    return computeHourlyStats(draws, targetHour, 730, weights);
  }, [draws, targetHour, weights]);

  // High score numbers (score >= 90)
  const highScores = useMemo(() => {
    return hourlyStats.filter((s) => s.score >= 90);
  }, [hourlyStats]);

  // Top 5 highest scores for combination formulation
  const top5Statistical = useMemo(() => {
    return hourlyStats.slice(0, 5);
  }, [hourlyStats]);

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#171f33] p-5 rounded-xl border border-[#222a3d] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#4edea3]" />
            <h2 className="font-sans text-lg text-[#dae2fd] font-bold">
              Analyse Statistique du Prochain Tirage Cible
            </h2>
            <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
              Calcul Spécifique par Heure
            </span>
          </div>
          <p className="font-sans text-xs text-[#bbcabf] mt-1">
            Les calculs ci-dessous sont exclusivement conditionnés par l'historique officiel du créneau horaire choisi.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#131b2e] px-4 py-2.5 rounded-xl border border-[#222a3d] self-start md:self-auto">
          <Clock className="w-4 h-4 text-[#ec6a06]" />
          <div className="font-mono text-xs">
            <span className="text-[#bbcabf]">Créneau cible :</span>{' '}
            <strong className="text-[#ffdbca] text-sm ml-1 font-bold">{targetHour}</strong>
          </div>
        </div>
      </div>

      {/* Target Draw Form */}
      <div className="bg-[#131b2e] p-4 sm:p-5 rounded-xl border border-[#222a3d] space-y-4">
        <span className="font-mono text-xs text-[#dae2fd] font-bold uppercase tracking-wider block">
          Paramètres du Tirage à Analyser :
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          {/* Date */}
          <div className="space-y-1">
            <label className="text-[#bbcabf] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#7bd0ff]" /> Date du tirage :
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-[#171f33] text-[#dae2fd] p-2.5 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3]"
            />
          </div>

          {/* Dynamic Hour */}
          <div className="space-y-1">
            <label className="text-[#bbcabf] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#ec6a06]" /> Heure de jeu (Détectée) :
            </label>
            <select
              value={targetHour}
              onChange={(e) => setTargetHour(e.target.value)}
              className="w-full bg-[#171f33] text-[#dae2fd] p-2.5 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3] font-bold"
            >
              {detectedHours.map((h) => (
                <option key={h.hour} value={h.hour}>
                  {h.hour} ({h.drawCount} tirages - {h.slotName})
                </option>
              ))}
            </select>
          </div>

          {/* Game */}
          <div className="space-y-1">
            <label className="text-[#bbcabf] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#4edea3]" /> Jeu LONACI :
            </label>
            <input
              type="text"
              value={targetGame}
              onChange={(e) => setTargetGame(e.target.value)}
              className="w-full bg-[#171f33] text-[#dae2fd] p-2.5 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3]"
            />
          </div>
        </div>
      </div>

      {/* Mandatory Compliance Warning */}
      <div className="bg-[#ec6a06]/10 border border-[#ec6a06]/30 p-4 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#ec6a06] flex-shrink-0 mt-0.5" />
        <p className="font-sans text-xs text-[#ffb690] leading-relaxed">
          <strong>Avertissement déontologique strict :</strong> Ce résultat indique uniquement que ces
          numéros ont un <strong>score statistique ≥ 90/100</strong> selon les critères historiques pour
          cette heure de jeu ({targetHour}). Il ne s'agit <em>en aucun cas</em> d'une certitude de gain ni d'une
          prédiction divinatoire : les tirages de loterie demeurent régis par les lois du hasard mathématique.
        </p>
      </div>

      {/* Top 5 High Score Combination */}
      <div className="bg-[#171f33] p-5 rounded-xl border border-[#222a3d] space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-[#4edea3] uppercase font-bold tracking-wider">
              Combinaison Statistique Forte à {targetHour}
            </span>
            <h3 className="font-sans text-base sm:text-lg text-[#dae2fd] font-bold mt-0.5">
              Top 5 des Numéros Classés selon la Formule Multicritère
            </h3>
          </div>
          <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
            Basé sur {draws.filter((d) => d.time === targetHour).length} tirages à {targetHour}
          </span>
        </div>

        {/* 5 Balls presentation */}
        <div className="bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] flex flex-wrap items-center justify-around gap-4">
          {top5Statistical.map((stat, idx) => (
            <div
              key={stat.number}
              onClick={() => onOpenNumberDetail(stat.number)}
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            >
              <span className="font-mono text-[10px] text-[#bbcabf] mb-1 font-bold">
                Rang #{idx + 1}
              </span>
              <LottoBall
                number={stat.number}
                size="lg"
                variant={stat.score >= 90 ? 'amber' : 'emerald'}
              />
              <span className="font-sans font-bold text-sm text-[#dae2fd] mt-1.5">
                N° {stat.number < 10 ? `0${stat.number}` : stat.number}
              </span>
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                  stat.score >= 90
                    ? 'bg-[#ec6a06] text-white'
                    : 'bg-[#10b981]/20 text-[#4edea3]'
                }`}
              >
                Score {stat.score}/100
              </span>
              <span className="font-mono text-[10px] text-[#bbcabf] mt-1">
                {stat.appearances} sorties ({stat.frequencyPercent}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* All Numbers with Score >= 90 for this hour */}
      <div className="bg-[#171f33] p-5 rounded-xl border border-[#222a3d] space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#ec6a06]" />
            <h3 className="font-sans text-base text-[#dae2fd] font-bold">
              Numéros avec un Score Statistique ≥ 90/100 à {targetHour} ({highScores.length} numéros)
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('analyse-par-heure')}
            className="text-xs font-mono text-[#4edea3] hover:underline"
          >
            Voir tous les 90 numéros &gt;
          </button>
        </div>

        {highScores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {highScores.map((stat) => (
              <div
                key={stat.number}
                onClick={() => onOpenNumberDetail(stat.number)}
                className="bg-[#131b2e] p-3 rounded-xl border border-[#ec6a06]/40 hover:border-[#ec6a06] transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <LottoBall number={stat.number} size="sm" variant="amber" />
                  <div>
                    <span className="font-sans font-bold text-sm text-[#dae2fd]">
                      Numéro {stat.number < 10 ? `0${stat.number}` : stat.number}
                    </span>
                    <span className="font-mono text-[10px] text-[#bbcabf] block">
                      Écart actuel: {stat.currentGap}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-white bg-[#ec6a06] px-2 py-0.5 rounded-full shadow-sm">
                  {stat.score} / 100
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#131b2e] p-6 rounded-xl border border-[#222a3d] text-center font-mono text-xs text-[#bbcabf]">
            Aucun numéro n'atteint actuellement le seuil rigoureux de 90/100 pour le créneau de {targetHour}.
          </div>
        )}
      </div>

      {/* Transparent Formula Details */}
      <div className="bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] font-mono text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#dae2fd] font-bold">
          <Sparkles className="w-4 h-4 text-[#7bd0ff]" />
          <span>Pondérations Officielles Appliquées à {targetHour} :</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-[#bbcabf] pt-1">
          <div className="bg-[#171f33] p-2 rounded border border-[#222a3d]">
            <span className="text-[#dae2fd] font-bold block">{weights.history24M}%</span>
            <span>Volume 24M</span>
          </div>
          <div className="bg-[#171f33] p-2 rounded border border-[#222a3d]">
            <span className="text-[#dae2fd] font-bold block">{weights.recentTrend}%</span>
            <span>Tendance récente</span>
          </div>
          <div className="bg-[#171f33] p-2 rounded border border-[#222a3d]">
            <span className="text-[#dae2fd] font-bold block">{weights.gap90d}%</span>
            <span>Écart critique</span>
          </div>
          <div className="bg-[#171f33] p-2 rounded border border-[#222a3d]">
            <span className="text-[#dae2fd] font-bold block">{weights.stability6M}%</span>
            <span>Stabilité</span>
          </div>
          <div className="bg-[#171f33] p-2 rounded border border-[#222a3d]">
            <span className="text-[#dae2fd] font-bold block">{weights.hourlyFreq}%</span>
            <span>Affinité {targetHour}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
