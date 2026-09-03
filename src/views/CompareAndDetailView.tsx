import { useState } from 'react';
import { GitCompare, Clock, Search, Sparkles, Flame } from 'lucide-react';
import { Draw, DetectedHourInfo, FormulaWeights } from '../types';
import LottoBall from '../components/LottoBall';

interface CompareAndDetailViewProps {
  draws: Draw[];
  detectedHours: DetectedHourInfo[];
  weights: FormulaWeights;
  onOpenNumberDetail: (ballNumber: number) => void;
  onOpenCompare: (balls: number[], hour: string) => void;
}

export default function CompareAndDetailView({
  draws,
  detectedHours,
  weights,
  onOpenNumberDetail,
  onOpenCompare,
}: CompareAndDetailViewProps) {
  const [selectedHour, setSelectedHour] = useState<string>(
    detectedHours[0]?.hour || '10:00'
  );
  const [selectedBalls, setSelectedBalls] = useState<number[]>([7, 27, 44]);
  const [searchBall, setSearchBall] = useState<string>('');

  const toggleBall = (num: number) => {
    if (selectedBalls.includes(num)) {
      if (selectedBalls.length > 2) {
        setSelectedBalls(selectedBalls.filter((n) => n !== num));
      }
    } else {
      if (selectedBalls.length < 5) {
        setSelectedBalls([...selectedBalls, num]);
      }
    }
  };

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#171f33] p-5 rounded-xl border border-[#222a3d] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[#4edea3]" />
            <h2 className="font-sans text-lg text-[#dae2fd] font-bold">
              Comparateur &amp; Fiches Détaillées des 90 Numéros
            </h2>
            <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
              Analyse Croisée
            </span>
          </div>
          <p className="font-sans text-xs text-[#bbcabf] mt-1">
            Comparez 2 à 5 numéros côte à côte pour une heure spécifique ou explorez le profil horaire de chaque boule.
          </p>
        </div>

        <button
          onClick={() => onOpenCompare(selectedBalls, selectedHour)}
          className="bg-[#10b981] hover:bg-[#4edea3] text-[#003824] px-4 py-2.5 rounded-lg font-mono text-xs font-bold transition-colors flex items-center gap-2 shadow-sm self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Lancer la comparaison ({selectedBalls.length} numéros à {selectedHour})</span>
        </button>
      </div>

      {/* Compare Setup Bar */}
      <div className="bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[#dae2fd] font-bold">
            <Clock className="w-4 h-4 text-[#ec6a06]" />
            <span>Créneau Horaire d'Analyse :</span>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className="bg-[#171f33] text-[#4edea3] px-3 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none font-bold"
            >
              {detectedHours.map((h) => (
                <option key={h.hour} value={h.hour}>
                  {h.hour} ({h.drawCount} tirages - {h.slotName})
                </option>
              ))}
            </select>
          </div>

          <div className="font-mono text-xs text-[#bbcabf]">
            Sélectionnez 2 à 5 numéros ci-dessous ({selectedBalls.length}/5 sélectionnés)
          </div>
        </div>

        {/* Selected Balls pill strip */}
        <div className="flex items-center gap-2 p-3 bg-[#060e20] rounded-xl border border-[#222a3d] overflow-x-auto">
          <span className="font-mono text-xs text-[#bbcabf] mr-2">Sélection :</span>
          {selectedBalls.map((num) => (
            <div
              key={num}
              className="flex items-center gap-1.5 bg-[#171f33] px-3 py-1 rounded-full border border-[#4edea3]/40"
            >
              <LottoBall number={num} size="sm" variant="emerald" />
              <span className="font-mono text-xs text-[#dae2fd] font-bold">N° {num}</span>
              <button
                onClick={() => toggleBall(num)}
                className="text-[#bbcabf] hover:text-[#ec6a06] text-xs ml-1 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of all 90 numbers */}
      <div className="bg-[#171f33] p-5 rounded-xl border border-[#222a3d] space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-sans text-base text-[#dae2fd] font-bold">
              Grille Interactive des 90 Numéros
            </h3>
            <p className="font-sans text-xs text-[#bbcabf]">
              Cliquez sur une case pour l'ajouter à la comparaison, ou sur « Fiche » pour voir sa distribution horaire.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#bbcabf]" />
            <input
              type="text"
              placeholder="Chercher (ex: 42)..."
              value={searchBall}
              onChange={(e) => setSearchBall(e.target.value)}
              className="w-full bg-[#131b2e] text-[#dae2fd] placeholder:text-[#bbcabf]/60 font-sans text-xs pl-9 pr-3 py-2 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3]"
            />
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-18 gap-2 pt-2">
          {Array.from({ length: 90 }, (_, i) => i + 1)
            .filter((num) => !searchBall || num.toString().includes(searchBall.trim()))
            .map((num) => {
              const isSelected = selectedBalls.includes(num);

              return (
                <div
                  key={num}
                  className={`p-2 rounded-lg border transition-all flex flex-col items-center justify-between gap-1 group ${
                    isSelected
                      ? 'bg-[#10b981]/20 border-[#4edea3] shadow-sm'
                      : 'bg-[#131b2e] border-[#222a3d] hover:border-[#4edea3]/50'
                  }`}
                >
                  <div
                    onClick={() => toggleBall(num)}
                    className="cursor-pointer flex flex-col items-center w-full"
                  >
                    <LottoBall
                      number={num}
                      size="sm"
                      variant={isSelected ? 'emerald' : 'neutral'}
                    />
                  </div>

                  <button
                    onClick={() => onOpenNumberDetail(num)}
                    className="text-[10px] font-mono text-[#7bd0ff] hover:underline"
                  >
                    Fiche
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
