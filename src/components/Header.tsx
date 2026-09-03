import { Search, Moon, Sun, User, Dices, Menu, Bell } from 'lucide-react';
import { GameType } from '../types';
import LottoLogo from './LottoLogo';

interface HeaderProps {
  selectedGame: GameType | 'all';
  onSelectGame: (game: GameType | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleMobileMenu: () => void;
  onOpenNotifications?: () => void;
}

export default function Header({
  selectedGame,
  onSelectGame,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 lg:left-[16.5rem] right-0 h-16 bg-[#060e20]/90 backdrop-blur-xl z-40 px-4 md:px-6 flex items-center justify-between border-b border-[#222a3d]/60">
      {/* Left: Mobile Menu + Search & Game selector */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-2xl">
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

      {/* Right: Coverage + Dark Mode + Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Coverage progress */}
        <div className="hidden xl:flex flex-col bg-[#131b2e] px-3 py-1.5 rounded-lg border border-[#222a3d]">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-mono text-[10px] text-[#bbcabf]">Couverture : 21 / 24 mois</span>
            <span className="font-mono text-xs text-[#4edea3] font-bold">87.5%</span>
          </div>
          <div className="w-36 h-1.5 bg-[#222a3d] rounded-full overflow-hidden">
            <div className="h-full bg-[#10b981] rounded-full" style={{ width: '87.5%' }} />
          </div>
        </div>

        {/* Notifications & Theme button */}
        <button
          onClick={() => {}}
          className="p-2 rounded-lg bg-[#131b2e] text-[#bbcabf] hover:bg-[#222a3d] hover:text-[#dae2fd] border border-[#222a3d] transition-colors"
          title="Mode sombre actif"
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* User avatar & badge */}
        <div className="flex items-center gap-2 pl-1 border-l border-[#222a3d]/80">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-[#003824] shadow-sm">
              <User className="w-4 h-4 font-bold" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#4edea3] ring-2 ring-[#060e20]" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="font-mono text-xs text-[#dae2fd] font-semibold leading-tight">Admin CI</span>
            <span className="font-mono text-[10px] text-[#4edea3] tracking-wide">Superviseur Loto</span>
          </div>
        </div>
      </div>
    </header>
  );
}
