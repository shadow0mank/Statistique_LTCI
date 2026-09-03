import { useState, useMemo } from 'react';
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigateTab('exporter-donnees')}
            className="flex items-center gap-2 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] px-3.5 py-2 rounded-lg font-mono text-xs transition-colors border border-[#2d3449]"
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
              className="p-1.5 rounded-lg bg-[#171f33] text-[#dae2fd] hover:bg-[#222a3d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-[#4edea3]">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-[#171f33] text-[#dae2fd] hover:bg-[#222a3d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
