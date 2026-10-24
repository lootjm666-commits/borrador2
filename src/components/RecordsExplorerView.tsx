import React, { useState, useMemo } from 'react';
import { CallDetailRecord, CellTower, PhoneLabel } from '../types/telecom';
import { 
  Search, 
  Filter, 
  Download, 
  PhoneCall, 
  MapPin, 
  Compass, 
  Tags, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';

interface RecordsExplorerViewProps {
  records: CallDetailRecord[];
  towers: CellTower[];
  labels: PhoneLabel[];
  onOpenLabelModal: (phoneNumber: string) => void;
  onNavigateToMapWithRecord: (record: CallDetailRecord) => void;
  onNavigateToNumberAnalysis: (phoneNumber: string) => void;
}

export const RecordsExplorerView: React.FC<RecordsExplorerViewProps> = ({
  records,
  towers,
  labels,
  onOpenLabelModal,
  onNavigateToMapWithRecord,
  onNavigateToNumberAnalysis
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [selectedTowerId, setSelectedTowerId] = useState<string>('ALL');
  const [onlyCritical, setOnlyCritical] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Mapeo rápido de etiquetas
  const labelMap = useMemo(() => {
    const map = new Map<string, PhoneLabel>();
    labels.forEach(l => {
      map.set(l.phoneNumber.replace(/\D/g, ''), l);
    });
    return map;
  }, [labels]);

  // Filtrado de registros
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Búsqueda de texto
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesTerm = 
          r.numberA.toLowerCase().includes(term) ||
          r.numberB.toLowerCase().includes(term) ||
          r.imei.toLowerCase().includes(term) ||
          r.towerName.toLowerCase().includes(term) ||
          r.notes?.toLowerCase().includes(term);
        if (!matchesTerm) return false;
      }

      // Tipo de evento
      if (selectedEventType !== 'ALL' && r.eventType !== selectedEventType) {
        return false;
      }

      // Antena
      if (selectedTowerId !== 'ALL' && r.towerId !== selectedTowerId) {
        return false;
      }

      // Críticas
      if (onlyCritical && !r.notes?.toLowerCase().includes('rescate') && !r.notes?.toLowerCase().includes('exigencia')) {
        return false;
      }

      return true;
    });
  }, [records, searchTerm, selectedEventType, selectedTowerId, onlyCritical]);

  // Paginación
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = [
      'ID_REGISTRO', 'NUMERO_A', 'NUMERO_B', 'FECHA', 'HORA', 'DURACION_SEG',
      'EVENTO', 'CELDA_ID', 'NOMBRE_ANTENA', 'LATITUD', 'LONGITUD', 'AZIMUT', 'IMEI', 'NOTAS'
    ];
    const rows = filteredRecords.map(r => [
      r.id,
      r.numberA,
      r.numberB,
      r.date,
      r.time,
      r.durationSeconds,
      r.eventType,
      r.towerId,
      `"${r.towerName}"`,
      r.latitude.toFixed(6),
      r.longitude.toFixed(6),
      r.azimuth,
      r.imei,
      `"${r.notes || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SABANA_FORENSE_FILTRADA_EXP_CJZ.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSeconds = (sec: number) => {
    if (sec === 0) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Encabezado y resumen de datos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Explorador Forense de Sábana</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Desglose analítico de llamadas, mensajes SMS, tráfico de datos y celdas celulares en Ciudad Juárez
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors w-full sm:w-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV ({filteredRecords.length})</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded p-3 sm:p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Búsqueda */}
          <div className="md:col-span-5 flex items-center gap-2 bg-slate-950 border border-slate-700/80 px-3 py-1.5 rounded text-xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por número A/B, IMEI, antena o notas tácticas..."
              className="bg-transparent border-none text-white placeholder-slate-400 w-full focus:outline-none font-mono"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-white">
                ✕
              </button>
            )}
          </div>

          {/* Filtro Tipo de Evento */}
          <div className="md:col-span-3">
            <select
              value={selectedEventType}
              onChange={(e) => {
                setSelectedEventType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700/80 text-xs text-slate-200 py-2 px-2.5 rounded focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="ALL">Todos los Eventos ({records.length})</option>
              <option value="VOZ_SALIENTE">Voz Saliente</option>
              <option value="VOZ_ENTRANTE">Voz Entrante</option>
              <option value="SMS_SALIENTE">SMS Saliente</option>
              <option value="SMS_ENTRANTE">SMS Entrante</option>
              <option value="DATOS_LTE">Tráfico Paquetes Datos LTE</option>
            </select>
          </div>

          {/* Filtro por Antena en Juárez */}
          <div className="md:col-span-4">
            <select
              value={selectedTowerId}
              onChange={(e) => {
                setSelectedTowerId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700/80 text-xs text-slate-200 py-2 px-2.5 rounded focus:outline-none focus:border-blue-500 font-mono truncate"
            >
              <option value="ALL">Todas las Antenas de Cd. Juárez</option>
              {towers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.operator} · Az: {t.azimuth}°)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila secundaria de controles: Solo Críticas y Tamaño de Página */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-800/80">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyCritical}
              onChange={(e) => {
                setOnlyCritical(e.target.checked);
                setCurrentPage(1);
              }}
              className="rounded bg-slate-950 border-slate-700 text-rose-600 focus:ring-0"
            />
            <span className="text-rose-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Filtrar solo llamadas extorsivas o de rescate
            </span>
          </label>

          <div className="flex items-center gap-3 text-slate-400">
            <span>Mostrando {filteredRecords.length} de {records.length} registros</span>
            <span className="text-slate-600">|</span>
            <span>Por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 py-0.5 px-2 rounded font-mono"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Forense */}
      <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 select-none">
              <tr>
                <th className="py-2.5 px-3">Fecha / Hora</th>
                <th className="py-2.5 px-3">Evento</th>
                <th className="py-2.5 px-3">Número A (Origen)</th>
                <th className="py-2.5 px-3">Número B (Destino)</th>
                <th className="py-2.5 px-3 text-right">Duración</th>
                <th className="py-2.5 px-3">Celda / Antena en Juárez</th>
                <th className="py-2.5 px-3 text-center">Azimut</th>
                <th className="py-2.5 px-3">IMEI / Equipo</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No se encontraron registros telefónicos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const labelA = labelMap.get(r.numberA.replace(/\D/g, ''));
                  const labelB = labelMap.get(r.numberB.replace(/\D/g, ''));
                  const isCritical = r.notes?.toLowerCase().includes('rescate') || r.notes?.toLowerCase().includes('exigencia');

                  return (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isCritical ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      {/* Fecha / Hora */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-white font-semibold">{r.date}</span>
                        <span className="text-slate-400 text-[11px] block">{r.time}</span>
                      </td>

                      {/* Evento */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          r.eventType.includes('VOZ_SALIENTE') ? 'text-blue-400 bg-blue-950/60 border border-blue-900' :
                          r.eventType.includes('VOZ_ENTRANTE') ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-900' :
                          r.eventType.includes('SMS') ? 'text-amber-400 bg-amber-950/60 border border-amber-900' :
                          'text-slate-400 bg-slate-800'
                        }`}>
                          {r.eventType.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Número A */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onNavigateToNumberAnalysis(r.numberA)}
                            className="font-bold text-slate-200 hover:text-blue-400 transition-colors tabular-nums"
                          >
                            {r.numberA}
                          </button>
                          {labelA && (
                            <span 
                              className="text-[10px] px-1 py-0.2 rounded truncate max-w-[110px]"
                              style={{ backgroundColor: `${labelA.color}25`, color: labelA.color }}
                              title={labelA.label}
                            >
                              {labelA.label}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Número B */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onNavigateToNumberAnalysis(r.numberB)}
                            className="font-bold text-slate-200 hover:text-blue-400 transition-colors tabular-nums"
                          >
                            {r.numberB}
                          </button>
                          {labelB && (
                            <span 
                              className="text-[10px] px-1 py-0.2 rounded truncate max-w-[110px]"
                              style={{ backgroundColor: `${labelB.color}25`, color: labelB.color }}
                              title={labelB.label}
                            >
                              {labelB.label}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duración */}
                      <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                        <span className={r.durationSeconds > 180 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {formatSeconds(r.durationSeconds)}
                        </span>
                      </td>

                      {/* Celda / Antena */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-slate-200 font-medium block truncate max-w-[200px]" title={r.towerName}>
                          {r.towerName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {r.towerId} · {r.operator}
                        </span>
                      </td>

                      {/* Azimut */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap tabular-nums">
                        <div className="inline-flex items-center gap-1 text-slate-300">
                          <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" style={{ transform: `rotate(${r.azimuth}deg)` }} />
                          <span>{r.azimuth}°</span>
                        </div>
                      </td>

                      {/* IMEI */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 text-[11px] tabular-nums">
                        {r.imei}
                      </td>

                      {/* Acciones */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenLabelModal(r.numberA)}
                            title="Etiquetar Número A"
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                          >
                            <Tags className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onNavigateToMapWithRecord(r)}
                            title="Localizar en Mapa de Cd. Juárez"
                            className="p-1 hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Página <span className="font-semibold text-white">{currentPage}</span> de{' '}
            <span className="font-semibold text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded flex items-center gap-1 text-slate-200"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded flex items-center gap-1 text-slate-200"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
