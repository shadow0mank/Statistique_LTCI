import { X, CheckCircle2, Copy, ShieldCheck, Download, Hash } from 'lucide-react';
import { useState } from 'react';
import { Draw } from '../types';
import LottoBall from './LottoBall';

interface DrawReportModalProps {
  draw: Draw | null;
  onClose: () => void;
}

export default function DrawReportModal({ draw, onClose }: DrawReportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!draw) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(draw.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#2d3449] flex items-center justify-between bg-[#131b2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ec6a06]/15 flex items-center justify-center text-[#ffb690] border border-[#ec6a06]/30">
              <ShieldCheck className="w-5 h-5 text-[#ffb690]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-bold text-lg text-[#dae2fd]">
                  Rapport Officiel de Tirage #{draw.drawNumber}
                </h3>
                <span className="font-mono text-[10px] bg-[#10b981] text-[#00422b] px-2 py-0.5 rounded-full font-bold uppercase">
                  Validé LONACI
                </span>
              </div>
              <p className="font-sans text-xs text-[#bbcabf]">
                {draw.gameName} • {draw.date} à {draw.time} • {draw.machineId}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Balls Row */}
          <div className="bg-[#131b2e] p-6 rounded-xl border border-[#222a3d] flex flex-col items-center justify-center">
            <span className="font-mono text-[11px] text-[#bbcabf] uppercase tracking-wider mb-4">
              Combinaison Gagnante Enregistrée
            </span>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {draw.balls.map((num, idx) => (
                <LottoBall
                  key={idx}
                  number={num}
                  size="xl"
                  label={`Balle #${idx + 1}`}
                  isHot={num === 27 || num === 12}
                />
              ))}
            </div>
          </div>

          {/* Draw Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d] text-center">
              <span className="font-mono text-[10px] text-[#bbcabf] uppercase block">Somme Totale</span>
              <span className="font-mono text-xl font-bold text-[#dae2fd]">{draw.sum}</span>
            </div>
            <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d] text-center">
              <span className="font-mono text-[10px] text-[#bbcabf] uppercase block">Parité</span>
              <span className="font-mono text-sm font-bold text-[#4edea3]">
                {draw.evenCount} Pairs / {draw.oddCount} Impairs
              </span>
            </div>
            <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d] text-center">
              <span className="font-mono text-[10px] text-[#bbcabf] uppercase block">Écart Max</span>
              <span className="font-mono text-xl font-bold text-[#ffb690]">{draw.maxGap}</span>
            </div>
            <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d] text-center">
              <span className="font-mono text-[10px] text-[#bbcabf] uppercase block">Contrôle Machine</span>
              <span className="font-mono text-sm font-bold text-[#7bd0ff]">{draw.machineId}</span>
            </div>
          </div>

          {/* Cryptographic Hash Section */}
          <div className="bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#bbcabf] flex items-center gap-1.5 font-semibold">
                <Hash className="w-3.5 h-3.5 text-[#7bd0ff]" /> Empreinte Numérique SHA-256
              </span>
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1.5 font-mono text-xs text-[#4edea3] hover:underline"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Copié dans le presse-papier !
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copier l'empreinte
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-[11px] bg-[#060e20] p-2.5 rounded-lg text-[#dae2fd]/80 break-all select-all border border-[#222a3d]">
              {draw.hash}
            </div>
            <p className="font-sans text-[11px] text-[#bbcabf]/80 leading-relaxed pt-1">
              Cette signature cryptographique certifie que les résultats n'ont subi aucune altération
              depuis la publication par la LONACI.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2d3449] bg-[#131b2e] flex items-center justify-between">
          <span className="font-mono text-[11px] text-[#bbcabf]">
            Enregistré sous protocole ISO-27001
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] font-mono text-xs font-semibold transition-colors"
          >
            Fermer le rapport
          </button>
        </div>
      </div>
    </div>
  );
}
