import React from 'react';
import { 
  LayoutDashboard, 
  FolderLock, 
  FileSpreadsheet, 
  Table, 
  PhoneCall, 
  GitCompare, 
  MapPin, 
  Tags, 
  FileText, 
  Layers,
  Network
} from 'lucide-react';
import { InvestigationCase } from '../types/telecom';
import { BuhueLogo } from './BuhueLogo';

export type NavTabId = 
  | 'panel'
  | 'expedientes'
  | 'importar'
  | 'vinculos-pdf'
  | 'registros'
  | 'numero'
  | 'comparador'
  | 'vinculos'
  | 'mapa'
  | 'etiquetas'
  | 'reportes'
  | 'arquitectura';

interface SidebarProps {
  currentTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  cases: InvestigationCase[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  totalRecords: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  cases,
  activeCaseId,
  onSelectCase,
  totalRecords,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'panel' as NavTabId, label: 'Panel General', icon: LayoutDashboard },
    { id: 'expedientes' as NavTabId, label: 'Expedientes UECS', icon: FolderLock },
    { id: 'importar' as NavTabId, label: 'Importar Sábanas', icon: FileSpreadsheet, hint: 'PDF / Excel' },
    { id: 'vinculos-pdf' as NavTabId, label: 'Resultados de PDFs', icon: Network, hint: 'UAYC / i2' },
    { id: 'registros' as NavTabId, label: 'Explorador Forense', icon: Table, count: totalRecords },
    { id: 'numero' as NavTabId, label: 'Análisis por Número', icon: PhoneCall },
    { id: 'comparador' as NavTabId, label: 'Cruce & Co-localización', icon: GitCompare },
    { id: 'vinculos' as NavTabId, label: 'Red de Vínculos', icon: Network, hint: 'Grafo' },
    { id: 'mapa' as NavTabId, label: 'Mapa de Antenas', icon: MapPin, hint: 'Google Maps' }
    { id: 'etiquetas' as NavTabId, label: 'Etiquetado Manual', icon: Tags },
    { id: 'reportes' as NavTabId, label: 'Dictámenes Periciales', icon: FileText },
    { id: 'arquitectura' as NavTabId, label: 'Arquitectura & Firestore', icon: Layers }
  ];

  const handleTabClick = (tabId: NavTabId) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Backdrop para dispositivos móviles */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Contenedor del Sidebar adaptable */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-64 md:z-auto ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Cabecera del Sidebar con Botón de Cierre en Móvil */}
          <div className="flex items-center justify-between md:justify-center p-3 bg-slate-900/60 border border-slate-800/80 rounded relative">
            <BuhueLogo size={46} variant="badge" />
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Selector de Expediente Activo */}
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Carpeta Activa
            </label>
            <select
              value={activeCaseId}
              onChange={(e) => onSelectCase(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 py-1.5 px-2 rounded focus:outline-none focus:border-blue-500 font-mono"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.crimeType}
                </option>
              ))}
            </select>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Zona Operativa:</span>
              <span className="font-semibold text-slate-300">Cd. Juárez</span>
            </div>
          </div>

          {/* Módulos de Navegación */}
          <div>
            <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Módulos de Análisis
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap text-left ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.count}
                      </span>
                    )}
                    {item.hint && !item.count && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-blue-800 text-blue-100' : 'text-slate-400'
                      }`}>
                        {item.hint}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Pie institucional */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-400 space-y-1 shrink-0">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span>Unidad Antisecuestro</span>
            <span className="text-emerald-400 font-mono text-[10px]">EN LÍNEA</span>
          </div>
          <p className="text-[10px] text-slate-400">
            FGE Chihuahua · Sede Norte
          </p>
        </div>
      </aside>
    </>
  );
};
