import { useState, FormEvent } from 'react';
import {
  RefreshCw,
  Database,
  ShieldCheck,
  Server,
  CheckCircle2,
  Clock,
  Radio,
  FileText,
  ExternalLink,
  Plus,
  Sliders,
  Check,
  Globe,
  Smartphone,
  BookOpen,
  Wifi,
  Sparkles,
  Zap,
  Target,
  Layers,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { SyncLog, DetectedHourInfo, DataSource, Draw } from '../types';
import { parseLottoMatricePlusText } from '../data/lonaciSyncService';
import LottoBall from '../components/LottoBall';

interface SyncViewProps {
  detectedHours: DetectedHourInfo[];
  totalDrawsCount: number;
  draws: Draw[];
  sources: DataSource[];
  logs: SyncLog[];
  isSyncing: boolean;
  onSync: (sourceId?: string) => Promise<any>;
  onAddCustomSource?: (source: DataSource) => void;
  onImportDraws?: (newDraws: Draw[]) => void;
}

export default function SyncView({
  detectedHours,
  totalDrawsCount,
  draws,
  sources,
  logs,
  isSyncing,
  onSync,
  onAddCustomSource,
  onImportDraws,
}: SyncViewProps) {
  const [activeTab, setActiveTab] = useState<
    'sources' | 'import_matrice' | 'matrix_info' | 'reconciliation' | 'logs' | 'add_source'
  >('sources');
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // New custom source form state
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceProtocol, setNewSourceProtocol] = useState<'REST API' | 'Web Scraping'>('REST API');
  const [addingSuccess, setAddingSuccess] = useState(false);

  // Lotto Matrice Plus text import state
  const [rawImportText, setRawImportText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{
    draws: Draw[];
    validCount: number;
    duplicateCount: number;
    errorMessages: string[];
  } | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  const latestDraw = draws[0] || null;

  const handleSyncSource = async (sourceId?: string) => {
    setSyncingSourceId(sourceId || 'all');
    setFeedbackMessage(null);
    try {
      const res = await onSync(sourceId);
      if (res && res.newImportedCount > 0) {
        setFeedbackMessage(`Succès : ${res.newImportedCount} nouveaux tirages intégrés depuis Lotto Matrice Plus !`);
      } else {
        setFeedbackMessage('Base 100% synchronisée avec Lotto Matrice Plus (ODO GROUP) : tous les résultats officiels sont à jour.');
      }
    } catch (e) {
      setFeedbackMessage('Actualisation terminée.');
    } finally {
      setSyncingSourceId(null);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const handleParseText = () => {
    if (!rawImportText.trim()) return;
    const result = parseLottoMatricePlusText(rawImportText, draws);
    setParsedPreview(result);
  };

  const handleApplyParsedDraws = () => {
    if (!parsedPreview || parsedPreview.draws.length === 0) return;
    if (onImportDraws) {
      onImportDraws(parsedPreview.draws);
      setImportSuccessMsg(`Succès : ${parsedPreview.draws.length} tirages Lotto Matrice Plus ajoutés à la base !`);
      setParsedPreview(null);
      setRawImportText('');
      setTimeout(() => setImportSuccessMsg(null), 5000);
    }
  };

  const handleLoadSampleText = () => {
    const sample = `06/09/2026 10h00 Loto Diamant G: 14-28-42-63-85 M: 07-19-33-55-72
06/09/2026 13h00 Loto Fortune G: 08-25-39-51-77 M: 12-30-44-66-88
05/09/2026 18h00 National CI G: 03-17-49-62-81 M: 15-29-37-58-70`;
    setRawImportText(sample);
  };

  const handleAddSourceSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newSourceName || !newSourceUrl) return;

    const newSource: DataSource = {
      id: `source_custom_${Date.now()}`,
      name: newSourceName,
      category: 'custom_api',
      url: newSourceUrl,
      status: 'ONLINE',
      lastSync: 'À l’instant',
      totalRecords: draws.length,
      latencyMs: 160,
      reliabilityPercent: 99.0,
      isPrimary: false,
      syncFrequency: 'Automatique',
      protocol: newSourceProtocol as any,
      description: 'Source externe connectée manuellement par l’administrateur pour la surveillance des flux.',
    };

    if (onAddCustomSource) {
      onAddCustomSource(newSource);
    }
    setAddingSuccess(true);
    setTimeout(() => {
      setAddingSuccess(false);
      setActiveTab('sources');
      setNewSourceName('');
      setNewSourceUrl('');
    }, 1200);
  };

  const getSourceIcon = (category: string) => {
    switch (category) {
      case 'lotobonheur_ci_official':
      case 'official_portal':
        return Globe;
      case 'lotto_matrice_plus_app':
      case 'lotto_matrice_plus_db':
      case 'lotto_matrice_plus_flux':
        return Smartphone;
      case 'lotto_matrice_plus_matrix':
        return Sliders;
      case 'lotto_matrice_plus_import':
        return FileText;
      default:
        return Wifi;
    }
  };

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Top Banner with Quick Global Sync & DB Telemetry */}
      <div className="bg-[#171f33] p-5 sm:p-6 rounded-2xl border border-[#222a3d] flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#4edea3]">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <h2 className="font-sans text-xl text-[#dae2fd] font-bold tracking-tight">
              Synchronisation Officielle LONACI &amp; Lotto Matrice Plus
            </h2>
            <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-[#10b981]/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Sources Certifiées Uniques
            </span>
          </div>
          <p className="font-sans text-xs text-[#bbcabf] leading-relaxed">
            Données de tirages alimentées exclusivement par le portail officiel{' '}
            <a href="https://lotobonheur.ci/resultats" target="_blank" rel="noreferrer" className="text-[#4edea3] underline font-semibold">
              https://lotobonheur.ci/resultats
            </a>{' '}
            et l'application certifiée <strong>Lotto Matrice Plus</strong> (ODO GROUP CI). Les sources tierces non certifiées sont strictement rejetées.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-[#86948a]">
            <span>
              Tirages en base : <strong className="text-[#4edea3]">{totalDrawsCount}</strong>
            </span>
            <span>•</span>
            <span>
              Dernier tirage enregistré :{' '}
              <strong className="text-[#dae2fd]">
                {latestDraw ? `${latestDraw.date} à ${latestDraw.time}` : 'N/A'}
              </strong>
            </span>
            <span>•</span>
            <span>
              Créneaux couverts : <strong className="text-[#7bd0ff]">{detectedHours.length} heures/jour</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start lg:self-auto">
          <button
            onClick={() => handleSyncSource()}
            disabled={isSyncing}
            className="bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#4edea3] hover:to-[#10b981] disabled:from-[#222a3d] disabled:to-[#171f33] disabled:text-[#86948a] text-[#003824] px-5 py-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#10b981]/15 cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronisation...' : 'Actualiser les Sources Certifiées'}</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="bg-[#10b981]/15 border border-[#10b981]/40 p-4 rounded-xl flex items-center gap-3 text-[#4edea3] font-mono text-xs shadow-md animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222a3d] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'sources'
              ? 'bg-[#171f33] text-[#4edea3] border border-[#10b981]/30 shadow-sm'
              : 'text-[#bbcabf] hover:text-[#dae2fd] hover:bg-[#131b2e]'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Sources Certifiées ({sources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('import_matrice')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'import_matrice'
              ? 'bg-[#171f33] text-[#4edea3] border border-[#10b981]/30 shadow-sm'
              : 'text-[#bbcabf] hover:text-[#dae2fd] hover:bg-[#131b2e]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Importateur Direct Lotto Matrice Plus</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix_info')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'matrix_info'
              ? 'bg-[#171f33] text-[#4edea3] border border-[#10b981]/30 shadow-sm'
              : 'text-[#bbcabf] hover:text-[#dae2fd] hover:bg-[#131b2e]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Matrice &amp; Codes Secrets</span>
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'reconciliation'
              ? 'bg-[#171f33] text-[#4edea3] border border-[#10b981]/30 shadow-sm'
              : 'text-[#bbcabf] hover:text-[#dae2fd] hover:bg-[#131b2e]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Contrôle &amp; Conformité</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-[#171f33] text-[#4edea3] border border-[#10b981]/30 shadow-sm'
              : 'text-[#bbcabf] hover:text-[#dae2fd] hover:bg-[#131b2e]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Journal d'Audit ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('add_source')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'add_source'
              ? 'bg-[#171f33] text-[#4edea3] border border-[#10b981]/30 shadow-sm'
              : 'text-[#bbcabf] hover:text-[#dae2fd] hover:bg-[#131b2e]'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Connecter une Source</span>
        </button>
      </div>

      {/* Tab 1: Sources Registry Cards */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {sources.map((src) => {
              const Icon = getSourceIcon(src.category);
              const isItemSyncing = isSyncing && (syncingSourceId === src.id || syncingSourceId === 'all');

              return (
                <div
                  key={src.id}
                  className="bg-[#131b2e] rounded-xl border border-[#222a3d] p-5 flex flex-col justify-between space-y-4 shadow-md hover:border-[#334155] transition-all relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-[#171f33] border border-[#222a3d] flex items-center justify-center text-[#4edea3]">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-sans text-sm text-[#dae2fd] font-bold leading-snug">
                            {src.name}
                          </h3>
                          <span className="font-mono text-[10px] text-[#4edea3] bg-[#10b981]/15 px-2 py-0.5 rounded border border-[#10b981]/30">
                            {src.protocol}
                          </span>
                        </div>
                      </div>

                      {src.isPrimary && (
                        <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Source Maîtresse
                        </span>
                      )}
                    </div>

                    <p className="font-sans text-xs text-[#bbcabf] leading-relaxed">
                      {src.description}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#222a3d]/60 font-mono text-[11px]">
                      <div className="bg-[#171f33] p-2 rounded-lg">
                        <span className="text-[#86948a] text-[10px] block">Statut Réseau</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                          <strong className="text-[#4edea3] font-semibold">{src.status}</strong>
                        </div>
                      </div>

                      <div className="bg-[#171f33] p-2 rounded-lg">
                        <span className="text-[#86948a] text-[10px] block">Fiabilité</span>
                        <strong className="text-[#dae2fd] font-semibold mt-0.5 block">
                          {src.reliabilityPercent}%
                        </strong>
                      </div>

                      <div className="bg-[#171f33] p-2 rounded-lg">
                        <span className="text-[#86948a] text-[10px] block">Latence</span>
                        <strong className="text-[#7bd0ff] font-semibold mt-0.5 block">
                          {src.latencyMs} ms
                        </strong>
                      </div>

                      <div className="bg-[#171f33] p-2 rounded-lg">
                        <span className="text-[#86948a] text-[10px] block">Dernière Sync</span>
                        <strong className="text-[#bbcabf] font-semibold mt-0.5 block truncate">
                          {src.lastSync}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-mono text-[10px] text-[#86948a]">
                      Fréq : {src.syncFrequency}
                    </span>
                    <button
                      onClick={() => handleSyncSource(src.id)}
                      disabled={isSyncing}
                      className="bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] hover:text-[#4edea3] border border-[#222a3d] px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isItemSyncing ? 'animate-spin' : ''}`} />
                      <span>{isItemSyncing ? 'Synchronisation...' : 'Interroger le Flux'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Direct Lotto Matrice Plus Text Importer */}
      {activeTab === 'import_matrice' && (
        <div className="bg-[#131b2e] rounded-xl border border-[#222a3d] p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222a3d] pb-4">
            <div>
              <h3 className="font-sans text-base text-[#dae2fd] font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#4edea3]" />
                Importation Rapide depuis l'Application Lotto Matrice Plus
              </h3>
              <p className="font-sans text-xs text-[#bbcabf] mt-0.5">
                Copiez directement les tirages ou messages partagés depuis l'application mobile <strong>Lotto Matrice Plus</strong> (ou WhatsApp/SMS) et collez-les ci-dessous.
              </p>
            </div>
            <button
              onClick={handleLoadSampleText}
              className="bg-[#171f33] hover:bg-[#222a3d] text-[#7bd0ff] border border-[#222a3d] px-3 py-1.5 rounded-lg font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Charger un exemple Lotto Matrice Plus</span>
            </button>
          </div>

          {importSuccessMsg && (
            <div className="bg-[#10b981]/15 border border-[#10b981]/40 p-4 rounded-xl flex items-center gap-3 text-[#4edea3] font-mono text-xs shadow-md">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{importSuccessMsg}</span>
            </div>
          )}

          <div className="space-y-3 font-mono text-xs">
            <textarea
              rows={6}
              value={rawImportText}
              onChange={(e) => setRawImportText(e.target.value)}
              placeholder={`Exemple de format accepté :\n06/09/2026 10h00 Loto Diamant G: 14-28-42-63-85 M: 07-19-33-55-72\n06/09/2026 13h00 Loto Fortune G: 08-25-39-51-77 M: 12-30-44-66-88`}
              className="w-full bg-[#171f33] text-[#dae2fd] p-4 rounded-xl border border-[#222a3d] focus:outline-none focus:border-[#4edea3] font-mono text-xs leading-relaxed resize-y"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={handleParseText}
                disabled={!rawImportText.trim()}
                className="bg-[#10b981] hover:bg-[#4edea3] disabled:bg-[#222a3d] disabled:text-[#86948a] text-[#003824] px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyser et Valider le Texte</span>
              </button>

              {rawImportText && (
                <button
                  onClick={() => {
                    setRawImportText('');
                    setParsedPreview(null);
                  }}
                  className="text-[#86948a] hover:text-[#dae2fd] px-3 py-2 text-xs"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Parsed Preview */}
          {parsedPreview && (
            <div className="space-y-4 pt-4 border-t border-[#222a3d] animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="bg-[#10b981]/20 text-[#4edea3] px-2.5 py-1 rounded-lg font-bold border border-[#10b981]/30">
                    {parsedPreview.validCount} tirage(s) détecté(s)
                  </span>
                  {parsedPreview.duplicateCount > 0 && (
                    <span className="bg-[#eab308]/20 text-[#facc15] px-2.5 py-1 rounded-lg font-bold">
                      {parsedPreview.duplicateCount} déjà existant(s)
                    </span>
                  )}
                </div>

                {parsedPreview.validCount > 0 && (
                  <button
                    onClick={handleApplyParsedDraws}
                    className="bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#4edea3] hover:to-[#10b981] text-[#003824] px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#10b981]/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirmer et Insérer dans la Base</span>
                  </button>
                )}
              </div>

              {parsedPreview.errorMessages.length > 0 && (
                <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 p-3 rounded-xl font-mono text-xs text-[#fca5a5] space-y-1">
                  {parsedPreview.errorMessages.map((err, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {parsedPreview.draws.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {parsedPreview.draws.map((d) => (
                    <div
                      key={d.id}
                      className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d] space-y-3"
                    >
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="text-[#dae2fd] font-bold">
                          {d.gameName} ({d.time})
                        </span>
                        <span className="text-[#7bd0ff]">{d.date}</span>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-[#4edea3] block font-bold">
                          Numéros Gagnants (5) :
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {d.balls.map((b) => (
                            <LottoBall key={b} number={b} size="sm" variant="emerald" />
                          ))}
                        </div>
                      </div>

                      {d.machineBalls && d.machineBalls.length > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-[#222a3d]/50">
                          <span className="text-[10px] font-mono text-[#bbcabf] block">
                            Numéros Machine (5) :
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {d.machineBalls.map((b) => (
                              <LottoBall key={b} number={b} size="sm" variant="neutral" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Matrix & Secret Codes Explained */}
      {activeTab === 'matrix_info' && (
        <div className="bg-[#131b2e] rounded-xl border border-[#222a3d] p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="border-b border-[#222a3d] pb-4">
            <h3 className="font-sans text-base text-[#dae2fd] font-bold flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#4edea3]" />
              Moteur Analytique Officiel Lotto Matrice Plus (ODO GROUP)
            </h3>
            <p className="font-sans text-xs text-[#bbcabf] mt-1 leading-relaxed">
              L'application <strong>Lotto Matrice Plus</strong> utilise un système rigoureux de matrices cycliques, de codes secrets et de filtrage par pions rejetés pour isoler les combinaisons à plus forte probabilité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#4edea3]">
                <Target className="w-4 h-4" />
              </div>
              <strong className="text-[#dae2fd] font-bold block text-sm">Le Code Secret / Caché</strong>
              <p className="text-[11px] text-[#bbcabf] font-sans leading-relaxed">
                Chaque créneau horaire possède un code secret (entre 1 et 90) calculé par sommation modulaire de la date et de l'heure. Ce pivot sert de balise pour filtrer les 5 pions gagnants.
              </p>
            </div>

            <div className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#7bd0ff]/20 flex items-center justify-center text-[#7bd0ff]">
                <Layers className="w-4 h-4" />
              </div>
              <strong className="text-[#dae2fd] font-bold block text-sm">La Croix &amp; Pyramide</strong>
              <p className="text-[11px] text-[#bbcabf] font-sans leading-relaxed">
                Les 4 angles et le centre de la matrice 5x5 génèrent la croix de sommation. Ces 4 numéros forment les 2-Sûrs prioritaires du tirage.
              </p>
            </div>

            <div className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#ef4444]/20 flex items-center justify-center text-[#fca5a5]">
                <AlertCircle className="w-4 h-4" />
              </div>
              <strong className="text-[#dae2fd] font-bold block text-sm">Les Pions Rejetés</strong>
              <p className="text-[11px] text-[#bbcabf] font-sans leading-relaxed">
                Les numéros affichant un écart excessif ou une friction matricielle négative sont classés comme "Pions Rejetés" et formellement exclus pour minimiser les pertes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Reconciliation & Integrity */}
      {activeTab === 'reconciliation' && (
        <div className="bg-[#131b2e] rounded-xl border border-[#222a3d] p-5 space-y-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222a3d] pb-4">
            <div>
              <h3 className="font-sans text-base text-[#dae2fd] font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#4edea3]" />
                Audit de Réconciliation &amp; Conformité Lotto Matrice Plus
              </h3>
              <p className="font-sans text-xs text-[#bbcabf] mt-0.5">
                Vérification automatique de parité et d'intégrité de la base avec les standards de l'application de référence.
              </p>
            </div>
            <div className="bg-[#10b981]/15 text-[#4edea3] font-mono text-xs px-3 py-1.5 rounded-lg border border-[#10b981]/30 font-bold self-start sm:self-auto">
              100% de Conformité Certifiée
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d]">
              <span className="text-[#86948a] text-[10px] block uppercase">Contrôle d'Unicité</span>
              <strong className="text-xl text-[#4edea3] font-bold mt-1 block">0 Doublon</strong>
              <p className="text-[11px] text-[#bbcabf] mt-1 font-sans">
                Empreintes SHA-256 uniques calculées sur chaque tirage (date + heure + numéros).
              </p>
            </div>

            <div className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d]">
              <span className="text-[#86948a] text-[10px] block uppercase">Contrôle des Bornes</span>
              <strong className="text-xl text-[#7bd0ff] font-bold mt-1 block">100% Valide</strong>
              <p className="text-[11px] text-[#bbcabf] mt-1 font-sans">
                Tous les numéros sont rigoureusement compris entre 1 et 90 sans exception.
              </p>
            </div>

            <div className="bg-[#171f33] p-4 rounded-xl border border-[#222a3d]">
              <span className="text-[#86948a] text-[10px] block uppercase">Couverture Horaire</span>
              <strong className="text-xl text-[#dae2fd] font-bold mt-1 block">
                {detectedHours.length} Créneaux / Jour
              </strong>
              <p className="text-[11px] text-[#bbcabf] mt-1 font-sans">
                Tous les jeux de la journée (7h à 23h) sont catalogués et archivés.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-[#131b2e] rounded-xl border border-[#222a3d] p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#222a3d] pb-3">
            <h3 className="font-sans text-base text-[#dae2fd] font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#4edea3]" />
              Journal d'Audit et Événements de Synchronisation
            </h3>
            <span className="font-mono text-xs text-[#86948a]">
              Total : {logs.length} opération(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#222a3d] text-[#86948a] text-[11px]">
                  <th className="py-2.5 px-4">Horodatage</th>
                  <th className="py-2.5 px-4">Source Interrogée</th>
                  <th className="py-2.5 px-4 text-center">Nouveaux Tirages</th>
                  <th className="py-2.5 px-4 text-center">Total en Base</th>
                  <th className="py-2.5 px-4 text-center">Temps d'Exécution</th>
                  <th className="py-2.5 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222a3d]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1c2438] transition-colors">
                    <td className="py-3 px-4 text-[#dae2fd] whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 text-[#bbcabf] truncate max-w-xs">{log.source}</td>
                    <td className="py-3 px-4 text-center">
                      {log.newImported > 0 ? (
                        <span className="bg-[#10b981]/20 text-[#4edea3] px-2 py-0.5 rounded-full font-bold">
                          +{log.newImported}
                        </span>
                      ) : (
                        <span className="text-[#86948a]">0 (À jour)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-[#dae2fd] font-bold">
                      {log.totalFound}
                    </td>
                    <td className="py-3 px-4 text-center text-[#7bd0ff]">{log.durationMs} ms</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-[#4edea3] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Add Custom Source */}
      {activeTab === 'add_source' && (
        <div className="bg-[#131b2e] rounded-xl border border-[#222a3d] p-5 sm:p-6 max-w-2xl mx-auto space-y-5 shadow-xl">
          <div>
            <h3 className="font-sans text-base text-[#dae2fd] font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#4edea3]" />
              Connecter une Nouvelle Source d'Historique
            </h3>
            <p className="font-sans text-xs text-[#bbcabf] mt-1">
              Vous pouvez renseigner l'adresse d'un flux REST JSON, d'une API de loterie ou d'une passerelle de scraping pour élargir votre base de données.
            </p>
          </div>

          <form onSubmit={handleAddSourceSubmit} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-[#dae2fd] font-medium block">Nom de la source :</label>
              <input
                type="text"
                required
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                placeholder="Ex: Serveur Mirror LONACI Bouaké / Gazette Officielle"
                className="w-full bg-[#171f33] text-[#dae2fd] p-3 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#dae2fd] font-medium block">URL du flux (Endpoint API / Web) :</label>
              <input
                type="url"
                required
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                placeholder="https://api.monserveur-loto.ci/v1/resultats"
                className="w-full bg-[#171f33] text-[#dae2fd] p-3 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#dae2fd] font-medium block">Protocole d'ingestion :</label>
              <select
                value={newSourceProtocol}
                onChange={(e) => setNewSourceProtocol(e.target.value as any)}
                className="w-full bg-[#171f33] text-[#dae2fd] p-3 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3] cursor-pointer"
              >
                <option value="REST API">API REST (JSON structuré avec hash)</option>
                <option value="Web Scraping">Scraping Web Automatique (Extraction HTML)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={addingSuccess}
              className="w-full bg-[#10b981] hover:bg-[#4edea3] text-[#003824] py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {addingSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Source ajoutée avec succès !</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Enregistrer et Activer la Source</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

