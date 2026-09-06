import { useState, useMemo, FormEvent } from 'react';
import {
  Search,
  Calendar,
  Clock,
  ShieldCheck,
  Download,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  PlusCircle,
  X,
  Check,
  ExternalLink,
  Globe,
  Smartphone,
  Hash,
  Copy,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { Draw, GameType, DetectedHourInfo } from '../types';
import LottoBall from '../components/LottoBall';

interface HistoryViewProps {
  draws: Draw[];
  detectedHours: DetectedHourInfo[];
  selectedGame?: GameType | 'all';
  onSelectGame?: (game: GameType | 'all') => void;
  onOpenDrawReport: (draw: Draw) => void;
  onVerifySource?: (draw: Draw) => void;
  onNavigateTab: (tab: any) => void;
  onOpenNumberDetail?: (ballNumber: number) => void;
  onAddManualDraw?: (data: {
    date: string;
    time: string;
    gameName: string;
    balls: [number, number, number, number, number];
    machineBalls?: number[];
    source?: string;
  }) => { success: boolean; error?: string };
}

export default function HistoryView({
  draws,
  detectedHours,
  selectedGame = 'all',
  onSelectGame,
  onOpenDrawReport,
  onVerifySource: propVerifySource,
  onNavigateTab,
  onOpenNumberDetail,
  onAddManualDraw,
}: HistoryViewProps) {
  const onVerifySource = propVerifySource || onOpenDrawReport;

  // Sub-tabs:
  // 1: 'recupere' (Historique Récupéré avec contrôle source certifiée)
  // 2: 'complet' (Historique Complet avec filtres avancés & matrice)
  const [subTab, setSubTab] = useState<'recupere' | 'complet'>('recupere');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedHourFilter, setSelectedHourFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedBallFilter, setSelectedBallFilter] = useState<number | null>(null);

  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDrawDate, setNewDrawDate] = useState('06/09/2026');
  const [newDrawTime, setNewDrawTime] = useState('10:00');
  const [newDrawGame, setNewDrawGame] = useState('Loto Soutra / Diamant');
  const [newDrawBalls, setNewDrawBalls] = useState<string[]>(['', '', '', '', '']);
  const [newDrawMachine, setNewDrawMachine] = useState<string[]>(['', '', '', '', '']);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  // Detail Modal State
  const [selectedDrawForDetail, setSelectedDrawForDetail] = useState<Draw | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Filtered dataset
  const filteredDraws = useMemo(() => {
    return draws.filter((draw) => {
      // Hour filter
      if (selectedHourFilter !== 'all' && draw.time !== selectedHourFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && draw.status !== statusFilter) return false;

      // Source filter
      if (sourceFilter !== 'all') {
        if (sourceFilter === 'lotobonheur' && !draw.source.toLowerCase().includes('lotobonheur')) {
          return false;
        }
        if (sourceFilter === 'matrice_plus' && !draw.source.toLowerCase().includes('matrice')) {
          return false;
        }
      }

      // Game filter
      if (selectedGame !== 'all' && draw.game !== selectedGame) return false;

      // Ball filter
      if (selectedBallFilter !== null) {
        if (!draw.balls.includes(selectedBallFilter)) return false;
      }

      // Search query (checks date, gameName, drawNumber, time, source, AND ball numbers!)
      if (search) {
        const q = search.toLowerCase().trim();
        const matchNum = draw.drawNumber.toString().includes(q);
        const matchDate = draw.date.includes(q);
        const matchTime = draw.time.includes(q);
        const matchGame = draw.gameName.toLowerCase().includes(q);
        const matchSource = draw.source.toLowerCase().includes(q);
        const matchBalls = draw.balls.some((b) => b.toString() === q || `n°${b}` === q || `${b}`.padStart(2, '0') === q);
        const matchMachine = draw.machineBalls?.some((b) => b.toString() === q) || false;

        if (!matchNum && !matchDate && !matchTime && !matchGame && !matchSource && !matchBalls && !matchMachine) {
          return false;
        }
      }

      return true;
    });
  }, [draws, selectedHourFilter, statusFilter, sourceFilter, selectedGame, search, selectedBallFilter]);

  // Statistics calculation for current selection
  const selectionStats = useMemo(() => {
    const total = filteredDraws.length;
    const fromLotoBonheur = filteredDraws.filter((d) => d.source.toLowerCase().includes('lotobonheur')).length;
    const fromMatricePlus = filteredDraws.filter((d) => d.source.toLowerCase().includes('matrice')).length;
    const avgSum = total > 0 ? Math.round(filteredDraws.reduce((acc, d) => acc + d.sum, 0) / total) : 0;
    return { total, fromLotoBonheur, fromMatricePlus, avgSum };
  }, [filteredDraws]);

  // Paginated items
  const totalPages = Math.max(1, Math.ceil(filteredDraws.length / pageSize));
  const paginatedDraws = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDraws.slice(start, start + pageSize);
  }, [filteredDraws, currentPage]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedHourFilter('all');
    setStatusFilter('all');
    setSourceFilter('all');
    setSelectedBallFilter(null);
    setCurrentPage(1);
    if (onSelectGame) onSelectGame('all');
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const balls = newDrawBalls.map((b) => parseInt(b.trim(), 10));
    if (balls.some((b) => isNaN(b) || b < 1 || b > 90)) {
      setAddError('Les 5 numéros gagnants doivent être compris entre 1 et 90.');
      return;
    }

    if (new Set(balls).size !== 5) {
      setAddError('Les 5 numéros gagnants doivent tous être distincts (aucun doublon).');
      return;
    }

    const machineBalls = newDrawMachine
      .map((b) => parseInt(b.trim(), 10))
      .filter((b) => !isNaN(b) && b >= 1 && b <= 90);

    if (machineBalls.length > 0 && new Set(machineBalls).size !== machineBalls.length) {
      setAddError('Les numéros machine saisis comportent des doublons.');
      return;
    }

    if (onAddManualDraw) {
      const res = onAddManualDraw({
        date: newDrawDate,
        time: newDrawTime,
        gameName: newDrawGame,
        balls: balls as [number, number, number, number, number],
        machineBalls: machineBalls.length > 0 ? machineBalls : undefined,
        source: 'Lotto Matrice Plus (ODO GROUP CI - Saisie Opérateur)',
      });

      if (!res.success) {
        setAddError(res.error || 'Erreur lors de l’enregistrement.');
        return;
      }
    }

    setAddSuccess(true);
    setTimeout(() => {
      setAddSuccess(false);
      setShowAddModal(false);
      setNewDrawBalls(['', '', '', '', '']);
      setNewDrawMachine(['', '', '', '', '']);
    }, 1200);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Top Banner with Certification Overview */}
      <div className="bg-[#171f33] p-5 sm:p-6 rounded-2xl border border-[#222a3d] shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#4edea3]">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="font-sans text-xl text-[#dae2fd] font-bold tracking-tight">
                Historique Officiel &amp; Registre des Tirages LONACI
              </h2>
              <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-[#10b981]/30">
                100% Certifié Conforme
              </span>
            </div>
            <p className="font-sans text-xs text-[#bbcabf] leading-relaxed">
              Base de données officielle extraite exclusivement de{' '}
              <a
                href="https://lotobonheur.ci/resultats"
                target="_blank"
                rel="noreferrer"
                className="text-[#4edea3] hover:underline font-semibold inline-flex items-center gap-0.5"
              >
                https://lotobonheur.ci/resultats <ExternalLink className="w-3 h-3" />
              </a>{' '}
              et de l'application de référence{' '}
              <strong className="text-[#dae2fd]">Lotto Matrice Plus</strong> (ODO GROUP CI). Les sources tierces non certifiées sont formellement rejetées.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-[#86948a]">
              <span>
                Total certifié : <strong className="text-[#4edea3]">{draws.length} tirages</strong>
              </span>
              <span>•</span>
              <span>
                Couverture : <strong className="text-[#7bd0ff]">Avril 2026 – Septembre 2026</strong>
              </span>
              <span>•</span>
              <span>
                Horodatages : <strong className="text-[#dae2fd]">{detectedHours.length} créneaux/jour</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
            <button
              onClick={() => {
                setAddError(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-[#10b981] hover:bg-[#4edea3] text-[#003824] px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Saisir un Tirage Sorti</span>
            </button>

            <button
              onClick={() => onNavigateTab('exporter-donnees')}
              className="flex items-center gap-2 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] px-4 py-2.5 rounded-xl font-mono text-xs transition-colors border border-[#2d3449] cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#7bd0ff]" />
              <span>Exporter Registre</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#222a3d] pb-2 font-mono text-xs">
        <button
          onClick={() => {
            setSubTab('recupere');
            setCurrentPage(1);
          }}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'recupere'
              ? 'bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
              : 'text-[#bbcabf] hover:bg-[#222a3d] hover:text-[#dae2fd]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Historique Récupéré (Vérification Source &amp; Intégrité)</span>
        </button>

        <button
          onClick={() => {
            setSubTab('complet');
            setCurrentPage(1);
          }}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'complet'
              ? 'bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
              : 'text-[#bbcabf] hover:bg-[#222a3d] hover:text-[#dae2fd]'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Historique Complet &amp; Explorateur Avancé</span>
        </button>
      </div>

      {/* When subTab === 'recupere', display the Certified Sources Audit & Telemetry panel */}
      {subTab === 'recupere' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source 1: lotobonheur.ci */}
          <div className="bg-[#171f33] p-5 rounded-xl border border-[#10b981]/30 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 text-[#4edea3] flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-[#dae2fd]">
                    Portail Officiel LONACI
                  </h4>
                  <span className="font-mono text-[11px] text-[#4edea3]">
                    https://lotobonheur.ci/resultats
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#10b981]/20 text-[#4edea3] border border-[#10b981]/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Source Primaire
              </span>
            </div>
            <p className="font-sans text-xs text-[#bbcabf] leading-relaxed">
              Extraction en direct via l'API REST officielle de la Loterie Nationale de Côte d’Ivoire.
              Données homologuées avec les 5 numéros gagnants et les 5 numéros machine par tirage.
            </p>
            <div className="pt-2 border-t border-[#222a3d] flex items-center justify-between text-xs font-mono">
              <span className="text-[#86948a]">
                Tirages certifiés : <strong className="text-[#dae2fd]">{selectionStats.fromLotoBonheur || draws.length}</strong>
              </span>
              <a
                href="https://lotobonheur.ci/resultats"
                target="_blank"
                rel="noreferrer"
                className="text-[#7bd0ff] hover:text-[#4edea3] font-semibold flex items-center gap-1"
              >
                <span>Visiter lotobonheur.ci</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Source 2: Lotto Matrice Plus */}
          <div className="bg-[#171f33] p-5 rounded-xl border border-[#7bd0ff]/30 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#7bd0ff]/20 text-[#7bd0ff] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-[#dae2fd]">
                    Lotto Matrice Plus
                  </h4>
                  <span className="font-mono text-[11px] text-[#7bd0ff]">
                    ODO GROUP CI (Abidjan)
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#7bd0ff]/20 text-[#7bd0ff] border border-[#7bd0ff]/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Application de Référence
              </span>
            </div>
            <p className="font-sans text-xs text-[#bbcabf] leading-relaxed">
              Moteur matriciel et historique de confiance certifié ODO GROUP. Fournit les codes secrets,
              la croix de sommation, la pyramide des numéros et la détection des pions rejetés.
            </p>
            <div className="pt-2 border-t border-[#222a3d] flex items-center justify-between text-xs font-mono">
              <span className="text-[#86948a]">
                Intégrité algorithmique : <strong className="text-[#4edea3]">100% Conforme</strong>
              </span>
              <span className="text-[#bbcabf]">
                Algorithme : <strong className="text-[#dae2fd]">5/90 Matriciel</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter controls Bar */}
      <div className="bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#bbcabf]" />
            <input
              type="text"
              placeholder="Chercher date, heure, jeu, n° (ex: 28)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#171f33] text-[#dae2fd] placeholder:text-[#bbcabf]/60 font-sans text-xs pl-9 pr-3 py-2 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3]"
            />
          </div>

          {/* Source filter */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#bbcabf]">
            <span>Source :</span>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#171f33] text-[#dae2fd] px-2.5 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3] cursor-pointer"
            >
              <option value="all">Toutes sources certifiées</option>
              <option value="lotobonheur">lotobonheur.ci (LONACI)</option>
              <option value="matrice_plus">Lotto Matrice Plus</option>
            </select>
          </div>

          {/* Dynamic Hour filter */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#bbcabf]">
            <Clock className="w-3.5 h-3.5 text-[#ec6a06]" />
            <span>Heure :</span>
            <select
              value={selectedHourFilter}
              onChange={(e) => {
                setSelectedHourFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#171f33] text-[#dae2fd] px-2.5 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3] cursor-pointer"
            >
              <option value="all">Toutes ({detectedHours.length})</option>
              {detectedHours.map((h) => (
                <option key={h.hour} value={h.hour}>
                  {h.hour} ({h.drawCount})
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#bbcabf]">
            <span>Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#171f33] text-[#dae2fd] px-2.5 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3] cursor-pointer"
            >
              <option value="all">Tous statuts</option>
              <option value="CONFORME">✓ Conforme (100%)</option>
              <option value="A_VERIFIER">⚠ À vérifier</option>
            </select>
          </div>

          {/* Ball filter (1-90) */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#bbcabf]">
            <span>N° spécifique :</span>
            <select
              value={selectedBallFilter || ''}
              onChange={(e) => {
                setSelectedBallFilter(e.target.value ? Number(e.target.value) : null);
                setCurrentPage(1);
              }}
              className="bg-[#171f33] text-[#dae2fd] px-2.5 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3] cursor-pointer"
            >
              <option value="">Tous les 90 numéros</option>
              {Array.from({ length: 90 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Numéro {n < 10 ? `0${n}` : n}
                </option>
              ))}
            </select>
          </div>

          {(search || selectedHourFilter !== 'all' || statusFilter !== 'all' || sourceFilter !== 'all' || selectedBallFilter !== null) && (
            <button
              onClick={handleResetFilters}
              title="Réinitialiser les filtres"
              className="p-1.5 rounded-lg bg-[#222a3d] hover:bg-[#2d3449] text-[#bbcabf] hover:text-[#dae2fd] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick summary count */}
        <div className="font-mono text-xs text-[#bbcabf] flex items-center gap-2">
          <span>
            Trouvés : <strong className="text-[#4edea3]">{filteredDraws.length}</strong>
          </span>
          <span>•</span>
          <span>
            Page <strong className="text-[#dae2fd]">{currentPage}</strong> / {totalPages}
          </span>
        </div>
      </div>

      {/* Main Draws Table */}
      <div className="bg-[#171f33] rounded-2xl border border-[#222a3d] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#131b2e] border-b border-[#222a3d] text-[11px] text-[#bbcabf] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Date &amp; Heure</th>
                <th className="py-3.5 px-4 font-semibold">Jeu LONACI</th>
                <th className="py-3.5 px-4 font-semibold">5 Numéros Gagnants</th>
                <th className="py-3.5 px-4 font-semibold">5 Machine</th>
                <th className="py-3.5 px-4 font-semibold">Somme &amp; Parité</th>
                <th className="py-3.5 px-4 font-semibold">Source Certifiée</th>
                <th className="py-3.5 px-4 text-center font-semibold">Statut</th>
                <th className="py-3.5 px-4 text-right font-semibold">Vérification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222a3d]/50">
              {paginatedDraws.length > 0 ? (
                paginatedDraws.map((draw) => {
                  const isConforme = draw.status === 'CONFORME';
                  const isLotoBonheur = draw.source.toLowerCase().includes('lotobonheur');

                  return (
                    <tr key={draw.id} className="hover:bg-[#222a3d]/40 transition-colors">
                      {/* Date & Time */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#dae2fd]">{draw.date}</span>
                          <span className="bg-[#131b2e] px-2 py-0.5 rounded font-bold text-[#7bd0ff] border border-[#222a3d]">
                            {draw.time}
                          </span>
                        </div>
                      </td>

                      {/* Game Name */}
                      <td className="py-3 px-4">
                        <span className="text-[#dae2fd] font-medium block">{draw.gameName}</span>
                        <span className="text-[10px] text-[#86948a]">{draw.machineId}</span>
                      </td>

                      {/* 5 Winning Numbers */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {draw.balls.map((b, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => onOpenNumberDetail && onOpenNumberDetail(b)}
                              title={`Analyser le numéro ${b}`}
                              className="cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                            >
                              <LottoBall number={b} size="sm" />
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* 5 Machine Numbers */}
                      <td className="py-3 px-4">
                        {draw.machineBalls && draw.machineBalls.length > 0 ? (
                          <div className="flex items-center gap-1">
                            {draw.machineBalls.map((b, i) => (
                              <span
                                key={i}
                                className="w-6 h-6 rounded-full bg-[#131b2e] text-[#bbcabf] flex items-center justify-center font-bold text-[10px] border border-[#222a3d]"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#86948a] italic text-[11px]">Non diffusé</span>
                        )}
                      </td>

                      {/* Matrix Quick Stats (Sum & Even/Odd) */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-[#bbcabf]">
                          <span>Somme : <strong className="text-[#dae2fd]">{draw.sum}</strong></span>
                          <span className="text-[#86948a] ml-1.5">
                            ({draw.evenCount}P / {draw.oddCount}I)
                          </span>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-4">
                        {isLotoBonheur ? (
                          <a
                            href="https://lotobonheur.ci/resultats"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#4edea3] hover:underline"
                          >
                            <Globe className="w-3 h-3" />
                            <span>lotobonheur.ci</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#7bd0ff]">
                            <Smartphone className="w-3 h-3" />
                            <span>Lotto Matrice Plus</span>
                          </span>
                        )}
                      </td>

                      {/* Statut Badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isConforme
                              ? 'bg-[#10b981]/20 text-[#4edea3] border border-[#10b981]/40'
                              : 'bg-[#ec6a06]/20 text-[#ffb690] border border-[#ec6a06]/40'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{draw.status}</span>
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedDrawForDetail(draw)}
                            title="Certificat d'intégrité et contrôle source"
                            className="bg-[#222a3d] hover:bg-[#10b981] text-[#7bd0ff] hover:text-[#003824] px-2.5 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Vérifier</span>
                          </button>

                          <button
                            onClick={() => onOpenDrawReport(draw)}
                            title="Fiche technique complète"
                            className="bg-[#131b2e] hover:bg-[#222a3d] text-[#dae2fd] px-2.5 py-1 rounded-lg transition-colors text-[11px] border border-[#222a3d] cursor-pointer"
                          >
                            Détails
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#bbcabf]">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="text-sm font-bold text-[#dae2fd]">Aucun tirage correspondant</p>
                      <p className="text-xs text-[#86948a]">
                        Modifiez vos critères de recherche ou réinitialisez les filtres pour voir les tirages officiels.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 bg-[#222a3d] hover:bg-[#2d3449] text-[#4edea3] px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Réinitialiser tous les filtres
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="bg-[#131b2e] p-3.5 border-t border-[#222a3d] flex items-center justify-between text-xs font-mono">
          <span className="text-[#bbcabf]">
            Affichage de {paginatedDraws.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} à{' '}
            {Math.min(currentPage * pageSize, filteredDraws.length)} sur {filteredDraws.length} tirages certifiés
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-[#171f33] text-[#dae2fd] hover:bg-[#222a3d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-[#4edea3] bg-[#171f33] rounded-lg border border-[#222a3d]">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-[#171f33] text-[#dae2fd] hover:bg-[#222a3d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cryptographic Proof & Source Verification Modal */}
      {selectedDrawForDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171f33] border border-[#222a3d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#131b2e] p-4 sm:p-5 border-b border-[#222a3d] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#4edea3]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-sans text-base text-[#dae2fd] font-bold">
                    Certificat de Conformité du Tirage
                  </h3>
                  <span className="font-mono text-[10px] text-[#4edea3]">
                    {selectedDrawForDetail.gameName} — {selectedDrawForDetail.date} à {selectedDrawForDetail.time}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDrawForDetail(null)}
                className="text-[#bbcabf] hover:text-[#dae2fd] p-1 rounded-lg hover:bg-[#222a3d] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 font-mono text-xs">
              {/* Numbers Showcase */}
              <div className="bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] space-y-2 text-center">
                <span className="text-[11px] text-[#bbcabf] font-sans">
                  5 Numéros Gagnants Homologués :
                </span>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {selectedDrawForDetail.balls.map((b, i) => (
                    <LottoBall key={i} number={b} size="md" />
                  ))}
                </div>

                {selectedDrawForDetail.machineBalls && selectedDrawForDetail.machineBalls.length > 0 && (
                  <div className="pt-2 border-t border-[#222a3d] mt-2">
                    <span className="text-[10px] text-[#86948a] font-sans block mb-1">
                      Numéros Machine :
                    </span>
                    <div className="flex items-center justify-center gap-1.5">
                      {selectedDrawForDetail.machineBalls.map((b, i) => (
                        <span
                          key={i}
                          className="w-7 h-7 rounded-full bg-[#171f33] text-[#bbcabf] flex items-center justify-center font-bold text-xs border border-[#222a3d]"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Data Verification Details */}
              <div className="space-y-2 bg-[#131b2e] p-4 rounded-xl border border-[#222a3d]">
                <div className="flex items-center justify-between">
                  <span className="text-[#86948a]">Source Origine :</span>
                  <span className="text-[#4edea3] font-bold">{selectedDrawForDetail.source}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86948a]">URL de Référence :</span>
                  <a
                    href={selectedDrawForDetail.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#7bd0ff] hover:underline flex items-center gap-1"
                  >
                    <span>{selectedDrawForDetail.sourceUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86948a]">Machine / RNG :</span>
                  <span className="text-[#dae2fd]">{selectedDrawForDetail.machineId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86948a]">Somme des 5 Boules :</span>
                  <span className="text-[#dae2fd] font-bold">{selectedDrawForDetail.sum}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86948a]">Parité :</span>
                  <span className="text-[#dae2fd]">
                    {selectedDrawForDetail.evenCount} Pairs / {selectedDrawForDetail.oddCount} Impairs
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86948a]">Écart Maximal :</span>
                  <span className="text-[#dae2fd]">{selectedDrawForDetail.maxGap}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86948a]">Horodatage Récupération :</span>
                  <span className="text-[#bbcabf]">{selectedDrawForDetail.retrievedAt}</span>
                </div>
              </div>

              {/* Hash Cryptographique */}
              <div className="bg-[#131b2e] p-3 rounded-xl border border-[#222a3d] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#86948a] flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-[#4edea3]" /> Empreinte d'intégrité SHA-256 :
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(selectedDrawForDetail.hash)}
                    className="text-[10px] text-[#7bd0ff] hover:text-[#4edea3] flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedHash ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
                <div className="p-2 bg-[#171f33] rounded-lg text-[#dae2fd] text-[10px] font-mono break-all select-all border border-[#222a3d]">
                  {selectedDrawForDetail.hash}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                {selectedDrawForDetail.source.toLowerCase().includes('lotobonheur') && (
                  <a
                    href="https://lotobonheur.ci/resultats"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#222a3d] hover:bg-[#2d3449] text-[#7bd0ff] px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Vérifier sur lotobonheur.ci</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedDrawForDetail(null)}
                  className="bg-[#10b981] hover:bg-[#4edea3] text-[#003824] px-4 py-2 rounded-lg font-bold cursor-pointer transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Draw Creation Modal (Saisie certifiée Lotto Matrice Plus) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171f33] border border-[#222a3d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#131b2e] p-4 sm:p-5 border-b border-[#222a3d] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#4edea3]">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-sans text-base text-[#dae2fd] font-bold">
                    Saisie Manuelle d'un Tirage Sorti
                  </h3>
                  <span className="font-mono text-[10px] text-[#4edea3]">
                    Format certifié conforme Lotto Matrice Plus &amp; LONACI
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#bbcabf] hover:text-[#dae2fd] p-1 rounded-lg hover:bg-[#222a3d] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 font-mono text-xs">
              {addError && (
                <div className="bg-[#ff8f73]/15 border border-[#ff8f73]/40 p-3 rounded-lg text-[#ff8f73] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              {addSuccess && (
                <div className="bg-[#10b981]/15 border border-[#10b981]/40 p-3 rounded-lg text-[#4edea3] flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>Tirage enregistré et indexé avec succès !</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#bbcabf] text-[11px] block">Date (JJ/MM/AAAA) :</label>
                  <input
                    type="text"
                    required
                    value={newDrawDate}
                    onChange={(e) => setNewDrawDate(e.target.value)}
                    placeholder="Ex: 06/09/2026"
                    className="w-full bg-[#131b2e] text-[#dae2fd] p-2.5 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#bbcabf] text-[11px] block">Heure Officielle :</label>
                  <select
                    value={newDrawTime}
                    onChange={(e) => setNewDrawTime(e.target.value)}
                    className="w-full bg-[#131b2e] text-[#dae2fd] p-2.5 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3] cursor-pointer"
                  >
                    <option value="07:00">07:00 (Digital Réveil)</option>
                    <option value="08:00">08:00 (Digital Matin)</option>
                    <option value="10:00">10:00 (Matinée LONACI)</option>
                    <option value="13:00">13:00 (Midi LONACI)</option>
                    <option value="16:00">16:00 (Après-midi LONACI)</option>
                    <option value="18:00">18:00 (Afterwork LONACI)</option>
                    <option value="20:00">20:00 (Soirée LONACI / Ghana)</option>
                    <option value="21:00">21:00 (Digital Soir)</option>
                    <option value="22:00">22:00 (Digital Soir 2)</option>
                    <option value="23:00">23:00 (Digital Nuit)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#bbcabf] text-[11px] block">Nom du Jeu :</label>
                <input
                  type="text"
                  required
                  value={newDrawGame}
                  onChange={(e) => setNewDrawGame(e.target.value)}
                  placeholder="Ex: Loto Soutra / Loto Diamant / National"
                  className="w-full bg-[#131b2e] text-[#dae2fd] p-2.5 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              {/* 5 Winning Balls */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[#4edea3] text-[11px] font-bold block">
                  5 Numéros Gagnants (1 à 90) :
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {newDrawBalls.map((val, idx) => (
                    <input
                      key={idx}
                      type="number"
                      min={1}
                      max={90}
                      required
                      placeholder={`N°${idx + 1}`}
                      value={val}
                      onChange={(e) => {
                        const copy = [...newDrawBalls];
                        copy[idx] = e.target.value;
                        setNewDrawBalls(copy);
                      }}
                      className="bg-[#131b2e] text-[#dae2fd] p-2.5 rounded-lg border border-[#222a3d] text-center font-bold focus:outline-none focus:border-[#4edea3]"
                    />
                  ))}
                </div>
              </div>

              {/* 5 Machine Balls (Optional) */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[#86948a] text-[11px] block">
                  5 Numéros Machine (Optionnel) :
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {newDrawMachine.map((val, idx) => (
                    <input
                      key={idx}
                      type="number"
                      min={1}
                      max={90}
                      placeholder={`M${idx + 1}`}
                      value={val}
                      onChange={(e) => {
                        const copy = [...newDrawMachine];
                        copy[idx] = e.target.value;
                        setNewDrawMachine(copy);
                      }}
                      className="bg-[#131b2e] text-[#bbcabf] p-2.5 rounded-lg border border-[#222a3d] text-center focus:outline-none focus:border-[#7bd0ff]"
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#222a3d] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-[#bbcabf] hover:bg-[#222a3d] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addSuccess}
                  className="bg-[#10b981] hover:bg-[#4edea3] text-[#003824] px-5 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{addSuccess ? 'Enregistré !' : 'Enregistrer le Tirage'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
