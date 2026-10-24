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
import { GoogleMapsAntennasView } from './components/GoogleMapsAntennasView';
import { LabelsManagementView } from './components/LabelsManagementView';
import { ReportsView } from './components/ReportsView';
import { ArchitectureView } from './components/ArchitectureView';
import { PdfAnalysisResultsView } from './components/PdfAnalysisResultsView';
import { QuickLabelModal } from './components/QuickLabelModal';
import { NewCaseModal } from './components/NewCaseModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTabId>('panel');
  const [cases, setCases] = useState<InvestigationCase[]>(() => storageService.getCases());
  const [activeCaseId, setActiveCaseId] = useState<string>(() => storageService.getActiveCaseId());
  const [towers, setTowers] = useState<CellTower[]>(() => storageService.getTowers());
  const [labels, setLabels] = useState<PhoneLabel[]>(() => storageService.getLabels());
  const [records, setRecords] = useState<CallDetailRecord[]>(() => storageService.getRecords(activeCaseId));

  // Navegación contextual
  const [selectedNumberForAnalysis, setSelectedNumberForAnalysis] = useState<string>('656-789-2041');
  const [focusedTowerIdForMap, setFocusedTowerIdForMap] = useState<string | undefined>(undefined);
  const [quickLabelPhone, setQuickLabelPhone] = useState<string | null>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handler = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handler);
    return () => window.removeEventListener('gmp-quota-exceeded', handler);
  }, []);

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
    mapa: 'Mapa de Antenas (Google Maps)',
    etiquetas: 'Etiquetado Manual',
    reportes: 'Dictámenes Periciales',
    arquitectura: 'Arquitectura & Firestore'
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Banner de Aviso de Cuota de Google Maps Platform */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Barra Superior Institucional (Top Bar Contract) */}
      <TopBar
        activeCase={activeCase}
        activeTabTitle={tabTitles[currentTab]}
        onOpenReportModal={() => setCurrentTab('reportes')}
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
        />

        {/* Viewport de Contenido */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
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
    </div>
  );
}
