import { useState } from 'react';
import { Download, FileText, FileCode, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { Draw, GameType } from '../types';

interface ExportViewProps {
  draws: Draw[];
}

export default function ExportView({ draws }: ExportViewProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [includeHash, setIncludeHash] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    let filtered = draws;
    if (selectedGame !== 'all') {
      filtered = draws.filter((d) => d.game === selectedGame);
    }

    let fileContent = '';
    let mimeType = '';
    let fileName = '';

    if (format === 'csv') {
      const headers = ['Tirage_ID', 'Jeu', 'Date', 'Heure', 'Balle1', 'Balle2', 'Balle3', 'Balle4', 'Balle5', 'Somme', 'Pairs', 'Impairs'];
      if (includeHash) headers.push('SHA256_Hash');
      
      const rows = filtered.map((d) => {
        const r = [d.drawNumber, d.gameName, d.date, d.time, ...d.balls, d.sum, d.evenCount, d.oddCount];
        if (includeHash) r.push(d.hash);
        return r.join(';');
      });

      fileContent = [headers.join(';'), ...rows].join('\n');
      mimeType = 'text/csv;charset=utf-8;';
      fileName = `lotto_ci_tirages_${Date.now()}.csv`;
    } else {
      fileContent = JSON.stringify(filtered, null, 2);
      mimeType = 'application/json;charset=utf-8;';
      fileName = `lotto_ci_tirages_${Date.now()}.json`;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#171f33] p-5 rounded-xl border border-[#222a3d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#4edea3]" />
            <h2 className="font-sans text-lg text-[#dae2fd] font-bold">
              Exportation des Données &amp; Rapports
            </h2>
            <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
              ISO-27001 Format
            </span>
          </div>
          <p className="font-sans text-xs text-[#bbcabf] mt-1">
            Générez des archives brutes ou des rapports d'audit pour intégration externe ou analyse locale.
          </p>
        </div>
      </div>

      {/* Export Form Container */}
      <div className="bg-[#171f33] rounded-xl border border-[#222a3d] p-6 space-y-6 max-w-3xl">
        {/* Format Selector */}
        <div>
          <label className="font-mono text-xs text-[#bbcabf] block mb-2 font-semibold">
            Format de sortie :
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('csv')}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                format === 'csv'
                  ? 'border-[#4edea3] bg-[#10b981]/15 text-[#dae2fd]'
                  : 'border-[#222a3d] bg-[#131b2e] text-[#bbcabf] hover:border-[#4edea3]/40'
              }`}
            >
              <FileText className="w-5 h-5 text-[#4edea3]" />
              <div className="text-left font-mono text-xs">
                <div className="font-bold text-[#dae2fd]">CSV Normalisé (.csv)</div>
                <div className="text-[11px] text-[#bbcabf]">Compatible Excel, Sheets et pandas</div>
              </div>
            </button>

            <button
              onClick={() => setFormat('json')}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                format === 'json'
                  ? 'border-[#7bd0ff] bg-[#19aee8]/15 text-[#dae2fd]'
                  : 'border-[#222a3d] bg-[#131b2e] text-[#bbcabf] hover:border-[#7bd0ff]/40'
              }`}
            >
              <FileCode className="w-5 h-5 text-[#7bd0ff]" />
              <div className="text-left font-mono text-xs">
                <div className="font-bold text-[#dae2fd]">JSON Schéma (.json)</div>
                <div className="text-[11px] text-[#bbcabf]">Structure complète avec métadonnées</div>
              </div>
            </button>
          </div>
        </div>

        {/* Filter Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs text-[#bbcabf] block mb-1.5 font-semibold">
              Jeux à inclure :
            </label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full bg-[#131b2e] text-[#dae2fd] p-2.5 rounded-lg border border-[#222a3d] font-mono text-xs focus:outline-none focus:border-[#4edea3]"
            >
              <option value="all">Tous les 6 jeux LONACI</option>
              <option value="national">National CI uniquement</option>
              <option value="diamant">Loto Diamant uniquement</option>
              <option value="etoile">Loto Étoile uniquement</option>
              <option value="espoir">Loto Espoir uniquement</option>
              <option value="fortune">Loto Fortune uniquement</option>
              <option value="bambou">Loto Bambou uniquement</option>
            </select>
          </div>

          <div>
            <label className="font-mono text-xs text-[#bbcabf] block mb-1.5 font-semibold">
              Période temporelle :
            </label>
            <select className="w-full bg-[#131b2e] text-[#dae2fd] p-2.5 rounded-lg border border-[#222a3d] font-mono text-xs focus:outline-none">
              <option>Totalité de l'archive active (24 Mois)</option>
              <option>Derniers 12 Mois (2025-2026)</option>
              <option>Derniers 30 Jours</option>
            </select>
          </div>
        </div>

        {/* Checkbox Options */}
        <div className="bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] space-y-2">
          <label className="flex items-center gap-2.5 font-mono text-xs text-[#dae2fd] cursor-pointer">
            <input
              type="checkbox"
              checked={includeHash}
              onChange={(e) => setIncludeHash(e.target.checked)}
              className="accent-[#10b981] w-4 h-4 rounded"
            />
            <span>Inclure les signatures cryptographiques SHA-256 de chaque tirage</span>
          </label>
        </div>

        {/* Download Action */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleDownload}
            className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] px-6 py-3 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger l'export ({draws.length} tirages)</span>
          </button>

          {downloadSuccess && (
            <div className="flex items-center gap-2 text-[#4edea3] font-mono text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Fichier généré et téléchargé avec succès !</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
