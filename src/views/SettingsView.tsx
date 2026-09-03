import { useState } from 'react';
import { Settings, Sliders, Database, RotateCcw, Check, Save } from 'lucide-react';
import { FormulaWeights } from '../types';

interface SettingsViewProps {
  weights: FormulaWeights;
  onUpdateWeights: (newWeights: FormulaWeights) => void;
  onResetData: () => void;
}

export default function SettingsView({ weights, onUpdateWeights, onResetData }: SettingsViewProps) {
  const [currentWeights, setCurrentWeights] = useState<FormulaWeights>(weights);
  const [savedMessage, setSavedMessage] = useState(false);

  const total =
    currentWeights.history24M +
    currentWeights.recentTrend +
    currentWeights.gap90d +
    currentWeights.stability6M +
    currentWeights.hourlyFreq;

  const handleSave = () => {
    onUpdateWeights(currentWeights);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const handleResetWeights = () => {
    const defaultWeights: FormulaWeights = {
      history24M: 30,
      recentTrend: 20,
      gap90d: 15,
      stability6M: 15,
      hourlyFreq: 20,
    };
    setCurrentWeights(defaultWeights);
    onUpdateWeights(defaultWeights);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#171f33] p-5 rounded-xl border border-[#222a3d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#4edea3]" />
            <h2 className="font-sans text-lg text-[#dae2fd] font-bold">Paramètres &amp; Moteur SQL</h2>
            <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
              Configuration Moteur
            </span>
          </div>
          <p className="font-sans text-xs text-[#bbcabf] mt-1">
            Ajustement des coefficients de la formule statistique et paramètres de connexion à la base.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Weight Sliders */}
        <div className="lg:col-span-7 bg-[#171f33] rounded-xl border border-[#222a3d] p-6 space-y-5 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#222a3d]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#ec6a06]" />
              <h3 className="font-sans text-base text-[#dae2fd] font-bold">
                Pondérations de l'Indice Statistique (Score 0-100)
              </h3>
            </div>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                total === 100 ? 'bg-[#10b981]/20 text-[#4edea3]' : 'bg-[#ec6a06]/20 text-[#ffb690]'
              }`}
            >
              Total : {total}% {total !== 100 && '(Ajuster à 100%)'}
            </span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Factor 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#dae2fd]">
                <span>Historique 24 Mois (H) :</span>
                <span className="text-[#4edea3] font-bold">{currentWeights.history24M}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={currentWeights.history24M}
                onChange={(e) =>
                  setCurrentWeights({ ...currentWeights, history24M: Number(e.target.value) })
                }
                className="w-full accent-[#10b981]"
              />
            </div>

            {/* Factor 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#dae2fd]">
                <span>Tendance Récente 30J (T) :</span>
                <span className="text-[#ec6a06] font-bold">{currentWeights.recentTrend}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={currentWeights.recentTrend}
                onChange={(e) =>
                  setCurrentWeights({ ...currentWeights, recentTrend: Number(e.target.value) })
                }
                className="w-full accent-[#ec6a06]"
              />
            </div>

            {/* Factor 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#dae2fd]">
                <span>Écart Normalisé 90J (E) :</span>
                <span className="text-[#7bd0ff] font-bold">{currentWeights.gap90d}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={currentWeights.gap90d}
                onChange={(e) =>
                  setCurrentWeights({ ...currentWeights, gap90d: Number(e.target.value) })
                }
                className="w-full accent-[#19aee8]"
              />
            </div>

            {/* Factor 4 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#dae2fd]">
                <span>Stabilité Variance 6M (S) :</span>
                <span className="text-[#bbcabf] font-bold">{currentWeights.stability6M}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={currentWeights.stability6M}
                onChange={(e) =>
                  setCurrentWeights({ ...currentWeights, stability6M: Number(e.target.value) })
                }
                className="w-full accent-[#bbcabf]"
              />
            </div>

            {/* Factor 5 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#dae2fd]">
                <span>Fréquence Créneau Horaire (F) :</span>
                <span className="text-[#6ffbbe] font-bold">{currentWeights.hourlyFreq}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={currentWeights.hourlyFreq}
                onChange={(e) =>
                  setCurrentWeights({ ...currentWeights, hourlyFreq: Number(e.target.value) })
                }
                className="w-full accent-[#6ffbbe]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#222a3d]">
            <button
              onClick={handleResetWeights}
              className="text-[#bbcabf] hover:text-[#dae2fd] font-mono text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser aux valeurs LONACI</span>
            </button>

            <button
              onClick={handleSave}
              className="bg-[#10b981] hover:bg-[#4edea3] text-[#003824] px-4 py-2 rounded-lg font-mono text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Appliquer les pondérations</span>
            </button>
          </div>

          {savedMessage && (
            <div className="p-2.5 bg-[#10b981]/15 border border-[#10b981]/30 rounded-lg text-[#4edea3] font-mono text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Pondérations appliquées et recalcul des scores effectué !</span>
            </div>
          )}
        </div>

        {/* Right: Database Connection Details & Maintenance */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#171f33] rounded-xl border border-[#222a3d] p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#222a3d]">
              <Database className="w-4 h-4 text-[#7bd0ff]" />
              <h3 className="font-sans text-sm text-[#dae2fd] font-bold">
                Paramètres Connexion MySQL
              </h3>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="bg-[#131b2e] p-2.5 rounded border border-[#222a3d] flex justify-between">
                <span className="text-[#bbcabf]">Hôte Réplicat :</span>
                <span className="text-[#dae2fd]">db-lonaci.internal.abj</span>
              </div>
              <div className="bg-[#131b2e] p-2.5 rounded border border-[#222a3d] flex justify-between">
                <span className="text-[#bbcabf]">Port :</span>
                <span className="text-[#4edea3]">3306 (Chiffré SSL)</span>
              </div>
              <div className="bg-[#131b2e] p-2.5 rounded border border-[#222a3d] flex justify-between">
                <span className="text-[#bbcabf]">Nom de Base :</span>
                <span className="text-[#dae2fd]">lonaci_master_24m</span>
              </div>
              <div className="bg-[#131b2e] p-2.5 rounded border border-[#222a3d] flex justify-between">
                <span className="text-[#bbcabf]">Statut Pool :</span>
                <span className="text-[#4edea3]">Actif (10/10 sessions)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#171f33] rounded-xl border border-[#222a3d] p-5 space-y-3">
            <h4 className="font-sans text-xs text-[#bbcabf] font-bold uppercase tracking-wider">
              Maintenance &amp; Réinitialisation
            </h4>
            <p className="font-sans text-xs text-[#bbcabf]">
              Permet de réinitialiser la base de données locale au catalogue standard de 2 840 tirages.
            </p>
            <button
              onClick={onResetData}
              className="w-full py-2 bg-[#222a3d] hover:bg-[#93000a]/25 text-[#ffb4ab] border border-[#ffb4ab]/30 rounded-lg font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réinitialiser le jeu de données</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
