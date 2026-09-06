import { useState, useMemo, useEffect } from 'react';
import {
  Target,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  HelpCircle,
  Copy,
  Check,
  Zap,
  ArrowRight,
  BarChart3,
  Layers,
  Radio,
} from 'lucide-react';
import { Draw, DetectedHourInfo, FormulaWeights, DailyHourPrediction } from '../types';
import { computeHourlyStats } from '../data/lonaciEngine';
import { generateDailyPredictions, OFFICIAL_SLOTS_CONFIG } from '../data/lonaciSyncService';
import LottoBall from '../components/LottoBall';

interface NextDrawViewProps {
  draws: Draw[];
  detectedHours: DetectedHourInfo[];
  weights: FormulaWeights;
  onOpenNumberDetail: (num: number) => void;
  onNavigateTab: (tab: any) => void;
  onSync?: () => void;
}

export default function NextDrawView({
  draws,
  detectedHours,
  weights,
  onOpenNumberDetail,
  onNavigateTab,
}: NextDrawViewProps) {
  // Target date selection (defaults to 2026-09-04 or today)
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-04');
  const [selectedSlotHour, setSelectedSlotHour] = useState<string>('13:00');
  const [copiedSlotHour, setCopiedSlotHour] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'schedule' | 'deep_stats'>('schedule');

  // Compute daily predictions for all official hours of the selected date
  const dailyData = useMemo(() => {
    return generateDailyPredictions(draws, selectedDate, weights);
  }, [draws, selectedDate, weights]);

  // Determine which slot is the next imminent slot
  const imminentSlot = useMemo(() => {
    const upcoming = dailyData.slots.find((s) => s.status === 'LIVE' || s.status === 'UPCOMING');
    return upcoming || dailyData.slots[dailyData.slots.length - 1] || dailyData.slots[0];
  }, [dailyData]);

  // Selected slot prediction data
  const activeSlot = useMemo(() => {
    return dailyData.slots.find((s) => s.hour === selectedSlotHour) || imminentSlot;
  }, [dailyData, selectedSlotHour, imminentSlot]);

  // Hourly statistics specifically for the selected slot hour (0-90)
  const hourlyStats = useMemo(() => {
    return computeHourlyStats(draws, activeSlot.hour, 730, weights);
  }, [draws, activeSlot.hour, weights]);

  // Quick copy ticket handler
  const handleCopyTicket = (slot: DailyHourPrediction) => {
    const text = `🎯 PRONOSTICS LONACI [${slot.gameName} - ${slot.hour} (${slot.drawDate})]\n⭐ BANKER : ${slot.banker} (Score: ${slot.bankerScore}%)\n🔥 2 SÛRS : ${slot.twoSure.join(' - ')}\n✅ TOP 5 : ${slot.top5.join(' - ')}\n⚙️ MACHINE : ${slot.machinePicks.join(' - ')}\n📊 Indice Confiance : ${slot.confidence}%`;
    navigator.clipboard.writeText(text);
    setCopiedSlotHour(slot.hour);
    setTimeout(() => setCopiedSlotHour(null), 2500);
  };

  const handleSetQuickDate = (type: 'today' | 'tomorrow' | 'yesterday') => {
    if (type === 'today') {
      setSelectedDate('2026-09-04');
    } else if (type === 'tomorrow') {
      setSelectedDate('2026-09-05');
    } else if (type === 'yesterday') {
      setSelectedDate('2026-09-03');
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#171f33] p-5 sm:p-6 rounded-2xl border border-[#222a3d] flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-[#ec6a06]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ec6a06]/20 flex items-center justify-center text-[#ec6a06]">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="font-sans text-xl text-[#dae2fd] font-bold tracking-tight">
              Pronostics &amp; Recommandations Quotidiennes par Heure
            </h2>
            <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-[#10b981]/30">
              Conditionnement Horaire 100%
            </span>
          </div>
          <p className="font-sans text-xs text-[#bbcabf] leading-relaxed">
            Chaque créneau horaire possède sa propre dynamique statistique. Le système calcule automatiquement pour chaque jour les meilleurs numéros, Bankers, 2 Sûrs et combinaisons recommandées.
          </p>
        </div>

        {/* Date Selector & Shortcuts */}
        <div className="flex flex-col gap-2 bg-[#131b2e] p-3 rounded-xl border border-[#222a3d] self-start md:self-auto min-w-[260px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-[#bbcabf] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#7bd0ff]" /> Jour sélectionné :
            </span>
            <span className="font-mono text-xs text-[#4edea3] font-bold">
              {dailyData.dayName}
            </span>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#171f33] text-[#dae2fd] font-mono text-xs p-2 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3]"
          />

          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <button
              onClick={() => handleSetQuickDate('yesterday')}
              className="flex-1 bg-[#171f33] hover:bg-[#222a3d] text-[#bbcabf] py-1 rounded border border-[#222a3d] transition-colors cursor-pointer text-center"
            >
              Hier (03/09)
            </button>
            <button
              onClick={() => handleSetQuickDate('today')}
              className={`flex-1 py-1 rounded border font-bold transition-colors cursor-pointer text-center ${
                selectedDate === '2026-09-04'
                  ? 'bg-[#10b981]/20 border-[#10b981] text-[#4edea3]'
                  : 'bg-[#171f33] hover:bg-[#222a3d] text-[#bbcabf] border-[#222a3d]'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => handleSetQuickDate('tomorrow')}
              className="flex-1 bg-[#171f33] hover:bg-[#222a3d] text-[#bbcabf] py-1 rounded border border-[#222a3d] transition-colors cursor-pointer text-center"
            >
              Demain (05/09)
            </button>
          </div>
        </div>
      </div>

      {/* Featured Imminent Draw Card */}
      {imminentSlot && (
        <div className="bg-gradient-to-br from-[#171f33] via-[#131b2e] to-[#0f172a] p-5 sm:p-6 rounded-2xl border-2 border-[#10b981]/40 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#ec6a06]/20 text-[#ffdbca] border border-[#ec6a06]/40 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ec6a06] animate-ping" />
                  CIBLÉ : {imminentSlot.slotName} ({imminentSlot.hour} GMT)
                </span>
                <span className="font-mono text-xs text-[#bbcabf]">
                  Date : <strong className="text-[#dae2fd]">{imminentSlot.drawDate}</strong>
                </span>
                <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Indice de Confiance IA : {imminentSlot.confidence}%
                </span>
              </div>

              <h3 className="font-sans text-lg sm:text-xl text-[#dae2fd] font-bold">
                Sélection d'Élite pour le Tirage de {imminentSlot.hour} ({imminentSlot.gameName})
              </h3>
              <p className="font-sans text-xs text-[#bbcabf]">
                Algorithme pondéré sur 24 mois d'historique pour l'heure de {imminentSlot.hour}.
              </p>
            </div>

            <button
              onClick={() => handleCopyTicket(imminentSlot)}
              className="bg-[#10b981] hover:bg-[#4edea3] text-[#003824] px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer self-start lg:self-auto"
            >
              {copiedSlotHour === imminentSlot.hour ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Ticket Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier les Pronostics</span>
                </>
              )}
            </button>
          </div>

          {/* Quick numbers summary strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#222a3d]/80">
            {/* Banker */}
            <div className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d] flex items-center gap-4">
              <LottoBall
                number={imminentSlot.banker}
                size="lg"
                variant="amber"
                score={imminentSlot.bankerScore}
                onClick={() => onOpenNumberDetail(imminentSlot.banker)}
              />
              <div>
                <span className="font-mono text-[10px] text-[#ffdbca] uppercase tracking-wider font-bold block">
                  ⭐ Banker du Jour
                </span>
                <span className="font-mono text-xs text-[#dae2fd] font-bold">
                  Numéro #{imminentSlot.banker}
                </span>
                <span className="font-mono text-[10px] text-[#4edea3] block">
                  Score : {imminentSlot.bankerScore}% • Écart : {imminentSlot.bankerGap}
                </span>
              </div>
            </div>

            {/* 2 Sûrs */}
            <div className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d] flex items-center gap-3">
              <div className="flex -space-x-2">
                <LottoBall
                  number={imminentSlot.twoSure[0]}
                  size="md"
                  variant="amber"
                  onClick={() => onOpenNumberDetail(imminentSlot.twoSure[0])}
                />
                <LottoBall
                  number={imminentSlot.twoSure[1]}
                  size="md"
                  variant="emerald"
                  onClick={() => onOpenNumberDetail(imminentSlot.twoSure[1])}
                />
              </div>
              <div>
                <span className="font-mono text-[10px] text-[#4edea3] uppercase tracking-wider font-bold block">
                  🔥 2 Sûrs (Turbo)
                </span>
                <span className="font-mono text-xs text-[#dae2fd] font-bold">
                  {imminentSlot.twoSure[0]} - {imminentSlot.twoSure[1]}
                </span>
                <span className="font-mono text-[10px] text-[#86948a] block">Paire Complémentaire</span>
              </div>
            </div>

            {/* Top 5 Combinaison */}
            <div className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d] flex flex-col justify-center space-y-1.5 md:col-span-2">
              <span className="font-mono text-[10px] text-[#7bd0ff] uppercase tracking-wider font-bold block">
                ✅ Quintette Conseillé (Top 5)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {imminentSlot.top5.map((num) => (
                  <LottoBall
                    key={num}
                    number={num}
                    size="sm"
                    variant={num === imminentSlot.banker ? 'amber' : 'emerald'}
                    onClick={() => onOpenNumberDetail(num)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Lotto Matrice Plus Proprietary Strip */}
          <div className="mt-4 pt-4 border-t border-[#222a3d]/70 grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0e1628]/60 p-3.5 rounded-xl font-mono text-xs">
            {/* Secret Code */}
            <div className="flex items-center gap-3 bg-[#171f33] p-3 rounded-lg border border-[#222a3d]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#eab308] to-[#ca8a04] text-[#000] font-black text-sm flex items-center justify-center shadow-md shadow-[#eab308]/20 border border-[#fef08a]">
                {imminentSlot.secretCode || 42}
              </div>
              <div>
                <span className="text-[10px] text-[#facc15] font-bold uppercase tracking-wider block">
                  🔑 Code Secret / Caché
                </span>
                <span className="text-[#dae2fd] font-bold text-xs">
                  Pivot #{imminentSlot.secretCode || 42}
                </span>
                <span className="text-[10px] text-[#86948a] block">Lotto Matrice Plus</span>
              </div>
            </div>

            {/* Cross & Pyramid Numbers */}
            <div className="bg-[#171f33] p-3 rounded-lg border border-[#222a3d] space-y-1.5">
              <span className="text-[10px] text-[#7bd0ff] font-bold uppercase tracking-wider block">
                ✝️ Croix de Sommation (4 Pions)
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(imminentSlot.crossNumbers || [12, 34, 56, 78]).map((num) => (
                  <span
                    key={num}
                    onClick={() => onOpenNumberDetail(num)}
                    className="cursor-pointer bg-[#131b2e] hover:bg-[#222a3d] text-[#7bd0ff] px-2 py-0.5 rounded font-bold border border-[#7bd0ff]/30 text-xs"
                  >
                    {num < 10 ? `0${num}` : num}
                  </span>
                ))}
              </div>
            </div>

            {/* Rejected Pawns */}
            <div className="bg-[#171f33] p-3 rounded-lg border border-[#222a3d] space-y-1.5">
              <span className="text-[10px] text-[#f87171] font-bold uppercase tracking-wider block">
                🚫 Pions Rejetés (À Éviter)
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(imminentSlot.rejectedBalls || [9, 21, 54, 88]).map((num) => (
                  <span
                    key={num}
                    className="bg-[#ef4444]/10 text-[#fca5a5] line-through px-1.5 py-0.5 rounded font-bold border border-[#ef4444]/20 text-xs"
                  >
                    {num < 10 ? `0${num}` : num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Schedule View: Full Day Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-sans text-base text-[#dae2fd] font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4edea3]" />
              Programme Complet de la Journée : {dailyData.dayName} {dailyData.date}
            </h3>
            <p className="font-sans text-xs text-[#bbcabf]">
              Les 8 créneaux horaires officiels de la LONACI avec leurs pronostics dédiés.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setViewMode('schedule')}
              className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                viewMode === 'schedule'
                  ? 'bg-[#10b981]/20 border-[#10b981] text-[#4edea3] font-bold'
                  : 'bg-[#171f33] border-[#222a3d] text-[#bbcabf]'
              }`}
            >
              Grille des Heures ({dailyData.slots.length})
            </button>
            <button
              onClick={() => setViewMode('deep_stats')}
              className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                viewMode === 'deep_stats'
                  ? 'bg-[#10b981]/20 border-[#10b981] text-[#4edea3] font-bold'
                  : 'bg-[#171f33] border-[#222a3d] text-[#bbcabf]'
              }`}
            >
              Analyse Approfondie ({activeSlot.hour})
            </button>
          </div>
        </div>

        {viewMode === 'schedule' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {dailyData.slots.map((slot) => {
              const isSelected = selectedSlotHour === slot.hour;
              const hasResult = slot.status === 'COMPLETED' && slot.actualDraw;

              return (
                <div
                  key={slot.hour}
                  className={`bg-[#131b2e] rounded-xl border p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all shadow-md hover:border-[#4edea3]/60 relative ${
                    isSelected ? 'border-[#10b981] ring-1 ring-[#10b981]/40' : 'border-[#222a3d]'
                  }`}
                >
                  {/* Card Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-base font-bold text-[#dae2fd] flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#ec6a06]" />
                        {slot.hour} GMT
                      </span>

                      <div className="flex items-center gap-1.5">
                        {slot.secretCode && (
                          <span className="bg-[#eab308]/20 text-[#facc15] font-mono text-[9px] px-2 py-0.5 rounded-full font-bold border border-[#eab308]/30" title="Code Secret Lotto Matrice Plus">
                            Code #{slot.secretCode}
                          </span>
                        )}
                        {hasResult ? (
                          <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Sorti
                          </span>
                        ) : (
                          <span className="bg-[#222a3d] text-[#bbcabf] font-mono text-[10px] px-2 py-0.5 rounded-full">
                            À Venir
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="font-sans text-xs text-[#dae2fd] font-bold truncate">
                        {slot.gameName}
                      </h4>
                      <span className="font-mono text-[10px] text-[#4edea3] font-semibold">
                        Confiance : {slot.confidence}%
                      </span>
                    </div>

                    {/* Actual results if completed */}
                    {hasResult && slot.actualDraw && (
                      <div className="bg-[#171f33] p-2.5 rounded-lg border border-[#222a3d] space-y-1.5">
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-[#4edea3] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Sortis en réel :
                          </span>
                          <span className="text-[#bbcabf]">
                            {slot.hitCount} bon(s) numéro(s)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {slot.actualDraw.balls.map((b) => {
                            const isPredicted = slot.top5.includes(b);
                            return (
                              <span
                                key={b}
                                className={`font-mono text-xs px-2 py-1 rounded font-bold ${
                                  isPredicted
                                    ? 'bg-[#10b981] text-[#003824] ring-2 ring-[#4edea3]'
                                    : 'bg-[#222a3d] text-[#dae2fd]'
                                }`}
                              >
                                {b < 10 ? `0${b}` : b}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Pronostics for this slot */}
                    <div className="space-y-3 pt-2">
                      {/* Banker & 2 Surs */}
                      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                        <div className="bg-[#171f33] p-2.5 rounded-lg border border-[#222a3d]">
                          <span className="text-[10px] text-[#ffdbca] uppercase font-bold block">
                            Banker
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <LottoBall
                              number={slot.banker}
                              size="xs"
                              variant="amber"
                              onClick={() => onOpenNumberDetail(slot.banker)}
                            />
                            <div>
                              <strong className="text-sm text-[#dae2fd]">#{slot.banker}</strong>
                              <span className="text-[10px] text-[#86948a] block">
                                Score: {slot.bankerScore}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#171f33] p-2.5 rounded-lg border border-[#222a3d]">
                          <span className="text-[10px] text-[#4edea3] uppercase font-bold block">
                            2 Sûrs
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                            <LottoBall
                              number={slot.twoSure[0]}
                              size="xs"
                              variant="amber"
                              onClick={() => onOpenNumberDetail(slot.twoSure[0])}
                            />
                            <span className="text-[#86948a] text-xs">+</span>
                            <LottoBall
                              number={slot.twoSure[1]}
                              size="xs"
                              variant="emerald"
                              onClick={() => onOpenNumberDetail(slot.twoSure[1])}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Top 5 recommended */}
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] text-[#bbcabf] block">
                          Top 5 Conseillé :
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {slot.top5.map((n) => (
                            <LottoBall
                              key={n}
                              number={n}
                              size="xs"
                              variant={n === slot.banker ? 'amber' : 'emerald'}
                              onClick={() => onOpenNumberDetail(n)}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Machine picks */}
                      <div className="space-y-1 pt-1">
                        <span className="font-mono text-[10px] text-[#86948a] block">
                          Numéros Machine :
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {slot.machinePicks.map((n) => (
                            <LottoBall
                              key={n}
                              number={n}
                              size="xs"
                              variant="neutral"
                              onClick={() => onOpenNumberDetail(n)}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Lotto Matrice Plus Extra Row */}
                      {(slot.crossNumbers || slot.rejectedBalls) && (
                        <div className="pt-2 border-t border-[#222a3d]/70 space-y-1.5 font-mono text-[10px]">
                          {slot.crossNumbers && (
                            <div className="flex items-center justify-between text-[#7bd0ff]">
                              <span className="text-[#86948a]">Croix Matrice :</span>
                              <span className="font-bold">
                                {slot.crossNumbers.join(' • ')}
                              </span>
                            </div>
                          )}
                          {slot.rejectedBalls && (
                            <div className="flex items-center justify-between text-[#fca5a5]">
                              <span className="text-[#86948a]">Pions Rejetés :</span>
                              <span className="line-through">
                                {slot.rejectedBalls.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-[#222a3d] flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedSlotHour(slot.hour);
                        setViewMode('deep_stats');
                      }}
                      className="text-[#4edea3] hover:underline font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Analyse 90 n°</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyTicket(slot)}
                      className="bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] p-1.5 rounded border border-[#222a3d] transition-colors cursor-pointer"
                      title="Copier les pronostics de cette heure"
                    >
                      {copiedSlotHour === slot.hour ? (
                        <Check className="w-3.5 h-3.5 text-[#4edea3]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#bbcabf]" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Deep Stats Mode for Selected Hour */
          <div className="bg-[#131b2e] rounded-xl border border-[#222a3d] p-5 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222a3d] pb-4">
              <div>
                <h3 className="font-sans text-base text-[#dae2fd] font-bold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#4edea3]" />
                  Classement Intégral des 90 Numéros pour le Tirage de {activeSlot.hour}
                </h3>
                <p className="font-sans text-xs text-[#bbcabf] mt-0.5">
                  Analyse de l'historique complet des tirages de {activeSlot.hour} ({hourlyStats.length} numéros passés au crible).
                </p>
              </div>

              {/* Hour selector */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-[#bbcabf]">Changer d'heure :</span>
                <select
                  value={selectedSlotHour}
                  onChange={(e) => setSelectedSlotHour(e.target.value)}
                  className="bg-[#171f33] text-[#dae2fd] px-3 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none cursor-pointer"
                >
                  {OFFICIAL_SLOTS_CONFIG.map((cfg) => (
                    <option key={cfg.hour} value={cfg.hour}>
                      {cfg.hour} - {cfg.gameName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Top 10 Balls Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#0e1628] text-[#86948a] border-b border-[#222a3d]">
                  <tr>
                    <th className="py-2.5 px-3">Rang</th>
                    <th className="py-2.5 px-3">Numéro</th>
                    <th className="py-2.5 px-3">Score Calculé</th>
                    <th className="py-2.5 px-3 text-center">Sorties à {activeSlot.hour}</th>
                    <th className="py-2.5 px-3 text-center">Fréquence (%)</th>
                    <th className="py-2.5 px-3 text-center">Écart Actuel</th>
                    <th className="py-2.5 px-3 text-center">Écart Max</th>
                    <th className="py-2.5 px-3">Tendance 30j</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222a3d]">
                  {hourlyStats.slice(0, 15).map((stat, idx) => (
                    <tr key={stat.number} className="hover:bg-[#1c2438] transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#86948a]">#{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <LottoBall
                          number={stat.number}
                          size="xs"
                          variant={idx === 0 ? 'amber' : idx < 5 ? 'emerald' : 'neutral'}
                          onClick={() => onOpenNumberDetail(stat.number)}
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs ${
                            stat.score >= 90
                              ? 'bg-[#ec6a06]/20 text-[#ffdbca]'
                              : stat.score >= 75
                              ? 'bg-[#10b981]/20 text-[#4edea3]'
                              : 'text-[#bbcabf]'
                          }`}
                        >
                          {stat.score}/100
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-[#dae2fd]">
                        {stat.appearances} fois
                      </td>
                      <td className="py-2.5 px-3 text-center text-[#7bd0ff]">
                        {stat.frequencyPercent}%
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#dae2fd]">
                        {stat.currentGap}
                      </td>
                      <td className="py-2.5 px-3 text-center text-[#86948a]">
                        {stat.maxGap}
                      </td>
                      <td className="py-2.5 px-3">
                        {stat.trend === 'up' ? (
                          <span className="text-[#4edea3] font-bold">▲ Forte</span>
                        ) : stat.trend === 'down' ? (
                          <span className="text-[#ff8f73]">▼ Faible</span>
                        ) : (
                          <span className="text-[#bbcabf]">● Stable</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onOpenNumberDetail(stat.number)}
                          className="text-[#4edea3] hover:underline font-mono text-[11px] cursor-pointer"
                        >
                          Fiche
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
