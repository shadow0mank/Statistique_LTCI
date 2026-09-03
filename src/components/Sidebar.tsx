import {
  LayoutDashboard,
  Calendar,
  Clock,
  BarChart3,
  Target,
  Flame,
  GitCompare,
  RefreshCw,
  Upload,
  Download,
  Code2,
  Settings,
  Database,
  X,
} from 'lucide-react';
import LottoLogo from './LottoLogo';

export type NavTabId =
  | 'tableau-de-bord'
  | 'historique-des-tirages'
  | 'analyse-par-heure'
  | 'statistiques-numeros'
  | 'prochain-tirage'
  | 'numeros-chauds-froids'
  | 'comparaison-fiches'
  | 'synchronisation-automatique'
  | 'importer-donnees'
  | 'exporter-donnees'
  | 'code-sql-php'
  | 'parametres-sql';

interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  totalDrawsCount: number;
  detectedHoursCount: number;
}

const NAV_ITEMS: { id: NavTabId; label: string; icon: any; badge?: string }[] = [
  { id: 'tableau-de-bord', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'historique-des-tirages', label: 'Historique & Source', icon: Calendar },
  { id: 'analyse-par-heure', label: 'Analyse par heure', icon: Clock, badge: 'Clé' },
  { id: 'statistiques-numeros', label: 'Statistiques 90 numéros', icon: BarChart3 },
  { id: 'prochain-tirage', label: 'Prochain tirage (Par Heure)', icon: Target, badge: 'IA' },
  { id: 'numeros-chauds-froids', label: 'Chauds & Froids', icon: Flame },
  { id: 'comparaison-fiches', label: 'Comparateur & Fiches', icon: GitCompare },
  { id: 'synchronisation-automatique', label: 'Synchronisation & Logs', icon: RefreshCw },
  { id: 'importer-donnees', label: 'Importer (CSV / XLSX)', icon: Upload },
  { id: 'exporter-donnees', label: 'Exporter les données', icon: Download },
  { id: 'code-sql-php', label: 'Code SQL & PHP (WAMP)', icon: Code2 },
  { id: 'parametres-sql', label: 'Paramètres & Formule', icon: Settings },
];

export default function Sidebar({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  totalDrawsCount,
  detectedHoursCount,
}: SidebarProps) {
  const content = (
    <div className="h-full flex flex-col justify-between bg-[#060e20] border-r border-[#222a3d]/80 select-none">
      {/* Upper section */}
      <div className="p-4 overflow-y-auto">
        {/* Brand & Mobile Close */}
        <div className="flex items-center justify-between mb-4 px-1">
          <LottoLogo className="h-8" showSubtitle={true} />
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#bbcabf] hover:text-[#dae2fd] hover:bg-[#131b2e]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Database & Hours Telemetry Card */}
        <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d]/70 mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#bbcabf] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#7bd0ff]" /> Base LONACI
            </span>
            <span className="font-mono text-[9px] text-[#4edea3] bg-[#10b981]/20 px-2 py-0.5 rounded-full font-bold">
              {totalDrawsCount} tirages
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#bbcabf] pt-1 border-t border-[#222a3d]/50">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#ec6a06]" /> Heures détectées :
            </span>
            <span className="font-bold text-[#ffb690]">{detectedHoursCount} créneaux</span>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#10b981] text-[#00422b] font-semibold shadow-md shadow-[#10b981]/20'
                    : 'text-[#bbcabf] hover:bg-[#222a3d] hover:text-[#dae2fd]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00422b]' : 'text-[#bbcabf]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-[#003824] text-[#6ffbbe]'
                        : item.badge === 'Clé'
                        ? 'bg-[#10b981]/20 text-[#4edea3]'
                        : 'bg-[#ec6a06]/20 text-[#ffb690]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info strip */}
      <div className="p-4 bg-[#131b2e] border-t border-[#222a3d]/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4edea3]" />
            <span className="font-mono text-[11px] text-[#bbcabf]">v3.5.0 Production</span>
          </div>
          <span className="font-mono text-[11px] text-[#86948a] font-bold">CI-ABJ</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-[16.5rem] z-50">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-[16.5rem] max-w-[80vw] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
