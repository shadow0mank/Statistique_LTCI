import { useState, useMemo } from 'react';
import Header from './components/Header';
import Sidebar, { NavTabId } from './components/Sidebar';
import SourceVerificationModal from './components/SourceVerificationModal';
import FormulaModal from './components/FormulaModal';
import NumberDetailModal from './components/NumberDetailModal';
import NumberComparisonModal from './components/NumberComparisonModal';

import DashboardView from './views/DashboardView';
import HistoryView from './views/HistoryView';
import HourlyAnalysisView from './views/HourlyAnalysisView';
import NumbersStatsView from './views/NumbersStatsView';
import NextDrawView from './views/NextDrawView';
import HotColdView from './views/HotColdView';
import CompareAndDetailView from './views/CompareAndDetailView';
import SyncView from './views/SyncView';
import ImportView from './views/ImportView';
import ExportView from './views/ExportView';
import CodeSqlPhpView from './views/CodeSqlPhpView';
import SettingsView from './views/SettingsView';

import { loadInitialDraws, detectHoursFromDraws, computeGlobalBallStats } from './data/lonaciEngine';
import { Draw, GameType, FormulaWeights } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('tableau-de-bord');
  const [selectedGame, setSelectedGame] = useState<GameType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Application Data States - Loaded with official 24-month historical database
  const [draws, setDraws] = useState<Draw[]>(() => loadInitialDraws());

  // Multi-criteria formula weights (sum = 100%)
  const [weights, setWeights] = useState<FormulaWeights>({
    history24M: 30,
    recentTrend: 20,
    gap90d: 15,
    stability6M: 15,
    hourlyFreq: 20,
  });

  // Dynamically detected actual hours from database
  const detectedHours = useMemo(() => {
    return detectHoursFromDraws(draws);
  }, [draws]);

  // Global Ball Stats computed with official weights across all draws
  const ballStats = useMemo(() => {
    return computeGlobalBallStats(draws, weights);
  }, [draws, weights]);

  // Modal States
  const [activeVerificationModal, setActiveVerificationModal] = useState<Draw | null>(null);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [selectedBallForDetail, setSelectedBallForDetail] = useState<number | null>(null);
  const [compareState, setCompareState] = useState<{ balls: number[]; hour: string } | null>(null);

  const latestDraw = draws[0] || null;

  const handleImportSuccess = (newDraws: Draw[]) => {
    setDraws((prev) => [...newDraws, ...prev]);
  };

  const handleResetData = () => {
    setDraws(loadInitialDraws());
  };

  const handleOpenCompare = (balls: number[], hour: string) => {
    setCompareState({ balls, hour });
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] font-sans antialiased flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        totalDrawsCount={draws.length}
        detectedHoursCount={detectedHours.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[16.5rem] flex flex-col min-h-screen w-full overflow-x-hidden">
        {/* Top Header */}
        <Header
          selectedGame={selectedGame}
          onSelectGame={setSelectedGame}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* View Viewport */}
        <main className="flex-1 pt-20 px-3 sm:px-4 md:px-6 pb-12 w-full max-w-[1600px] mx-auto">
          {activeTab === 'tableau-de-bord' && (
            <DashboardView
              draws={draws}
              detectedHours={detectedHours}
              weights={weights}
              onNavigateTab={setActiveTab}
              onOpenDrawReport={setActiveVerificationModal}
              onOpenFormulaModal={() => setShowFormulaModal(true)}
              onOpenNumberDetail={setSelectedBallForDetail}
            />
          )}

          {activeTab === 'historique-des-tirages' && (
            <HistoryView
              draws={draws}
              detectedHours={detectedHours}
              onOpenDrawReport={setActiveVerificationModal}
              onNavigateTab={setActiveTab}
              onOpenNumberDetail={setSelectedBallForDetail}
            />
          )}

          {activeTab === 'analyse-par-heure' && (
            <HourlyAnalysisView
              draws={draws}
              detectedHours={detectedHours}
              weights={weights}
              onOpenNumberDetail={setSelectedBallForDetail}
              onOpenCompare={handleOpenCompare}
            />
          )}

          {activeTab === 'statistiques-numeros' && (
            <NumbersStatsView
              ballStats={ballStats}
              onOpenNumberDetail={setSelectedBallForDetail}
            />
          )}

          {activeTab === 'prochain-tirage' && (
            <NextDrawView
              draws={draws}
              detectedHours={detectedHours}
              weights={weights}
              onOpenNumberDetail={setSelectedBallForDetail}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'numeros-chauds-froids' && (
            <HotColdView
              draws={draws}
              detectedHours={detectedHours}
              ballStats={ballStats}
              onOpenNumberDetail={setSelectedBallForDetail}
            />
          )}

          {activeTab === 'comparaison-fiches' && (
            <CompareAndDetailView
              draws={draws}
              detectedHours={detectedHours}
              weights={weights}
              onOpenNumberDetail={setSelectedBallForDetail}
              onOpenCompare={handleOpenCompare}
            />
          )}

          {activeTab === 'synchronisation-automatique' && (
            <SyncView
              detectedHours={detectedHours}
              totalDrawsCount={draws.length}
            />
          )}

          {activeTab === 'importer-donnees' && (
            <ImportView
              existingDraws={draws}
              onImportSuccess={handleImportSuccess}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'exporter-donnees' && <ExportView draws={draws} />}

          {activeTab === 'code-sql-php' && <CodeSqlPhpView />}

          {activeTab === 'parametres-sql' && (
            <SettingsView
              weights={weights}
              onUpdateWeights={setWeights}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Verification & Audit Modal */}
      <SourceVerificationModal
        draw={activeVerificationModal}
        onClose={() => setActiveVerificationModal(null)}
      />

      {/* Formula Audit Modal */}
      <FormulaModal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
      />

      {/* Detailed Number Profile Modal */}
      <NumberDetailModal
        ballNumber={selectedBallForDetail}
        draws={draws}
        onClose={() => setSelectedBallForDetail(null)}
        onCompareWith={(num) => {
          setSelectedBallForDetail(null);
          setCompareState({
            balls: [selectedBallForDetail || 27, num],
            hour: detectedHours[0]?.hour || '10:00',
          });
        }}
      />

      {/* Number Comparison Modal */}
      {compareState && (
        <NumberComparisonModal
          initialBalls={compareState.balls}
          initialHour={compareState.hour}
          draws={draws}
          detectedHours={detectedHours}
          weights={weights}
          onClose={() => setCompareState(null)}
        />
      )}
    </div>
  );
}
