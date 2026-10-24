/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CallDetailRecord, CellTower, InvestigationCase, PhoneLabel } from './types/telecom';
import { storageService } from './services/storageService';
import { TopBar } from './components/TopBar';
import { Sidebar, NavTabId } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CasesView } from './components/CasesView';
import { ImportWizardView } from './components/ImportWizardView';
import { RecordsExplorerView } from './components/RecordsExplorerView';
import { NumberAnalysisView } from './components/NumberAnalysisView';
import { ComparatorView } from './components/ComparatorView';
import { NetworkGraphView } from './components/NetworkGraphView';
import { GoogleMapsAntennasView } from './components/GoogleMapsAntennasView';
import { LabelsManagementView } from './components/LabelsManagementView';
import { ReportsView } from './components/ReportsView';
import { ArchitectureView } from './components/ArchitectureView';
import { PdfAnalysisResultsView } from './components/PdfAnalysisResultsView';
import { QuickLabelModal } from './components/QuickLabelModal';
import { NewCaseModal } from './components/NewCaseModal';
import { ThemeProvider, useAppTheme } from './context/ThemeContext';

function AppContent() {
  const { theme, themeConfig } = useAppTheme();
  const [currentTab, setCurrentTab] = useState<NavTabId>('panel');
  const [cases, setCases] = useState<InvestigationCase[]>(() => storageService.getCases());
  const [activeCaseId, setActiveCaseId] = useState<string>(() => storageService.getActiveCaseId());
  const [towers, setTowers] = useState<CellTower[]>(() => storageService.getTowers());
  const [labels, setLabels] = useState<PhoneLabel[]>(() => storageService.getLabels());
  const [records, setRecords] = useState<CallDetailRecord[]>(() => storageService.getRecords(activeCaseId));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Navegación contextual
  const [selectedNumberForAnalysis, setSelectedNumberForAnalysis] = useState<string>('656-789-2041');
  const [focusedTowerIdForMap, setFocusedTowerIdForMap] = useState<string | undefined>(undefined);
  const [quickLabelPhone, setQuickLabelPhone] = useState<string | null>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);

  // Caso activo
  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];

  // Actualizar registros al cambiar de caso
  useEffect(() => {
    storageService.setActiveCaseId(activeCaseId);
    setRecords(storageService.getRecords(activeCaseId));
    setLabels(storageService.getLabels(activeCaseId));
  }, [activeCaseId]);

  // Manejador de etiquetas
  const handleSaveLabel = (label: PhoneLabel) => {
    const updated = storageService.saveLabel(label);
    setLabels(updated);
  };

  const handleDeleteLabel = (phone: string) => {
    const updated = storageService.deleteLabel(phone);
    setLabels(updated);
  };

  // Manejador de nuevo caso
  const handleSaveCase = (newCase: InvestigationCase) => {
    const updated = [newCase, ...cases];
    setCases(updated);
    setActiveCaseId(newCase.id);
    localStorage.setItem('antisec_cases_v1', JSON.stringify(updated));
  };

  const handleSelectCase = (id: string) => {
    setActiveCaseId(id);
  };

  // Navegación rápida entre módulos
  const handleNavigateToMapWithRecord = (record: CallDetailRecord) => {
    setFocusedTowerIdForMap(record.towerId);
    setSelectedNumberForAnalysis(record.numberA);
    setCurrentTab('mapa');
  };

  const handleNavigateToNumberAnalysis = (phone: string) => {
    setSelectedNumberForAnalysis(phone);
    setCurrentTab('numero');
  };

  const handleFilterByTower = (towerId: string) => {
    setFocusedTowerIdForMap(towerId);
  };

  const tabTitles: Record<NavTabId, string> = {
    panel: 'Panel General',
    expedientes: 'Expedientes UECS',
    importar: 'Importar Sábanas',
    'vinculos-pdf': 'Resultados de PDFs (UAYC / i2)',
    registros: 'Explorador Forense',
    numero: 'Análisis por Número',
    comparador: 'Cruce & Co-localización',
    vinculos: 'Red de Vínculos (Grafo Táctico)',
    mapa: 'Mapa de Antenas (Google Maps)',
    etiquetas: 'Etiquetado Manual',
    reportes: 'Dictámenes Periciales',
    arquitectura: 'Arquitectura & Firestore'
  };

  return (
<<<<<<< HEAD
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">

=======
    <div 
      className="flex flex-col h-screen w-screen overflow-hidden transition-colors duration-200"
      style={{
        backgroundColor: themeConfig.bgMain,
        color: themeConfig.textPrimary
      }}
    >
>>>>>>> 06732813ef7521e9baace9aa7cb685d24da0a604
      {/* Barra Superior Institucional (Top Bar Contract) */}
      <TopBar
        activeCase={activeCase}
        activeTabTitle={tabTitles[currentTab]}
        onOpenReportModal={() => setCurrentTab('reportes')}
        onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      {/* Cuerpo Principal con Sidebar y Viewport */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          cases={cases}
          activeCaseId={activeCaseId}
          onSelectCase={handleSelectCase}
          totalRecords={records.length}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Viewport de Contenido */}
        <main 
          className="flex-1 overflow-y-auto transition-colors duration-200"
          style={{ backgroundColor: themeConfig.bgMain }}
        >
          {currentTab === 'panel' && (
            <DashboardView
              activeCase={activeCase}
              records={records}
              towers={towers}
              labels={labels}
              onSelectTab={setCurrentTab}
              onFilterByNumber={handleNavigateToNumberAnalysis}
              onFilterByTower={handleFilterByTower}
            />
          )}

          {currentTab === 'expedientes' && (
            <CasesView
              cases={cases}
              activeCaseId={activeCaseId}
              onSelectCase={handleSelectCase}
              onOpenNewCaseModal={() => setIsNewCaseModalOpen(true)}
            />
          )}

          {currentTab === 'importar' && (
            <ImportWizardView
              onImportComplete={(count) => {
                setRecords(storageService.getRecords(activeCaseId));
                setCurrentTab('registros');
              }}
            />
          )}

          {currentTab === 'vinculos-pdf' && (
            <PdfAnalysisResultsView
              onNavigateToNumberAnalysis={handleNavigateToNumberAnalysis}
              onNavigateToMap={(phone) => {
                setSelectedNumberForAnalysis(phone);
                setCurrentTab('mapa');
              }}
            />
          )}

          {currentTab === 'registros' && (
            <RecordsExplorerView
              records={records}
              towers={towers}
              labels={labels}
              onOpenLabelModal={(phone) => setQuickLabelPhone(phone)}
              onNavigateToMapWithRecord={handleNavigateToMapWithRecord}
              onNavigateToNumberAnalysis={handleNavigateToNumberAnalysis}
            />
          )}

          {currentTab === 'numero' && (
            <NumberAnalysisView
              initialPhoneNumber={selectedNumberForAnalysis}
              records={records}
              towers={towers}
              labels={labels}
              onOpenLabelModal={(phone) => setQuickLabelPhone(phone)}
              onNavigateToMapWithNumber={(phone) => {
                setSelectedNumberForAnalysis(phone);
                setCurrentTab('mapa');
              }}
            />
          )}

          {currentTab === 'comparador' && (
            <ComparatorView
              records={records}
              towers={towers}
              labels={labels}
              onNavigateToMap={() => setCurrentTab('mapa')}
            />
          )}

          {currentTab === 'vinculos' && (
            <NetworkGraphView
              records={records}
              labels={labels}
              activeCase={activeCase}
              onOpenLabelModal={(phone) => setQuickLabelPhone(phone)}
              onNavigateToNumberAnalysis={handleNavigateToNumberAnalysis}
            />
          )}

          {currentTab === 'mapa' && (
            <GoogleMapsAntennasView
              towers={towers}
              records={records}
              labels={labels}
              selectedTargetPhone={selectedNumberForAnalysis}
              focusedTowerId={focusedTowerIdForMap}
              onOpenLabelModal={(phone) => setQuickLabelPhone(phone)}
            />
          )}

          {currentTab === 'etiquetas' && (
            <LabelsManagementView
              labels={labels}
              onSaveLabel={handleSaveLabel}
              onDeleteLabel={handleDeleteLabel}
            />
          )}

          {currentTab === 'reportes' && (
            <ReportsView
              activeCase={activeCase}
              records={records}
              towers={towers}
              labels={labels}
            />
          )}

          {currentTab === 'arquitectura' && (
            <ArchitectureView />
          )}
        </main>
      </div>

      {/* Modal de Etiquetado Rápido */}
      {quickLabelPhone && (
        <QuickLabelModal
          isOpen={true}
          onClose={() => setQuickLabelPhone(null)}
          phoneNumber={quickLabelPhone}
          existingLabel={labels.find(l => l.phoneNumber.replace(/\D/g, '') === quickLabelPhone.replace(/\D/g, ''))}
          caseId={activeCaseId}
          onSave={handleSaveLabel}
        />
      )}

      {/* Modal de Creación de Caso */}
      {isNewCaseModalOpen && (
        <NewCaseModal
          isOpen={true}
          onClose={() => setIsNewCaseModalOpen(false)}
          onSaveCase={handleSaveCase}
        />
      )}

      {/* Barra de Navegación Rápida Inferior para Móviles */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-950/95 border-t border-slate-800 backdrop-blur flex items-center justify-around py-1.5 px-2 shadow-2xl">
        <button
          onClick={() => {
            setCurrentTab('panel');
            setIsMobileSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center p-1 rounded transition-colors ${
            currentTab === 'panel' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Panel</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('vinculos-pdf');
            setIsMobileSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center p-1 rounded transition-colors ${
            currentTab === 'vinculos-pdf' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">PDFs</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('mapa');
            setIsMobileSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center p-1 rounded transition-colors ${
            currentTab === 'mapa' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Mapa</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('registros');
            setIsMobileSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center p-1 rounded transition-colors ${
            currentTab === 'registros' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Sábanas</span>
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center justify-center p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Menú</span>
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
