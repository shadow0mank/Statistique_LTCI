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

  // Two sub-tabs required by specifications:
  // 1: 'recupere' (Historique Récupéré avec contrôle source)
  // 2: 'complet' (Historique Complet avec filtres avancés)
  const [subTab, setSubTab] = useState<'recupere' | 'complet'>('recupere');

  const [search, setSearch] = useState('');
  const [selectedHourFilter, setSelectedHourFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBallFilter, setSelectedBallFilter] = useState<number | null>(null);

  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDrawDate, setNewDrawDate] = useState('04/09/2026');
  const [newDrawTime, setNewDrawTime] = useState('13:00');
  const [newDrawGame, setNewDrawGame] = useState('Loto Fortune');
  const [newDrawBalls, setNewDrawBalls] = useState<string[]>(['', '', '', '', '']);
  const [newDrawMachine, setNewDrawMachine] = useState<string[]>(['', '', '', '', '']);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;

  const filteredDraws = useMemo(() => {
    return draws.filter((draw) => {
      // Hour filter
      if (selectedHourFilter !== 'all' && draw.time !== selectedHourFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && draw.status !== statusFilter) return false;

      // Game filter
      if (selectedGame !== 'all' && draw.game !== selectedGame) return false;

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchNum = draw.drawNumber.toString().includes(q);
        const matchDate = draw.date.includes(q);
        const matchTime = draw.time.includes(q);
        const matchGame = draw.gameName.toLowerCase().includes(q);
        const matchSource = draw.source.toLowerCase().includes(q);
        if (!matchNum && !matchDate && !matchTime && !matchGame && !matchSource) return false;
      }

      // Ball filter
      if (selectedBallFilter !== null) {
        if (!draw.balls.includes(selectedBallFilter)) return false;
      }

      return true;
    });
  }, [draws, selectedHourFilter, statusFilter, selectedGame, search, selectedBallFilter]);

  // Paginated items
  const totalPages = Math.max(1, Math.ceil(filteredDraws.length / pageSize));
  const paginatedDraws = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDraws.slice(start, start + pageSize);
  }, [filteredDraws, currentPage]);

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const balls = newDrawBalls.map((b) => parseInt(b.trim(), 10));
    if (balls.some((b) => isNaN(b) || b < 1 || b > 90)) {
      setAddError('Les 5 numéros gagnants doivent être compris entre 1 et 90.');
      return;
    }

    if (new Set(balls).size !== 5) {
      setAddError('Les 5 numéros doivent être tous distincts (aucun doublon autorisé).');
      return;
    }

    const machineBalls = newDrawMachine
      .map((b) => parseInt(b.trim(), 10))
      .filter((b) => !isNaN(b) && b >= 1 && b <= 90);

    if (onAddManualDraw) {
      const res = onAddManualDraw({
        date: newDrawDate,
        time: newDrawTime,
        gameName: newDrawGame,
        balls: balls as [number, number, number, number, number],
        machineBalls,
        source: 'Saisie Directe Opérateur / Direct Loterie',
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

  return (
    <div className="flex flex-col w-full space-y-5 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#171f33] p-4 sm:p-5 rounded-xl border border-[#222a3d] shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#4edea3]" />
            <h2 className="font-sans text-lg text-[#dae2fd] font-bold">
              Historique des Tirages LONACI & Contrôle Qualité
            </h2>
            <span className="bg-[#10b981]/20 text-[#4edea3] font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
              {filteredDraws.length} tirages répertoriés
            </span>
          </div>
          <p className="font-sans text-xs text-[#bbcabf] mt-1">
            Traçabilité intégrale, parité avec la source lotobonheur.ci et vérification cryptographique SHA-256.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              setAddError(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-[#4edea3] text-[#003824] px-3.5 py-2 rounded-lg font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Enregistrer un Tirage Sorti</span>
          </button>

          <button
            onClick={() => onNavigateTab('exporter-donnees')}
            className="flex items-center gap-2 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] px-3.5 py-2 rounded-lg font-mono text-xs transition-colors border border-[#2d3449] cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#7bd0ff]" />
            <span>Exporter l'historique</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs switch */}
      <div className="flex items-center gap-2 border-b border-[#222a3d] pb-2 font-mono text-xs">
        <button
          onClick={() => {
            setSubTab('recupere');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            subTab === 'recupere'
              ? 'bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
              : 'text-[#bbcabf] hover:bg-[#222a3d] hover:text-[#dae2fd]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Historique Récupéré (Vérification Source)</span>
        </button>

        <button
          onClick={() => {
            setSubTab('complet');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
            subTab === 'complet'
              ? 'bg-[#10b981] text-[#003824] shadow-md shadow-[#10b981]/20'
              : 'text-[#bbcabf] hover:bg-[#222a3d] hover:text-[#dae2fd]'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Historique Complet & Filtres Avancés</span>
        </button>
      </div>

      {/* Filter controls */}
      <div className="bg-[#131b2e] p-3.5 rounded-xl border border-[#222a3d] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#bbcabf]" />
            <input
              type="text"
              placeholder="Rechercher par date, jeu, tirage..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#171f33] text-[#dae2fd] placeholder:text-[#bbcabf]/60 font-sans text-xs pl-9 pr-3 py-2 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3]"
            />
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
              className="bg-[#171f33] text-[#dae2fd] px-2.5 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none"
            >
              <option value="all">Toutes les heures ({detectedHours.length})</option>
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
              className="bg-[#171f33] text-[#dae2fd] px-2.5 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="CONFORME">✓ Conforme</option>
              <option value="A_VERIFIER">⚠ À vérifier</option>
              <option value="DUPLICATE">Doublon</option>
              <option value="ERREUR">Erreur</option>
            </select>
          </div>

          {/* Ball filter */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#bbcabf]">
            <span>Contient le N° :</span>
            <select
              value={selectedBallFilter || ''}
              onChange={(e) => {
                setSelectedBallFilter(e.target.value ? Number(e.target.value) : null);
                setCurrentPage(1);
              }}
              className="bg-[#171f33] text-[#dae2fd] px-2.5 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none"
            >
              <option value="">Tous les 90 numéros</option>
              {Array.from({ length: 90 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Numéro {n < 10 ? `0${n}` : n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick stats summary */}
        <div className="font-mono text-xs text-[#bbcabf]">
          Page <span className="text-[#dae2fd] font-bold">{currentPage}</span> / {totalPages}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#171f33] rounded-xl border border-[#222a3d] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#131b2e] border-b border-[#222a3d] text-[11px] text-[#bbcabf] uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Heure</th>
                <th className="py-3 px-4">Jeu</th>
                <th className="py-3 px-4">Numéros Gagnants</th>
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Récupéré le</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222a3d]/50">
              {paginatedDraws.length > 0 ? (
                paginatedDraws.map((draw) => {
                  const isConforme = draw.status === 'CONFORME';

                  return (
                    <tr key={draw.id} className="hover:bg-[#222a3d]/50 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-4 font-bold text-[#dae2fd]">
                        {draw.date}
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4">
                        <span className="bg-[#222a3d] px-2 py-0.5 rounded font-bold text-[#7bd0ff]">
                          {draw.time}
                        </span>
                      </td>

                      {/* Game */}
                      <td className="py-3 px-4 text-[#dae2fd] font-medium">
                        {draw.gameName}
                      </td>

                      {/* Winning Numbers */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {draw.balls.map((b, i) => (
                            <LottoBall key={i} number={b} size="sm" />
                          ))}
                        </div>
                      </td>

                      {/* Machine Numbers */}
                      <td className="py-3 px-4">
                        {draw.machineBalls && draw.machineBalls.length > 0 ? (
                          <div className="flex items-center gap-1">
                            {draw.machineBalls.map((b, i) => (
                              <span
                                key={i}
                                className="w-6 h-6 rounded-full bg-[#222a3d] text-[#dae2fd] flex items-center justify-center font-bold text-[10px]"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#86948a]">-</span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3 px-4 text-[#bbcabf]">
                        <span className="text-xs">{draw.source}</span>
                      </td>

                      {/* Statut Badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isConforme
                              ? 'bg-[#10b981]/20 text-[#4edea3] border border-[#10b981]/40'
                              : draw.status === 'A_VERIFIER'
                              ? 'bg-[#ec6a06]/20 text-[#ffb690] border border-[#ec6a06]/40'
                              : 'bg-red-500/20 text-red-400 border border-red-500/40'
                          }`}
                        >
                          {isConforme ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          <span>{draw.status}</span>
                        </span>
                      </td>

                      {/* Retrieved at */}
                      <td className="py-3 px-4 text-center text-[#bbcabf] text-[11px]">
                        {draw.retrievedAt ? draw.retrievedAt.split('T')[0] : '2026-09-03'}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Mandatory "Vérifier la source" button */}
                          <button
                            onClick={() => onVerifySource(draw)}
                            title="Vérifier la conformité directe avec la source lotobonheur.ci"
                            className="bg-[#222a3d] hover:bg-[#10b981] text-[#7bd0ff] hover:text-[#003824] px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1 text-[11px]"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Vérifier source</span>
                          </button>

                          <button
                            onClick={() => onOpenDrawReport(draw)}
                            title="Consulter la fiche cryptographique"
                            className="bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] px-2 py-1 rounded transition-colors text-[11px]"
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
                  <td colSpan={9} className="py-12 text-center text-[#bbcabf]">
                    Aucun tirage trouvé pour ces critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="bg-[#131b2e] p-3 border-t border-[#222a3d] flex items-center justify-between text-xs font-mono">
          <span className="text-[#bbcabf]">
            Affichage de {paginatedDraws.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} à{' '}
            {Math.min(currentPage * pageSize, filteredDraws.length)} sur {filteredDraws.length} tirages
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-[#171f33] text-[#dae2fd] hover:bg-[#222a3d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-[#4edea3]">
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

      {/* Manual Draw Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171f33] border border-[#222a3d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#131b2e] p-4 sm:p-5 border-b border-[#222a3d] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#4edea3]">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-sans text-base text-[#dae2fd] font-bold">
                    Enregistrer un Nouveau Tirage Sorti
                  </h3>
                  <span className="font-mono text-[10px] text-[#86948a]">
                    Validation immédiate &amp; Recalcul automatique des statistiques
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#bbcabf] hover:text-[#dae2fd] p-1 rounded-lg hover:bg-[#222a3d]"
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
                  <span>Tirage enregistré et injecté dans la base avec succès !</span>
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
                    placeholder="Ex: 04/09/2026"
                    className="w-full bg-[#131b2e] text-[#dae2fd] p-2 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#bbcabf] text-[11px] block">Heure Officielle :</label>
                  <select
                    value={newDrawTime}
                    onChange={(e) => setNewDrawTime(e.target.value)}
                    className="w-full bg-[#131b2e] text-[#dae2fd] p-2 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3] cursor-pointer"
                  >
                    <option value="07:00">07:00 (Digital Réveil)</option>
                    <option value="08:00">08:00 (Digital Matin)</option>
                    <option value="10:00">10:00 (Loto Diamant)</option>
                    <option value="13:00">13:00 (Loto Fortune)</option>
                    <option value="16:00">16:00 (Loto Espoir)</option>
                    <option value="18:00">18:00 (National CI)</option>
                    <option value="21:00">21:00 (Digital Soir)</option>
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
                  placeholder="Ex: Loto Fortune / National CI"
                  className="w-full bg-[#131b2e] text-[#dae2fd] p-2 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              {/* 5 Winning Balls */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[#4edea3] text-[11px] font-bold block">
                  5 Numéros Gagnants Sortis (1 - 90) :
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
                      className="bg-[#131b2e] text-[#bbcabf] p-2 rounded-lg border border-[#222a3d] text-center focus:outline-none focus:border-[#7bd0ff]"
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
