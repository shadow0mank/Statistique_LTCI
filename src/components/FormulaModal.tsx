import { X, Calculator, Check, Info } from 'lucide-react';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FormulaModal({ isOpen, onClose }: FormulaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#2d3449] flex items-center justify-between bg-[#131b2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 flex items-center justify-center text-[#4edea3] border border-[#10b981]/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg text-[#dae2fd]">
                Formule de l'Indice Statistique (0 - 100)
              </h3>
              <p className="font-sans text-xs text-[#bbcabf]">
                Pondération matricielle multicritère conforme LONACI ISO-27001
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
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] space-y-3 font-mono text-xs">
            <div className="text-[#4edea3] font-bold">
              Score = (H × 0.30) + (T × 0.20) + (E × 0.15) + (S × 0.15) + (F × 0.20)
            </div>
            <p className="font-sans text-xs text-[#bbcabf] leading-relaxed">
              L'indice statistique normalise le comportement de chaque numéro entre 1 et 90 sur un
              horizon glissant de 24 mois sans jamais prétendre à un pouvoir prédictif certain.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d] flex items-start gap-3">
              <span className="font-mono text-xs font-bold text-[#4edea3] bg-[#00422b] px-2 py-0.5 rounded">
                30%
              </span>
              <div>
                <h4 className="font-sans font-semibold text-xs text-[#dae2fd]">
                  Historique Long Terme (24 Mois)
                </h4>
                <p className="font-sans text-[11px] text-[#bbcabf]">
                  Volume d'apparitions brutes sur l'ensemble des 2 840 tirages vérifiés.
                </p>
              </div>
            </div>

            <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d] flex items-start gap-3">
              <span className="font-mono text-xs font-bold text-[#ec6a06] bg-[#4a1c00] px-2 py-0.5 rounded">
                20%
              </span>
              <div>
                <h4 className="font-sans font-semibold text-xs text-[#dae2fd]">
                  Tendance Récente (Derniers 30 Jours)
                </h4>
                <p className="font-sans text-[11px] text-[#bbcabf]">
                  Vélocité des sorties récentes pour détecter les accélérations ou phases de chauffe.
                </p>
              </div>
            </div>

            <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d] flex items-start gap-3">
              <span className="font-mono text-xs font-bold text-[#7bd0ff] bg-[#003e55] px-2 py-0.5 rounded">
                15%
              </span>
              <div>
                <h4 className="font-sans font-semibold text-xs text-[#dae2fd]">
                  Écart Normalisé (Délai sans sortie)
                </h4>
                <p className="font-sans text-[11px] text-[#bbcabf]">
                  Mesure du retard statistique par rapport à l'écart moyen espéré (loi binomiale).
                </p>
              </div>
            </div>

            <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d] flex items-start gap-3">
              <span className="font-mono text-xs font-bold text-[#bbcabf] bg-[#222a3d] px-2 py-0.5 rounded">
                15%
              </span>
              <div>
                <h4 className="font-sans font-semibold text-xs text-[#dae2fd]">
                  Stabilité Variance (6 Mois)
                </h4>
                <p className="font-sans text-[11px] text-[#bbcabf]">
                  Régularité des intervalles entre deux apparitions consécutives.
                </p>
              </div>
            </div>

            <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d] flex items-start gap-3">
              <span className="font-mono text-xs font-bold text-[#6ffbbe] bg-[#003824] px-2 py-0.5 rounded">
                20%
              </span>
              <div>
                <h4 className="font-sans font-semibold text-xs text-[#dae2fd]">
                  Corrélation Horaire (10h, 13h, 16h, 19h)
                </h4>
                <p className="font-sans text-[11px] text-[#bbcabf]">
                  Sur-représentation empirique du numéro selon le créneau de jeu spécifique.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#ec6a06]/10 border border-[#ec6a06]/25 rounded-lg flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#ec6a06] flex-shrink-0 mt-0.5" />
            <p className="font-sans text-[11px] text-[#ffb690] leading-relaxed">
              Rappel légal : Même un score de 94/100 ne modifie pas la probabilité intrinsèque de tirage
              (1 chance sur 90 à chaque boule tirée).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2d3449] bg-[#131b2e] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#10b981] hover:bg-[#4edea3] text-[#003824] font-mono text-xs font-bold transition-colors"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
}
