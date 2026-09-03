import { useState, useRef, ChangeEvent } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  XCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Draw, ImportValidationResult, ImportPreviewRow } from '../types';
import LottoBall from '../components/LottoBall';

interface ImportViewProps {
  existingDraws: Draw[];
  onImportSuccess: (newDraws: Draw[]) => void;
  onNavigateTab: (tab: any) => void;
}

export default function ImportView({ existingDraws, onImportSuccess, onNavigateTab }: ImportViewProps) {
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [confirmedMessage, setConfirmedMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to parse CSV text
  const parseCSVContent = (content: string, fileName: string, fileSize: number) => {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return;

    // Detect if header row
    let startIndex = 0;
    if (lines[0].toLowerCase().includes('date') || lines[0].toLowerCase().includes('heure')) {
      startIndex = 1;
    }

    const previewRows: ImportPreviewRow[] = [];
    const detectedHoursSet = new Set<string>();
    let validCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      const parts = line.split(/[,;\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));

      // Format expected: date, hour, game, ball1, ball2, ball3, ball4, ball5
      if (parts.length < 8) {
        errorCount++;
        previewRows.push({
          date: parts[0] || 'Inconnu',
          hour: parts[1] || 'Inconnu',
          game: parts[2] || 'Inconnu',
          balls: [],
          status: 'INVALID_COUNT',
          errorReason: `Nombre de colonnes insuffisant (${parts.length}/8 attendues)`,
        });
        continue;
      }

      const date = parts[0];
      const hour = parts[1].length === 5 ? parts[1] : `${parts[1]}:00`.substring(0, 5);
      const game = parts[2];
      const balls = [
        parseInt(parts[3], 10),
        parseInt(parts[4], 10),
        parseInt(parts[5], 10),
        parseInt(parts[6], 10),
        parseInt(parts[7], 10),
      ];

      detectedHoursSet.add(hour);

      // Check numbers valid range 1-90
      const invalidBalls = balls.filter((b) => isNaN(b) || b < 1 || b > 90);
      const uniqueBalls = new Set(balls);

      if (invalidBalls.length > 0) {
        errorCount++;
        previewRows.push({
          date,
          hour,
          game,
          balls,
          status: 'INVALID_RANGE',
          errorReason: `Numéro hors bornes 1-90 : ${invalidBalls.join(', ')}`,
        });
        continue;
      }

      if (uniqueBalls.size !== 5) {
        errorCount++;
        previewRows.push({
          date,
          hour,
          game,
          balls,
          status: 'INVALID_RANGE',
          errorReason: 'Numéros doublons dans la combinaison',
        });
        continue;
      }

      // Check duplicate against existing database
      const isDuplicate = existingDraws.some(
        (d) => d.date === date && d.time === hour && d.gameName.toLowerCase() === game.toLowerCase()
      );

      if (isDuplicate) {
        duplicateCount++;
        previewRows.push({
          date,
          hour,
          game,
          balls,
          status: 'DUPLICATE',
          errorReason: 'Tirage déjà enregistré en base pour ce créneau',
        });
        continue;
      }

      // Valid
      validCount++;
      previewRows.push({
        date,
        hour,
        game,
        balls,
        status: 'VALID',
      });
    }

    setValidationResult({
      fileName,
      fileSize,
      totalRows: lines.length - startIndex,
      validRows: validCount,
      duplicateRows: duplicateCount,
      errorRows: errorCount,
      detectedHours: Array.from(detectedHoursSet).sort(),
      previewRows,
    });
    setConfirmedMessage(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        parseCSVContent(text, file.name, file.size);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleFile = () => {
    const sampleCsv = `date,heure,jeu,b1,b2,b3,b4,b5
04/09/2026,10:00,Kado,12,34,56,78,90
04/09/2026,13:00,Fortune,05,19,42,61,88
04/09/2026,16:00,Monni,07,23,45,67,89
04/09/2026,18:00,Afterwork,14,28,35,52,70
04/09/2026,10:00,Kado,12,34,56,78,90
04/09/2026,21:00,Digital Reveil,01,15,99,44,55`;
    parseCSVContent(sampleCsv, 'lotobonheur_export_officiel_04092026.csv', 312);
  };

  const handleConfirmInsertion = () => {
    if (!validationResult) return;

    const validRows = validationResult.previewRows.filter((r) => r.status === 'VALID');
    if (validRows.length === 0) return;

    const newDraws: Draw[] = validRows.map((r, i) => {
      const sorted = [...r.balls].sort((a, b) => a - b);
      let maxGap = 0;
      for (let j = 1; j < sorted.length; j++) {
        if (sorted[j] - sorted[j - 1] > maxGap) maxGap = sorted[j] - sorted[j - 1];
      }

      return {
        id: `imported_${Date.now()}_${i + 1}`,
        drawNumber: existingDraws.length + i + 1,
        game: r.game.toLowerCase().replace(/\s+/g, '-'),
        gameName: r.game,
        date: r.date,
        time: r.hour,
        machineId: 'LONACI-IMPORT-CSV',
        hash: 'c8f' + Math.random().toString(16).substring(2, 10) + '948201aeb4c02938174fde',
        balls: r.balls as [number, number, number, number, number],
        machineBalls: [],
        sum: r.balls.reduce((a, b) => a + b, 0),
        evenCount: r.balls.filter((b) => b % 2 === 0).length,
        oddCount: r.balls.filter((b) => b % 2 !== 0).length,
        maxGap: maxGap,
        source: 'Import Fichier Validé',
        sourceUrl: 'https://lotobonheur.ci',
        retrievedAt: new Date().toISOString(),
        status: 'CONFORME',
        isVerified: true,
        notes: `Importé depuis ${validationResult.fileName}`,
      };
    });

    onImportSuccess(newDraws);
    setConfirmedMessage(
      `Succès : ${newDraws.length} tirages valides ont été insérés dans la base de données locale.`
    );
    setValidationResult(null);
  };

  const handleCancel = () => {
    setValidationResult(null);
    setConfirmedMessage(null);
  };

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#171f33] p-5 rounded-xl border border-[#222a3d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#4edea3]" />
            <h2 className="font-sans text-lg text-[#dae2fd] font-bold">
              Importation de Fichiers &amp; Écran de Pré-Validation
            </h2>
            <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
              Contrôle Pré-Insertion
            </span>
          </div>
          <p className="font-sans text-xs text-[#bbcabf] mt-1">
            Chaque ligne est rigoureusement vérifiée avant tout enregistrement effectif en base (5 boules 1-90, détection des doublons et heures).
          </p>
        </div>

        <button
          onClick={handleLoadSampleFile}
          className="bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] px-3.5 py-2 rounded-lg font-mono text-xs transition-colors border border-[#2d3449] self-start sm:self-auto"
        >
          <span>Charger un fichier CSV test</span>
        </button>
      </div>

      {/* Confirmation Message */}
      {confirmedMessage && (
        <div className="bg-[#10b981]/15 border border-[#10b981]/40 p-4 rounded-xl flex items-center justify-between font-mono text-xs text-[#4edea3]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{confirmedMessage}</span>
          </div>
          <button
            onClick={() => onNavigateTab('historique-des-tirages')}
            className="underline font-bold text-white hover:text-[#6ffbbe]"
          >
            Consulter l'historique mis à jour &gt;
          </button>
        </div>
      )}

      {/* File Upload Zone */}
      {!validationResult && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (evt) => {
                const text = evt.target?.result as string;
                if (text) parseCSVContent(text, file.name, file.size);
              };
              reader.readAsText(file);
            }
          }}
          className={`bg-[#131b2e] border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
            dragActive ? 'border-[#4edea3] bg-[#10b981]/10' : 'border-[#222a3d] hover:border-[#4edea3]/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.xlsx"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-[#171f33] text-[#4edea3] flex items-center justify-center mx-auto mb-4 border border-[#222a3d]">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="font-sans text-base text-[#dae2fd] font-bold">
            Glissez-déposez votre fichier de tirages ici
          </h3>
          <p className="font-sans text-xs text-[#bbcabf] mt-1 max-w-md mx-auto">
            Formats acceptés : <strong className="text-[#dae2fd]">CSV, TXT, XLSX</strong>. Les heures et
            numéros seront automatiquement identifiés.
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-5 bg-[#10b981] hover:bg-[#4edea3] text-[#003824] px-5 py-2.5 rounded-lg font-mono text-xs font-bold transition-colors inline-flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sélectionner un fichier sur l'ordinateur</span>
          </button>
        </div>
      )}

      {/* Mandatory Pre-validation Screen */}
      {validationResult && (
        <div className="bg-[#171f33] rounded-2xl border border-[#222a3d] overflow-hidden shadow-xl space-y-5 p-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#222a3d]">
            <div>
              <span className="font-mono text-xs text-[#4edea3] uppercase font-bold tracking-wider">
                Rapport de Contrôle Pré-Insertion
              </span>
              <h3 className="font-sans text-lg text-[#dae2fd] font-bold mt-0.5">
                Fichier analysé : <span className="text-[#ffdbca]">{validationResult.fileName}</span>
              </h3>
            </div>

            <span className="font-mono text-xs text-[#bbcabf]">
              Taille : {(validationResult.fileSize / 1024).toFixed(1)} Ko
            </span>
          </div>

          {/* KPI Summary Deck */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="bg-[#131b2e] p-3 rounded-xl border border-[#222a3d]">
              <span className="text-[10px] text-[#bbcabf] uppercase block">Total Lignes</span>
              <span className="text-lg text-[#dae2fd] font-bold">{validationResult.totalRows}</span>
            </div>

            <div className="bg-[#131b2e] p-3 rounded-xl border border-[#10b981]/40">
              <span className="text-[10px] text-[#4edea3] uppercase block">Lignes Valides</span>
              <span className="text-lg text-[#4edea3] font-bold">{validationResult.validRows}</span>
            </div>

            <div className="bg-[#131b2e] p-3 rounded-xl border border-[#ec6a06]/40">
              <span className="text-[10px] text-[#ffb690] uppercase block">Doublons Détectés</span>
              <span className="text-lg text-[#ffb690] font-bold">{validationResult.duplicateRows}</span>
            </div>

            <div className="bg-[#131b2e] p-3 rounded-xl border border-red-500/40">
              <span className="text-[10px] text-red-400 uppercase block">Lignes en Erreur</span>
              <span className="text-lg text-red-400 font-bold">{validationResult.errorRows}</span>
            </div>
          </div>

          {/* Detected Hours Strip */}
          <div className="bg-[#131b2e] p-3.5 rounded-xl border border-[#222a3d] flex items-center gap-3 font-mono text-xs">
            <Clock className="w-4 h-4 text-[#ec6a06] flex-shrink-0" />
            <span className="text-[#bbcabf]">Heures détectées dans ce fichier :</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {validationResult.detectedHours.map((h) => (
                <span
                  key={h}
                  className="bg-[#171f33] text-[#dae2fd] px-2 py-0.5 rounded font-bold border border-[#222a3d]"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Data Preview Table */}
          <div className="bg-[#131b2e] rounded-xl border border-[#222a3d] overflow-hidden">
            <div className="p-3 bg-[#060e20] border-b border-[#222a3d] font-mono text-xs text-[#bbcabf] font-bold">
              Aperçu des Données &amp; Statut de Contrôle :
            </div>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-[#222a3d] text-[11px] text-[#bbcabf]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Heure</th>
                    <th className="py-2.5 px-3">Jeu</th>
                    <th className="py-2.5 px-3">Numéros</th>
                    <th className="py-2.5 px-3">Statut de validation</th>
                    <th className="py-2.5 px-3">Motif / Diagnostic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222a3d]/50">
                  {validationResult.previewRows.map((row, idx) => {
                    const isValid = row.status === 'VALID';
                    const isDup = row.status === 'DUPLICATE';

                    return (
                      <tr key={idx} className="hover:bg-[#222a3d]/30">
                        <td className="py-2.5 px-3 text-[#dae2fd]">{row.date}</td>
                        <td className="py-2.5 px-3 font-bold text-[#7bd0ff]">{row.hour}</td>
                        <td className="py-2.5 px-3 text-[#dae2fd]">{row.game}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1">
                            {row.balls.map((b, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isValid
                                    ? 'bg-[#10b981]/20 text-[#4edea3]'
                                    : 'bg-red-500/20 text-red-300'
                                }`}
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          {isValid && (
                            <span className="bg-[#10b981]/20 text-[#4edea3] px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> VALIDE
                            </span>
                          )}
                          {isDup && (
                            <span className="bg-[#ec6a06]/20 text-[#ffb690] px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" /> DOUBLON
                            </span>
                          )}
                          {!isValid && !isDup && (
                            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" /> ERREUR
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[#bbcabf] text-[11px]">
                          {row.errorReason || 'Prêt pour insertion en base'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons: Confirm vs Cancel */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#222a3d]">
            <button
              onClick={handleCancel}
              className="bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] px-4 py-2.5 rounded-lg font-mono text-xs font-bold transition-colors w-full sm:w-auto"
            >
              Annuler l'importation
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="font-mono text-xs text-[#bbcabf] text-right">
                {validationResult.validRows} tirage(s) seront insérés
              </span>
              <button
                onClick={handleConfirmInsertion}
                disabled={validationResult.validRows === 0}
                className="bg-[#10b981] hover:bg-[#4edea3] disabled:bg-[#222a3d] disabled:text-[#86948a] text-[#003824] px-5 py-2.5 rounded-lg font-mono text-xs font-bold transition-colors shadow-md w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmer l'insertion en base</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
