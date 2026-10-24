import React, { useState } from 'react';
import { InvestigationCase } from '../types/telecom';
import { FolderLock, Plus, Shield, Search, CheckCircle2, Phone, Calendar, ArrowRight } from 'lucide-react';

interface CasesViewProps {
  cases: InvestigationCase[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onOpenNewCaseModal: () => void;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  activeCaseId,
  onSelectCase,
  onOpenNewCaseModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCaseDetail, setSelectedCaseDetail] = useState<InvestigationCase>(
    cases.find(c => c.id === activeCaseId) || cases[0]
  );

  const filteredCases = cases.filter(c => 
    c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.primaryTargetNumber.includes(searchTerm)
  );

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Expedientes de Investigación UECS</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión y control de carpetas ministeriales con sábanas de llamadas asignadas
          </p>
        </div>
        <button
          onClick={onOpenNewCaseModal}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Nueva Carpeta</span>
        </button>
      </div>

      {/* Buscador de expedientes */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por número de expediente (ej. EXP-CJ-2024-0891), título o número telefónico..."
          className="bg-transparent border-none text-xs text-white placeholder-slate-400 w-full focus:outline-none font-mono"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-white"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Grid de 2 Columnas: Lista de Casos y Detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lista */}
        <div className="lg:col-span-7 space-y-3">
          {filteredCases.map((c) => {
            const isActive = c.id === activeCaseId;
            const isSelected = c.id === selectedCaseDetail.id;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCaseDetail(c)}
                className={`p-4 rounded border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-blue-500 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-blue-400">{c.caseNumber}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs text-slate-300 font-medium">{c.crimeType}</span>
                      {isActive && (
                        <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono font-medium">
                          CARPETA ACTIVA
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm font-semibold text-white">{c.title}</h2>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-semibold text-slate-300 block">
                      {c.totalRecordsCount.toLocaleString('es-MX')} registros
                    </span>
                    <span className="text-[10px] text-slate-400">{c.creationDate}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Objetivo: {c.primaryTargetNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.secondaryNumbers.length > 0 && (
                      <span>+{c.secondaryNumbers.length} números vinculados</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(c.id);
                      }}
                      className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                        isActive
                          ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800'
                          : 'text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {isActive ? 'Activo' : 'Cargar caso'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detalle del Expediente Seleccionado */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded p-5 space-y-4 sticky top-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[11px] text-blue-400 font-mono font-semibold">FICHA TÉCNICA MINISTERIAL</span>
              <h2 className="text-base font-bold text-white">{selectedCaseDetail.caseNumber}</h2>
            </div>
            {selectedCaseDetail.id !== activeCaseId ? (
              <button
                onClick={() => onSelectCase(selectedCaseDetail.id)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded transition-colors"
              >
                Hacer Activo
              </button>
            ) : (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Caso en uso
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Título de la Causa</span>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">{selectedCaseDetail.title}</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Tipo de Delito</span>
              <p className="font-medium text-slate-200 mt-0.5">{selectedCaseDetail.crimeType}</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Investigador y Analista</span>
              <p className="font-mono text-slate-300 mt-0.5">{selectedCaseDetail.leadInvestigator}</p>
              <p className="text-[11px] text-slate-400">{selectedCaseDetail.unit}</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Resumen Táctico</span>
              <p className="text-slate-300 leading-relaxed mt-0.5 bg-slate-950 p-3 rounded border border-slate-800 font-sans">
                {selectedCaseDetail.summary}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider mb-1.5">
                Números Telefónicos Investigados
              </span>
              <div className="space-y-1.5 font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-blue-900/40">
                  <span className="text-white font-bold">{selectedCaseDetail.primaryTargetNumber}</span>
                  <span className="text-[10px] text-blue-300 bg-blue-950 px-1.5 py-0.5 rounded">OBJETIVO PRINCIPAL</span>
                </div>
                {selectedCaseDetail.secondaryNumbers.map((num) => (
                  <div key={num} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    <span>{num}</span>
                    <span className="text-[10px] text-slate-400">VINCULADO</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
