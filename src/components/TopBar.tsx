import React from 'react';
import { InvestigationCase } from '../types/telecom';
import { FileText, AlertCircle, Menu } from 'lucide-react';
import { BuhueLogo } from './BuhueLogo';

interface TopBarProps {
  activeCase: InvestigationCase;
  activeTabTitle: string;
  onOpenReportModal: () => void;
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeCase,
  activeTabTitle,
  onOpenReportModal,
  onToggleSidebar
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6 shrink-0 z-30">
      {/* Zona 1: Menú móvil + Logo */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Abrir menú de navegación"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="hidden sm:block">
          <BuhueLogo size={36} variant="full" />
        </div>
        <div className="sm:hidden flex items-center gap-1.5">
          <BuhueLogo size={28} variant="icon" />
          <span className="font-extrabold text-xs tracking-wider text-white">ANTISEC</span>
        </div>
      </div>

      {/* Zona 2: Rastro de contexto / Migas de pan */}
      <div className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap overflow-hidden">
        <span className="hidden lg:inline text-slate-500">Expediente:</span>
        <span className="hidden sm:inline font-mono text-slate-200 font-medium">{activeCase.caseNumber}</span>
        <span className="hidden sm:inline text-slate-600">/</span>
        <span className="text-blue-400 font-medium truncate max-w-[140px] sm:max-w-xs">{activeTabTitle}</span>
      </div>

      {/* Zona 3: Acciones primarias */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-amber-400/90 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-mono font-medium text-[11px]">DATOS SINTÉTICOS DE PRUEBA</span>
        </div>
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 border border-blue-500 rounded transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Generar Dictamen</span>
          <span className="sm:hidden text-[11px]">Dictamen</span>
        </button>
      </div>
    </header>
  );
};
