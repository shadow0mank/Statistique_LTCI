import { Search, Moon, User, Dices, Menu, RefreshCw, Clock } from 'lucide-react';
import { GameType } from '../types';
import LottoLogo from './LottoLogo';

interface HeaderProps {
  selectedGame: GameType | 'all';
  onSelectGame: (game: GameType | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleMobileMenu: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
  totalDraws?: number;
  latestDrawDate?: string;
  nextDrawHour?: string;
}

export default function Header({
  selectedGame,
  onSelectGame,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
  onSync,
  isSyncing = false,
  totalDraws = 6400,
  latestDrawDate = '04/09/2026',
  nextDrawHour = '13:00',
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 lg:left-[16.5rem] right-0 h-16 bg-[#060e20]/95 backdrop-blur-xl z-40 px-3 sm:px-4 md:px-6 flex items-center justify-between border-b border-[#222a3d]/80 shadow-md">
      {/* Left: Mobile Menu + Search & Game selector */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 max-w-2xl">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-[#131b2e] text-[#bbcabf] hover:text-[#dae2fd] border border-[#222a3d]"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden">
          <LottoLogo className="h-6" showSubtitle={false} />
        </div>

        {/* Search bar */}
        <div className="relative flex items-center flex-1 max-w-xs sm:max-w-sm">
          <Search className="absolute left-3 w-4 h-4 text-[#bbcabf] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher tirage, numéro..."
            className="w-full bg-[#131b2e] text-[#dae2fd] placeholder:text-[#bbcabf]/60 font-sans text-xs sm:text-sm pl-9 pr-3 py-1.5 rounded-lg border border-[#222a3d] focus:outline-none focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] transition-all"
          />
        </div>

        {/* Game filter dropdown */}
        <div className="flex items-center bg-[#131b2e] rounded-lg border border-[#222a3d] p-0.5 sm:p-1">
          <Dices className="w-4 h-4 text-[#7bd0ff] ml-2 mr-1 hidden sm:block" />
          <select
            value={selectedGame}
            onChange={(e) => onSelectGame(e.target.value as GameType | 'all')}
            className="bg-transparent text-[#dae2fd] font-mono text-xs py-1 pr-2 rounded focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#171f33] text-[#dae2fd]">
              Tous les Jeux (6)
            </option>
            <option value="national" className="bg-[#171f33] text-[#dae2fd]">
              National CI
            </option>
            <option value="diamant" className="bg-[#171f33] text-[#dae2fd]">
              Loto Diamant
            </option>
            <option value="etoile" className="bg-[#171f33] text-[#dae2fd]">
              Loto Étoile
            </option>
            <option value="espoir" className="bg-[#171f33] text-[#dae2fd]">
              Loto Espoir
            </option>
            <option value="fortune" className="bg-[#171f33] text-[#dae2fd]">
              Loto Fortune
            </option>
            <option value="bambou" className="bg-[#171f33] text-[#dae2fd]">
              Loto Bambou
            </option>
          </select>
        </div>
      </div>

      {/* Right: Next draw badge + Quick Sync + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Next Draw Badge */}
        <div className="hidden xl:flex items-center gap-2 bg-[#131b2e] px-3 py-1.5 rounded-lg border border-[#222a3d]">
          <Clock className="w-3.5 h-3.5 text-[#ec6a06] animate-pulse" />
          <div className="flex flex-col">
            <span className="font-mono text-[9px] text-[#bbcabf] uppercase tracking-wider">Prochain Tirage</span>
            <span className="font-mono text-xs text-[#ffdbca] font-bold">{nextDrawHour} GMT</span>
          </div>
        </div>

        {/* Database Status badge */}
        <div className="hidden md:flex flex-col bg-[#131b2e] px-3 py-1 rounded-lg border border-[#222a3d]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            <span className="font-mono text-[10px] text-[#4edea3] font-bold">
              {totalDraws} tirages certifiés
            </span>
          </div>
          <span className="font-mono text-[9px] text-[#86948a]">À jour : {latestDrawDate}</span>
        </div>

        {/* Quick Sync Button */}
        {onSync && (
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-[#10b981]/15 hover:bg-[#10b981]/25 text-[#4edea3] border border-[#10b981]/30 hover:border-[#10b981] px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            title="Actualiser la base avec les derniers tirages sortis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Actualisation...' : 'Actualiser'}</span>
          </button>
        )}

        {/* User avatar & badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#222a3d]/80">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10b981] to-[#6ffbbe] flex items-center justify-center text-[#003824] shadow-sm font-bold text-xs">
              CI
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#4edea3] ring-2 ring-[#060e20]" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="font-mono text-xs text-[#dae2fd] font-semibold leading-tight">Superviseur LONACI</span>
            <span className="font-mono text-[9px] text-[#4edea3] tracking-wide">Multi-Sources En Ligne</span>
          </div>
        </div>
      </div>
    </header>
  );
}
