import React from 'react';
import { InvestigationCase } from '../types/telecom';
import { FileText, AlertCircle, Palette } from 'lucide-react';
import { BuhueLogo } from './BuhueLogo';
import { useAppTheme, AppTheme } from '../context/ThemeContext';

interface TopBarProps {
  activeCase: InvestigationCase;
  activeTabTitle: string;
  onOpenReportModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeCase,
  activeTabTitle,
  onOpenReportModal
}) => {
  const { theme, setTheme } = useAppTheme();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between gap-8 shrink-0 z-30">
      {/* Zone 1: Single text element wordmark with Buhue Logo */}
      <div className="flex items-center shrink-0">
        <BuhueLogo size={36} variant="full" />
      </div>

      {/* Zone 2: Breadcrumbs / Context trail */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap overflow-hidden">
        <span className="text-slate-500">Expediente:</span>
        <span className="font-mono text-slate-200 font-medium">{activeCase.caseNumber}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300 font-medium truncate max-w-xs">{activeCase.title}</span>
        <span className="text-slate-600">/</span>
        <span className="text-cyan-400 font-medium">{activeTabTitle}</span>
      </div>

      {/* Zone 3: Primary action + Theme Color Selector */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Selector de Paleta de Color */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 px-2 py-1 rounded text-xs">
          <Palette className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as AppTheme)}
            className="bg-transparent border-none text-[11px] text-slate-200 focus:outline-none font-medium cursor-pointer"
            title="Cambiar Paleta de Color de la Aplicación"
          >
            <option value="buhue_cyan" className="bg-slate-900 text-white">Cian BUHUE (Neón)</option>
            <option value="fiscalia_navy" className="bg-slate-900 text-white">Azul Mando Fiscalía</option>
            <option value="grafito_stealth" className="bg-slate-900 text-white">Grafito Inteligencia</option>
            <option value="ministerial_light" className="bg-slate-900 text-white">Claro Ministerial</option>
          </select>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-amber-400/90 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-mono font-medium">DATOS SINTÉTICOS DE PRUEBA</span>
        </div>
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 border border-blue-500 rounded transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Generar Dictamen</span>
        </button>
      </div>
    </header>
  );
};
